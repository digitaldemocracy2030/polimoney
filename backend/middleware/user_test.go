package middleware

import (
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestUserMiddleware_GetAllUsers(t *testing.T) {
	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	userMiddleware := NewUserMiddleware(db)

	t.Run("successful retrieval", func(t *testing.T) {
		now := time.Now()

		// Mock data
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
		users, err := userMiddleware.GetAllUsers()

		// Assert
		assert.NoError(t, err)
		assert.Len(t, users, 2)
		assert.Equal(t, "admin", users[0].Username)
		assert.Equal(t, "user1", users[1].Username)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("database error", func(t *testing.T) {
		// Mock expectations
		mock.ExpectQuery("SELECT \\* FROM \"users\" ORDER BY created_at DESC").
			WillReturnError(gorm.ErrInvalidDB)

		// Execute
		users, err := userMiddleware.GetAllUsers()

		// Assert
		assert.Error(t, err)
		assert.Nil(t, users)
		assert.Equal(t, gorm.ErrInvalidDB, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("empty result", func(t *testing.T) {
		// Mock data - empty result set
		rows := sqlmock.NewRows([]string{
			"id", "username", "email", "password_hash", "role_id",
			"is_active", "email_verified", "last_login", "created_at", "updated_at",
		})

		mock.ExpectQuery("SELECT \\* FROM \"users\" ORDER BY created_at DESC").
			WillReturnRows(rows)

		// No role preload query expected for empty result

		// Execute
		users, err := userMiddleware.GetAllUsers()

		// Assert
		assert.NoError(t, err)
		assert.Empty(t, users)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestUserMiddleware_GetUserByID(t *testing.T) {
	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	userMiddleware := NewUserMiddleware(db)

	t.Run("successful retrieval", func(t *testing.T) {
		idStr := "1"
		now := time.Now()

		// Mock data
		rows := sqlmock.NewRows([]string{
			"id", "username", "email", "password_hash", "role_id",
			"is_active", "email_verified", "last_login", "created_at", "updated_at",
		}).AddRow(1, "admin", "admin@example.com", "hash1", 1, true, true, &now, now, now)

		mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE \"users\".\"id\" = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(1, 1).
			WillReturnRows(rows)

		// Mock for Role preload
		roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"}).
			AddRow(1, "admin", "Administrator", now, now)

		mock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" = \\$1").
			WithArgs(1).
			WillReturnRows(roleRows)

		// Execute
		user, err := userMiddleware.GetUserByID(idStr)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, uint(1), user.ID)
		assert.Equal(t, "admin", user.Username)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("empty ID", func(t *testing.T) {
		// Execute
		user, err := userMiddleware.GetUserByID("")

		// Assert
		assert.Error(t, err)
		assert.Nil(t, user)
		assert.Contains(t, err.Error(), "ユーザーIDが空です")
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("non-numeric ID", func(t *testing.T) {
		// Execute
		user, err := userMiddleware.GetUserByID("abc")

		// Assert
		assert.Error(t, err)
		assert.Nil(t, user)
		assert.Contains(t, err.Error(), "ユーザーIDが数値ではありません")
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("zero ID", func(t *testing.T) {
		// Execute
		user, err := userMiddleware.GetUserByID("0")

		// Assert
		assert.Error(t, err)
		assert.Nil(t, user)
		assert.Contains(t, err.Error(), "ユーザーIDは正の整数である必要があります")
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("negative ID", func(t *testing.T) {
		// Execute
		user, err := userMiddleware.GetUserByID("-1")

		// Assert
		assert.Error(t, err)
		assert.Nil(t, user)
		assert.Contains(t, err.Error(), "ユーザーIDは正の整数である必要があります")
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("user not found", func(t *testing.T) {
		idStr := "999"

		mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE \"users\".\"id\" = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(999, 1).
			WillReturnError(gorm.ErrRecordNotFound)

		// Execute
		user, err := userMiddleware.GetUserByID(idStr)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, user)
		assert.Equal(t, gorm.ErrRecordNotFound, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("database error", func(t *testing.T) {
		idStr := "1"

		mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE \"users\".\"id\" = \\$1 ORDER BY \"users\".\"id\" LIMIT \\$2").
			WithArgs(1, 1).
			WillReturnError(gorm.ErrInvalidDB)

		// Execute
		user, err := userMiddleware.GetUserByID(idStr)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, user)
		assert.Equal(t, gorm.ErrInvalidDB, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}