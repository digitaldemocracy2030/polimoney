package controllers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"crypto/sha256"
	"encoding/hex"
)

func TestUserController_Signup(t *testing.T) {
	// Set up Gin in test mode
	gin.SetMode(gin.TestMode)

	// Set up environment variable for PASSWORD_SALT
	originalSalt := os.Getenv("PASSWORD_SALT")
	os.Setenv("PASSWORD_SALT", "test_salt")
	defer os.Setenv("PASSWORD_SALT", originalSalt)

	t.Run("successful signup", func(t *testing.T) {
		db, dbMock := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create controller
		controller := NewAuthController(db)

		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		// Create request body
		requestBody := SignupRequest{
			Username: "testuser",
			Email:    "test@example.com",
			Password: "password123",
		}
		body, _ := json.Marshal(requestBody)

		// Set up the request
		c.Request = httptest.NewRequest(http.MethodPost, "/api/v1/signup", bytes.NewBuffer(body))
		c.Request.Header.Set("Content-Type", "application/json")

		// Set up mock expectations for user creation
		dbMock.ExpectBegin()
		dbMock.ExpectQuery("INSERT INTO \"users\"").
			WithArgs(
				"testuser", "test@example.com", 
				sqlmock.AnyArg(), // password hash
				2, // role_id
				true, false, nil,
				sqlmock.AnyArg(), sqlmock.AnyArg(),
			).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		dbMock.ExpectCommit()

		// Execute
		controller.Signup(c)

		// Assert
		assert.Equal(t, http.StatusOK, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "success", response["status"])
		assert.Equal(t, "ユーザー登録に成功しました", response["message"])

		// Check user data
		data, ok := response["data"].(map[string]interface{})
		assert.True(t, ok)
		assert.Equal(t, float64(1), data["id"])
		assert.Equal(t, "testuser", data["username"])
		assert.Equal(t, "test@example.com", data["email"])

		assert.NoError(t, dbMock.ExpectationsWereMet())
	})

	t.Run("invalid request body - missing email", func(t *testing.T) {
		db, _ := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create controller
		controller := NewAuthController(db)

		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		// Create invalid request body (missing email)
		requestBody := map[string]interface{}{
			"username": "testuser",
			"password": "password123",
		}
		body, _ := json.Marshal(requestBody)

		// Set up the request
		c.Request = httptest.NewRequest(http.MethodPost, "/api/v1/signup", bytes.NewBuffer(body))
		c.Request.Header.Set("Content-Type", "application/json")

		// Execute
		controller.Signup(c)

		// Assert
		assert.Equal(t, http.StatusBadRequest, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "error", response["status"])
		assert.Equal(t, "入力データが不正です", response["message"])
	})

	t.Run("invalid request body - invalid email format", func(t *testing.T) {
		db, _ := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create controller
		controller := NewAuthController(db)

		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		// Create invalid request body (invalid email format)
		requestBody := SignupRequest{
			Username: "testuser",
			Email:    "invalid-email",
			Password: "password123",
		}
		body, _ := json.Marshal(requestBody)

		// Set up the request
		c.Request = httptest.NewRequest(http.MethodPost, "/api/v1/signup", bytes.NewBuffer(body))
		c.Request.Header.Set("Content-Type", "application/json")

		// Execute
		controller.Signup(c)

		// Assert
		assert.Equal(t, http.StatusBadRequest, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "error", response["status"])
		assert.Equal(t, "入力データが不正です", response["message"])
	})

	t.Run("database error during signup", func(t *testing.T) {
		db, dbMock := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create controller
		controller := NewAuthController(db)

		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		// Create request body
		requestBody := SignupRequest{
			Username: "testuser",
			Email:    "test@example.com",
			Password: "password123",
		}
		body, _ := json.Marshal(requestBody)

		// Set up the request
		c.Request = httptest.NewRequest(http.MethodPost, "/api/v1/signup", bytes.NewBuffer(body))
		c.Request.Header.Set("Content-Type", "application/json")

		// Set up mock to return database error
		dbMock.ExpectBegin()
		dbMock.ExpectQuery("INSERT INTO \"users\"").
			WillReturnError(errors.New("database connection failed"))
		dbMock.ExpectRollback()

		// Execute
		controller.Signup(c)

		// Assert
		assert.Equal(t, http.StatusInternalServerError, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "error", response["status"])
		assert.Equal(t, "ユーザー登録に失敗しました", response["message"])

		assert.NoError(t, dbMock.ExpectationsWereMet())
	})
}

func TestUserController_Login(t *testing.T) {
	// Set up Gin in test mode
	gin.SetMode(gin.TestMode)

	// Set up environment variables
	originalSalt := os.Getenv("PASSWORD_SALT")
	originalJWT := os.Getenv("JWT_SECRET")
	os.Setenv("PASSWORD_SALT", "test_salt")
	os.Setenv("JWT_SECRET", "test_jwt_secret")
	defer func() {
		os.Setenv("PASSWORD_SALT", originalSalt)
		os.Setenv("JWT_SECRET", originalJWT)
	}()

	t.Run("successful login", func(t *testing.T) {
		db, dbMock := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create controller
		controller := NewAuthController(db)

		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		// Create request body
		requestBody := LoginRequest{
			Email:    "test@example.com",
			Password: "password123",
		}
		body, _ := json.Marshal(requestBody)

		// Set up the request
		c.Request = httptest.NewRequest(http.MethodPost, "/api/v1/login", bytes.NewBuffer(body))
		c.Request.Header.Set("Content-Type", "application/json")

		// Create a proper bcrypt hash for the test password
		// First, apply sha256 with salt
		sha256Hash := sha256.Sum256([]byte("password123" + "test_salt"))
		sha256String := hex.EncodeToString(sha256Hash[:])
		bcryptHash, _ := bcrypt.GenerateFromPassword([]byte(sha256String), 12)

		// Set up mock expectations for user retrieval
		now := time.Now()
		userRows := sqlmock.NewRows([]string{
			"id", "username", "email", "password_hash", "role_id",
			"is_active", "email_verified", "last_login", "created_at", "updated_at",
		}).AddRow(1, "testuser", "test@example.com", string(bcryptHash), 2, true, false, nil, now, now)

		dbMock.ExpectQuery("SELECT \\* FROM \"users\" WHERE email = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs("test@example.com", 1).
			WillReturnRows(userRows)

		// Mock for Role preload
		roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"}).
			AddRow(2, "user", "Regular user", now, now)

		dbMock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" = \\$1").
			WithArgs(2).
			WillReturnRows(roleRows)

		// Execute
		controller.Login(c)

		// Assert
		assert.Equal(t, http.StatusOK, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "success", response["status"])
		assert.Equal(t, "ログインに成功しました", response["message"])

		// Check data
		data, ok := response["data"].(map[string]interface{})
		assert.True(t, ok)
		assert.NotEmpty(t, data["token"])
		assert.NotNil(t, data["user"])

		assert.NoError(t, dbMock.ExpectationsWereMet())
	})

	t.Run("invalid request body - missing password", func(t *testing.T) {
		db, _ := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create controller
		controller := NewAuthController(db)

		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		// Create invalid request body (missing password)
		requestBody := map[string]interface{}{
			"email": "test@example.com",
		}
		body, _ := json.Marshal(requestBody)

		// Set up the request
		c.Request = httptest.NewRequest(http.MethodPost, "/api/v1/login", bytes.NewBuffer(body))
		c.Request.Header.Set("Content-Type", "application/json")

		// Execute
		controller.Login(c)

		// Assert
		assert.Equal(t, http.StatusBadRequest, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "error", response["status"])
		assert.Equal(t, "入力データが不正です", response["message"])
	})

	t.Run("user not found", func(t *testing.T) {
		db, dbMock := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create controller
		controller := NewAuthController(db)

		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		// Create request body
		requestBody := LoginRequest{
			Email:    "notfound@example.com",
			Password: "password123",
		}
		body, _ := json.Marshal(requestBody)

		// Set up the request
		c.Request = httptest.NewRequest(http.MethodPost, "/api/v1/login", bytes.NewBuffer(body))
		c.Request.Header.Set("Content-Type", "application/json")

		// Set up mock to return not found error
		dbMock.ExpectQuery("SELECT \\* FROM \"users\" WHERE email = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs("notfound@example.com", 1).
			WillReturnError(gorm.ErrRecordNotFound)

		// Execute
		controller.Login(c)

		// Assert
		assert.Equal(t, http.StatusUnauthorized, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "error", response["status"])
		assert.Equal(t, "ログインに失敗しました", response["message"])

		assert.NoError(t, dbMock.ExpectationsWereMet())
	})

	t.Run("wrong password", func(t *testing.T) {
		db, dbMock := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create controller
		controller := NewAuthController(db)

		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		// Create request body
		requestBody := LoginRequest{
			Email:    "test@example.com",
			Password: "wrongpassword",
		}
		body, _ := json.Marshal(requestBody)

		// Set up the request
		c.Request = httptest.NewRequest(http.MethodPost, "/api/v1/login", bytes.NewBuffer(body))
		c.Request.Header.Set("Content-Type", "application/json")

		// Create a proper bcrypt hash for a different password
		sha256Hash := sha256.Sum256([]byte("password123" + "test_salt"))
		sha256String := hex.EncodeToString(sha256Hash[:])
		bcryptHash, _ := bcrypt.GenerateFromPassword([]byte(sha256String), 12)

		// Set up mock expectations for user retrieval
		now := time.Now()
		userRows := sqlmock.NewRows([]string{
			"id", "username", "email", "password_hash", "role_id",
			"is_active", "email_verified", "last_login", "created_at", "updated_at",
		}).AddRow(1, "testuser", "test@example.com", string(bcryptHash), 2, true, false, nil, now, now)

		dbMock.ExpectQuery("SELECT \\* FROM \"users\" WHERE email = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs("test@example.com", 1).
			WillReturnRows(userRows)

		// Mock for Role preload
		roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"}).
			AddRow(2, "user", "Regular user", now, now)

		dbMock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" = \\$1").
			WithArgs(2).
			WillReturnRows(roleRows)

		// Execute
		controller.Login(c)

		// Assert
		assert.Equal(t, http.StatusUnauthorized, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "error", response["status"])
		assert.Equal(t, "ログインに失敗しました", response["message"])

		assert.NoError(t, dbMock.ExpectationsWereMet())
	})

	t.Run("database error during login", func(t *testing.T) {
		db, dbMock := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create controller
		controller := NewAuthController(db)

		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		// Create request body
		requestBody := LoginRequest{
			Email:    "test@example.com",
			Password: "password123",
		}
		body, _ := json.Marshal(requestBody)

		// Set up the request
		c.Request = httptest.NewRequest(http.MethodPost, "/api/v1/login", bytes.NewBuffer(body))
		c.Request.Header.Set("Content-Type", "application/json")

		// Set up mock to return database error
		dbMock.ExpectQuery("SELECT \\* FROM \"users\" WHERE email = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs("test@example.com", 1).
			WillReturnError(sql.ErrConnDone)

		// Execute
		controller.Login(c)

		// Assert
		assert.Equal(t, http.StatusUnauthorized, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "error", response["status"])
		assert.Equal(t, "ログインに失敗しました", response["message"])

		assert.NoError(t, dbMock.ExpectationsWereMet())
	})
}

func TestNewAuthController(t *testing.T) {
	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	controller := NewAuthController(db)

	assert.NotNil(t, controller)
	assert.NotNil(t, controller.userMiddleware)

	assert.NoError(t, mock.ExpectationsWereMet())
}