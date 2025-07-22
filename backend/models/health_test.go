package models

import (
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHealthRepository_CheckConnection(t *testing.T) {
	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	repo := NewHealthRepository(db)

	t.Run("successful connection", func(t *testing.T) {
		// Set up mock expectations
		mock.ExpectPing()

		// Execute
		err := repo.CheckConnection()

		// Assert
		assert.NoError(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("connection failure", func(t *testing.T) {
		// Set up mock expectations
		mock.ExpectPing().WillReturnError(sql.ErrConnDone)

		// Execute
		err := repo.CheckConnection()

		// Assert
		assert.Error(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestHealthRepository_GetDBStats(t *testing.T) {
	db, _ := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	repo := NewHealthRepository(db)

	t.Run("successful stats retrieval", func(t *testing.T) {
		// Execute
		stats, err := repo.GetDBStats()

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, stats)
		
		// Check that all expected keys are present
		expectedKeys := []string{
			"open_connections",
			"in_use",
			"idle",
			"wait_count",
			"wait_duration",
			"max_idle_closed",
			"max_idle_time_closed",
			"max_lifetime_closed",
		}
		
		for _, key := range expectedKeys {
			assert.Contains(t, stats, key)
		}
		
		// Check that numeric values are valid
		assert.GreaterOrEqual(t, stats["open_connections"], 0)
		assert.GreaterOrEqual(t, stats["in_use"], 0)
		assert.GreaterOrEqual(t, stats["idle"], 0)
		assert.GreaterOrEqual(t, stats["wait_count"], int64(0))
		assert.GreaterOrEqual(t, stats["max_idle_closed"], int64(0))
		assert.GreaterOrEqual(t, stats["max_idle_time_closed"], int64(0))
		assert.GreaterOrEqual(t, stats["max_lifetime_closed"], int64(0))
		
		// Check that wait_duration is a string
		_, ok := stats["wait_duration"].(string)
		assert.True(t, ok)
	})
}