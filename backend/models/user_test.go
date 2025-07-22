package models

import (
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
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

func TestUserRepository_GetAllUsers(t *testing.T) {
	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	repo := NewUserRepository(db)

	t.Run("successful retrieval", func(t *testing.T) {
		// Set up mock expectations
		now := time.Now()
		
		// Mock for main query
		rows := sqlmock.NewRows([]string{
			"id", "username", "email", "password_hash", "role_id",
			"is_active", "email_verified", "last_login", "created_at", "updated_at",
		}).
			AddRow(1, "admin", "admin@example.com", "hash1", 1, true, true, &now, now, now).
			AddRow(2, "user1", "user1@example.com", "hash2", 2, true, false, nil, now, now)

		mock.ExpectQuery("SELECT \\* FROM \"users\" ORDER BY created_at DESC").
			WillReturnRows(rows)

		// Mock for Role preload
		roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"}).
			AddRow(1, "admin", "Administrator", now, now).
			AddRow(2, "user", "Regular user", now, now)

		mock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" IN").
			WillReturnRows(roleRows)

		// Execute
		users, err := repo.GetAllUsers()

		// Assert
		assert.NoError(t, err)
		assert.Len(t, users, 2)
		assert.Equal(t, "admin", users[0].Username)
		assert.Equal(t, "user1", users[1].Username)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("database error", func(t *testing.T) {
		// Set up mock expectations
		mock.ExpectQuery("SELECT \\* FROM \"users\" ORDER BY created_at DESC").
			WillReturnError(gorm.ErrInvalidDB)

		// Execute
		users, err := repo.GetAllUsers()

		// Assert
		assert.Error(t, err)
		assert.Nil(t, users)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestUserRepository_GetUserByID(t *testing.T) {
	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	repo := NewUserRepository(db)

	t.Run("user found", func(t *testing.T) {
		// Set up mock expectations
		now := time.Now()
		userID := 1

		// Mock for main query
		rows := sqlmock.NewRows([]string{
			"id", "username", "email", "password_hash", "role_id",
			"is_active", "email_verified", "last_login", "created_at", "updated_at",
		}).AddRow(userID, "admin", "admin@example.com", "hash1", 1, true, true, &now, now, now)

		mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE \"users\".\"id\" = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(userID, 1).
			WillReturnRows(rows)

		// Mock for Role preload
		roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"}).
			AddRow(1, "admin", "Administrator", now, now)

		mock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" = \\$1").
			WithArgs(1).
			WillReturnRows(roleRows)

		// Execute
		user, err := repo.GetUserByID(userID)

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, uint(userID), user.ID)
		assert.Equal(t, "admin", user.Username)
		assert.Equal(t, "admin", user.Role.Name)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("user not found", func(t *testing.T) {
		// Set up mock expectations
		userID := 999

		mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE \"users\".\"id\" = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(userID, 1).
			WillReturnError(gorm.ErrRecordNotFound)

		// Execute
		user, err := repo.GetUserByID(userID)

		// Assert
		assert.Error(t, err)
		assert.Equal(t, gorm.ErrRecordNotFound, err)
		assert.Equal(t, User{}, user)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestUserRepository_GetUserByEmail(t *testing.T) {
	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	repo := NewUserRepository(db)

	t.Run("user found", func(t *testing.T) {
		// Set up mock expectations
		now := time.Now()
		email := "admin@example.com"

		// Mock for main query
		rows := sqlmock.NewRows([]string{
			"id", "username", "email", "password_hash", "role_id",
			"is_active", "email_verified", "last_login", "created_at", "updated_at",
		}).AddRow(1, "admin", email, "hash1", 1, true, true, &now, now, now)

		mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE email = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(email, 1).
			WillReturnRows(rows)

		// Mock for Role preload
		roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"}).
			AddRow(1, "admin", "Administrator", now, now)

		mock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" = \\$1").
			WithArgs(1).
			WillReturnRows(roleRows)

		// Execute
		user, err := repo.GetUserByEmail(email)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, email, user.Email)
		assert.Equal(t, "admin", user.Username)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("user not found", func(t *testing.T) {
		// Set up mock expectations
		email := "notfound@example.com"

		mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE email = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(email, 1).
			WillReturnError(gorm.ErrRecordNotFound)

		// Execute
		user, err := repo.GetUserByEmail(email)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, user)
		assert.Equal(t, gorm.ErrRecordNotFound, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestUserRepository_CreateUser(t *testing.T) {
	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	repo := NewUserRepository(db)

	t.Run("successful creation", func(t *testing.T) {
		// Set up test data
		now := time.Now()
		user := &User{
			Username:      "newuser",
			Email:         "newuser@example.com",
			PasswordHash:  "hashed_password",
			RoleID:        2,
			IsActive:      true,
			EmailVerified: false,
			CreatedAt:     now,
			UpdatedAt:     now,
		}

		// Set up mock expectations
		mock.ExpectBegin()
		mock.ExpectQuery("INSERT INTO \"users\"").
			WithArgs(
				user.Username, user.Email, user.PasswordHash, user.RoleID,
				user.IsActive, user.EmailVerified, nil,
				sqlmock.AnyArg(), sqlmock.AnyArg(),
			).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mock.ExpectCommit()

		// Execute
		err := repo.CreateUser(user)

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, uint(1), user.ID)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("database error", func(t *testing.T) {
		// Set up test data
		user := &User{
			Username:     "newuser",
			Email:        "newuser@example.com",
			PasswordHash: "hashed_password",
			RoleID:       2,
		}

		// Set up mock expectations
		mock.ExpectBegin()
		mock.ExpectQuery("INSERT INTO \"users\"").
			WillReturnError(gorm.ErrInvalidData)
		mock.ExpectRollback()

		// Execute
		err := repo.CreateUser(user)

		// Assert
		assert.Error(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestUserRepository_UpdateUser(t *testing.T) {
	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	repo := NewUserRepository(db)

	t.Run("successful update", func(t *testing.T) {
		// Set up test data
		now := time.Now()
		user := &User{
			ID:            1,
			Username:      "updateduser",
			Email:         "updated@example.com",
			PasswordHash:  "new_hash",
			RoleID:        1,
			IsActive:      true,
			EmailVerified: true,
			LastLogin:     &now,
			CreatedAt:     now.Add(-24 * time.Hour),
			UpdatedAt:     now,
		}

		// Set up mock expectations
		mock.ExpectBegin()
		mock.ExpectExec("UPDATE \"users\" SET").
			WithArgs(
				user.Username, user.Email, user.PasswordHash, user.RoleID,
				user.IsActive, user.EmailVerified, user.LastLogin,
				user.CreatedAt, sqlmock.AnyArg(), user.ID,
			).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		// Execute
		err := repo.UpdateUser(user)

		// Assert
		assert.NoError(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestUserRepository_DeleteUser(t *testing.T) {
	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	repo := NewUserRepository(db)

	t.Run("successful deletion", func(t *testing.T) {
		// Set up test data
		userID := uint(1)

		// Set up mock expectations
		mock.ExpectBegin()
		mock.ExpectExec("DELETE FROM \"users\" WHERE \"users\".\"id\" = \\$1").
			WithArgs(userID).
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectCommit()

		// Execute
		err := repo.DeleteUser(userID)

		// Assert
		assert.NoError(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("user not found", func(t *testing.T) {
		// Set up test data
		userID := uint(999)

		// Set up mock expectations
		mock.ExpectBegin()
		mock.ExpectExec("DELETE FROM \"users\" WHERE \"users\".\"id\" = \\$1").
			WithArgs(userID).
			WillReturnResult(sqlmock.NewResult(0, 0))
		mock.ExpectCommit()

		// Execute
		err := repo.DeleteUser(userID)

		// Assert
		assert.NoError(t, err) // GORM doesn't return error for no rows affected
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}