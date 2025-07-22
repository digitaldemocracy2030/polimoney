package controllers

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/digitaldemocracy2030/polimoney/models"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

// MockUserMiddleware is a mock implementation of UserMiddleware
type MockUserMiddleware struct {
	mock.Mock
}

func (m *MockUserMiddleware) GetAllUsers() ([]models.User, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.User), args.Error(1)
}

func (m *MockUserMiddleware) GetUserByID(idStr string) (*models.User, error) {
	args := m.Called(idStr)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func TestUserController_GetAllUsers(t *testing.T) {
	// Set up Gin in test mode
	gin.SetMode(gin.TestMode)

	t.Run("successful retrieval", func(t *testing.T) {
		db, dbMock := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create mock users
		now := time.Now()
		mockUsers := []models.User{
			{
				ID:       1,
				Username: "user1",
				Email:    "user1@example.com",
				Role: models.Role{
					ID:   2,
					Name: "user",
				},
				CreatedAt: now,
				UpdatedAt: now,
			},
			{
				ID:       2,
				Username: "user2",
				Email:    "user2@example.com",
				Role: models.Role{
					ID:   2,
					Name: "user",
				},
				CreatedAt: now,
				UpdatedAt: now,
			},
		}

		// Set up mock expectations
		rows := sqlmock.NewRows([]string{
			"id", "username", "email", "password_hash", "role_id",
			"is_active", "email_verified", "last_login", "created_at", "updated_at",
		})
		for _, user := range mockUsers {
			rows.AddRow(user.ID, user.Username, user.Email, "hash", 2, true, false, nil, user.CreatedAt, user.UpdatedAt)
		}

		dbMock.ExpectQuery("SELECT \\* FROM \"users\" ORDER BY created_at DESC").
			WillReturnRows(rows)

		// Mock for Role preload
		roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"}).
			AddRow(2, "user", "Regular user", now, now)

		// Mock for Role preload - When multiple users have the same role_id,
		// GORM optimizes by using individual queries for each unique role_id
		dbMock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" = \\$1").
			WithArgs(2).
			WillReturnRows(roleRows)

		// Create controller
		controller := NewUserController(db)

		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		// Execute
		controller.GetAllUsers(c)

		// Assert
		assert.Equal(t, http.StatusOK, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "success", response["status"])
		assert.Equal(t, float64(2), response["count"])

		// Check users data
		data, ok := response["data"].([]interface{})
		assert.True(t, ok)
		assert.Len(t, data, 2)

		assert.NoError(t, dbMock.ExpectationsWereMet())
	})

	t.Run("database error", func(t *testing.T) {
		db, dbMock := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Set up mock to return error
		dbMock.ExpectQuery("SELECT \\* FROM \"users\" ORDER BY created_at DESC").
			WillReturnError(errors.New("database connection failed"))

		// Create controller
		controller := NewUserController(db)

		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		// Execute
		controller.GetAllUsers(c)

		// Assert
		assert.Equal(t, http.StatusInternalServerError, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "データベースエラー", response["error"])
		assert.Equal(t, "middleware/user.go GetAllUsers でエラーが発生しました", response["message"])
		assert.Contains(t, response["details"], "database connection failed")

		assert.NoError(t, dbMock.ExpectationsWereMet())
	})

	t.Run("empty result", func(t *testing.T) {
		db, dbMock := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Set up mock to return empty result
		rows := sqlmock.NewRows([]string{
			"id", "username", "email", "password_hash", "role_id",
			"is_active", "email_verified", "last_login", "created_at", "updated_at",
		})

		dbMock.ExpectQuery("SELECT \\* FROM \"users\" ORDER BY created_at DESC").
			WillReturnRows(rows)

		// Create controller
		controller := NewUserController(db)

		// Create test context
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		// Execute
		controller.GetAllUsers(c)

		// Assert
		assert.Equal(t, http.StatusOK, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "success", response["status"])
		assert.Equal(t, float64(0), response["count"])

		assert.NoError(t, dbMock.ExpectationsWereMet())
	})
}

func TestUserController_GetUserByID(t *testing.T) {
	// Set up Gin in test mode
	gin.SetMode(gin.TestMode)

	t.Run("successful retrieval", func(t *testing.T) {
		db, dbMock := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create mock user
		now := time.Now()
		mockUser := models.User{
			ID:       1,
			Username: "testuser",
			Email:    "test@example.com",
			Role: models.Role{
				ID:   2,
				Name: "user",
			},
			CreatedAt: now,
			UpdatedAt: now,
		}

		// Set up mock expectations
		rows := sqlmock.NewRows([]string{
			"id", "username", "email", "password_hash", "role_id",
			"is_active", "email_verified", "last_login", "created_at", "updated_at",
		}).AddRow(mockUser.ID, mockUser.Username, mockUser.Email, "hash", 2, true, false, nil, mockUser.CreatedAt, mockUser.UpdatedAt)

		dbMock.ExpectQuery("SELECT \\* FROM \"users\" WHERE \"users\".\"id\" = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(1, 1).
			WillReturnRows(rows)

		// Mock for Role preload
		roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"}).
			AddRow(2, "user", "Regular user", now, now)

		dbMock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" = \\$1").
			WithArgs(2).
			WillReturnRows(roleRows)

		// Create controller
		controller := NewUserController(db)

		// Create test context with parameter
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Params = gin.Params{
			{Key: "id", Value: "1"},
		}

		// Execute
		controller.GetUserByID(c)

		// Assert
		assert.Equal(t, http.StatusOK, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "success", response["status"])

		// Check user data
		userData, ok := response["data"].(map[string]interface{})
		assert.True(t, ok)
		assert.Equal(t, float64(1), userData["id"])
		assert.Equal(t, "testuser", userData["username"])
		assert.Equal(t, "test@example.com", userData["email"])

		assert.NoError(t, dbMock.ExpectationsWereMet())
	})

	t.Run("empty ID parameter", func(t *testing.T) {
		db, _ := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create controller
		controller := NewUserController(db)

		// Create test context with empty parameter
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Params = gin.Params{
			{Key: "id", Value: ""},
		}

		// Execute
		controller.GetUserByID(c)

		// Assert
		assert.Equal(t, http.StatusBadRequest, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "無効なリクエスト", response["error"])
		assert.Equal(t, "ユーザーIDが指定されていません", response["message"])
	})

	t.Run("user not found", func(t *testing.T) {
		db, dbMock := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Set up mock to return not found error
		dbMock.ExpectQuery("SELECT \\* FROM \"users\" WHERE \"users\".\"id\" = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(999, 1).
			WillReturnError(gorm.ErrRecordNotFound)

		// Create controller
		controller := NewUserController(db)

		// Create test context with parameter
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Params = gin.Params{
			{Key: "id", Value: "999"},
		}

		// Execute
		controller.GetUserByID(c)

		// Assert
		assert.Equal(t, http.StatusNotFound, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "ユーザーが見つかりません", response["error"])
		assert.Equal(t, "middleware/user.go GetUserByID でエラーが発生しました", response["message"])

		assert.NoError(t, dbMock.ExpectationsWereMet())
	})

	t.Run("invalid ID format", func(t *testing.T) {
		db, _ := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Create controller
		controller := NewUserController(db)

		// Create test context with invalid ID
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Params = gin.Params{
			{Key: "id", Value: "abc"},
		}

		// Execute
		controller.GetUserByID(c)

		// Assert
		assert.Equal(t, http.StatusInternalServerError, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "データベースエラー", response["error"])
		assert.Contains(t, response["details"], "ユーザーIDが数値ではありません")
	})

	t.Run("database error", func(t *testing.T) {
		db, dbMock := setupTestDB(t)
		defer func() {
			sqlDB, _ := db.DB()
			sqlDB.Close()
		}()

		// Set up mock to return database error
		dbMock.ExpectQuery("SELECT \\* FROM \"users\" WHERE \"users\".\"id\" = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(1, 1).
			WillReturnError(errors.New("database connection failed"))

		// Create controller
		controller := NewUserController(db)

		// Create test context with parameter
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Params = gin.Params{
			{Key: "id", Value: "1"},
		}

		// Execute
		controller.GetUserByID(c)

		// Assert
		assert.Equal(t, http.StatusInternalServerError, w.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "データベースエラー", response["error"])
		assert.Equal(t, "middleware/user.go GetUserByID でエラーが発生しました", response["message"])
		assert.Contains(t, response["details"], "database connection failed")

		assert.NoError(t, dbMock.ExpectationsWereMet())
	})
}

func TestNewUserController(t *testing.T) {
	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	controller := NewUserController(db)
	
	assert.NotNil(t, controller)
	assert.NotNil(t, controller.userMiddleware)
	
	assert.NoError(t, mock.ExpectationsWereMet())
}