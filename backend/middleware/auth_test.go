package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"os"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/digitaldemocracy2030/polimoney/models"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// setupTestDB creates a mock database for testing
func setupTestDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock) {
	mockDB, mock, err := sqlmock.New(sqlmock.MonitorPingsOption(true))
	assert.NoError(t, err)

	dialector := postgres.New(postgres.Config{
		Conn:       mockDB,
		DriverName: "postgres",
	})

	// Expect the ping that GORM does when opening the connection
	mock.ExpectPing()

	db, err := gorm.Open(dialector, &gorm.Config{})
	assert.NoError(t, err)

	return db, mock
}

func TestUserMiddleware_Signup(t *testing.T) {
	// Set up environment
	originalSalt := os.Getenv("PASSWORD_SALT")
	os.Setenv("PASSWORD_SALT", "test-salt")
	defer os.Setenv("PASSWORD_SALT", originalSalt)

	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	userRepo := models.NewUserRepository(db)
	userMiddleware := &UserMiddleware{userRepo: userRepo}

	t.Run("successful signup", func(t *testing.T) {
		username := "newuser"
		email := "newuser@example.com"
		password := "password123"

		// Mock expectations
		mock.ExpectBegin()
		mock.ExpectQuery("INSERT INTO \"users\"").
			WithArgs(
				username, email, sqlmock.AnyArg(), // password hash will vary
				2,                                  // roleID
				true, false, nil,                   // isActive, emailVerified, lastLogin
				sqlmock.AnyArg(), sqlmock.AnyArg(), // createdAt, updatedAt
			).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mock.ExpectCommit()

		// Execute
		user, err := userMiddleware.Signup(username, email, password)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, username, user.Username)
		assert.Equal(t, email, user.Email)
		assert.Equal(t, uint(2), user.RoleID)
		assert.NotEmpty(t, user.PasswordHash)
		
		// Verify password was hashed correctly
		assert.NotEqual(t, password, user.PasswordHash)
		assert.True(t, len(user.PasswordHash) > 50) // bcrypt hashes are typically 60 chars
		
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("database error during signup", func(t *testing.T) {
		username := "newuser"
		email := "newuser@example.com"
		password := "password123"

		// Mock expectations
		mock.ExpectBegin()
		mock.ExpectQuery("INSERT INTO \"users\"").
			WillReturnError(gorm.ErrDuplicatedKey)
		mock.ExpectRollback()

		// Execute
		user, err := userMiddleware.Signup(username, email, password)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, user)
		assert.Contains(t, err.Error(), "ユーザーの作成に失敗しました")
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("empty password", func(t *testing.T) {
		username := "newuser"
		email := "newuser@example.com"
		password := ""

		// Mock expectations
		mock.ExpectBegin()
		mock.ExpectQuery("INSERT INTO \"users\"").
			WithArgs(
				username, email, sqlmock.AnyArg(),
				2, true, false, nil,
				sqlmock.AnyArg(), sqlmock.AnyArg(),
			).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mock.ExpectCommit()

		// Execute
		user, err := userMiddleware.Signup(username, email, password)

		// Assert - empty password should still work (hash the empty string)
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestUserMiddleware_Login(t *testing.T) {
	// Set up environment
	originalSalt := os.Getenv("PASSWORD_SALT")
	originalJWTSecret := os.Getenv("JWT_SECRET")
	os.Setenv("PASSWORD_SALT", "test-salt")
	os.Setenv("JWT_SECRET", "test-secret")
	defer func() {
		os.Setenv("PASSWORD_SALT", originalSalt)
		os.Setenv("JWT_SECRET", originalJWTSecret)
	}()

	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	userRepo := models.NewUserRepository(db)
	userMiddleware := &UserMiddleware{userRepo: userRepo}

	// Create a valid password hash for testing
	password := "password123"
	salt := os.Getenv("PASSWORD_SALT")
	sha256Hash := createSHA256Hash(password + salt)
	bcryptHash, _ := bcrypt.GenerateFromPassword([]byte(sha256Hash), 12)

	t.Run("successful login", func(t *testing.T) {
		email := "user@example.com"
		userID := uint(1)
		now := time.Now()

		// Mock user data
		rows := sqlmock.NewRows([]string{
			"id", "username", "email", "password_hash", "role_id",
			"is_active", "email_verified", "last_login", "created_at", "updated_at",
		}).AddRow(
			userID, "testuser", email, string(bcryptHash), 2,
			true, true, nil, now, now,
		)

		// Mock expectations
		mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE email = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(email, 1).
			WillReturnRows(rows)

		// Mock for Role preload
		roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"}).
			AddRow(2, "user", "Regular user", now, now)

		mock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" = \\$1").
			WithArgs(2).
			WillReturnRows(roleRows)

		// Execute
		user, token, err := userMiddleware.Login(email, password)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.NotEmpty(t, token)
		assert.Equal(t, email, user.Email)
		assert.Equal(t, userID, user.ID)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("user not found", func(t *testing.T) {
		email := "notfound@example.com"

		// Mock expectations
		mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE email = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(email, 1).
			WillReturnError(gorm.ErrRecordNotFound)

		// Execute
		user, token, err := userMiddleware.Login(email, password)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, user)
		assert.Empty(t, token)
		assert.Contains(t, err.Error(), "emailもしくはパスワードが正しくありません")
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("incorrect password", func(t *testing.T) {
		email := "user@example.com"
		incorrectPassword := "wrongpassword"
		now := time.Now()

		// Mock user data with valid hash
		rows := sqlmock.NewRows([]string{
			"id", "username", "email", "password_hash", "role_id",
			"is_active", "email_verified", "last_login", "created_at", "updated_at",
		}).AddRow(
			1, "testuser", email, string(bcryptHash), 2,
			true, true, nil, now, now,
		)

		// Mock expectations
		mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE email = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(email, 1).
			WillReturnRows(rows)

		// Mock for Role preload
		roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"}).
			AddRow(2, "user", "Regular user", now, now)

		mock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" = \\$1").
			WithArgs(2).
			WillReturnRows(roleRows)

		// Execute
		user, token, err := userMiddleware.Login(email, incorrectPassword)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, user)
		assert.Empty(t, token)
		assert.Contains(t, err.Error(), "emailもしくはパスワードが正しくありません")
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	// Skip JWT generation error test as GenerateJWT will still work with empty secret
	// The function doesn't validate JWT_SECRET being empty
}

// Helper function to create SHA256 hash
func createSHA256Hash(input string) string {
	h := sha256.New()
	h.Write([]byte(input))
	return hex.EncodeToString(h.Sum(nil))
}