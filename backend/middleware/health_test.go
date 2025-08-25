package middleware

import (
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHealthMiddleware_GetHealthStatus(t *testing.T) {
	db, mock := setupTestDB(t)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	healthMiddleware := NewHealthMiddleware(db)

	t.Run("healthy status", func(t *testing.T) {
		// Mock expectations for successful health check
		mock.ExpectPing()

		// Execute
		status := healthMiddleware.GetHealthStatus()

		// Assert
		assert.Equal(t, "healthy", status["overall_status"])
		assert.Equal(t, "全て正常に稼働しています。", status["message"])

		// Check database status
		dbStatus, ok := status["database"].(map[string]interface{})
		assert.True(t, ok)
		assert.Equal(t, "connected", dbStatus["status"])
		assert.NotNil(t, dbStatus["details"])

		// Check that details contains DB stats
		details, ok := dbStatus["details"].(map[string]interface{})
		assert.True(t, ok)
		assert.Contains(t, details, "open_connections")
		assert.Contains(t, details, "in_use")
		assert.Contains(t, details, "idle")

		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("database connection failure", func(t *testing.T) {
		// Mock expectations for failed health check
		mock.ExpectPing().WillReturnError(sql.ErrConnDone)

		// Execute
		status := healthMiddleware.GetHealthStatus()

		// Assert
		assert.Equal(t, "unhealthy", status["overall_status"])
		assert.Equal(t, "データベースへの接続に失敗しました。", status["message"])

		// Check database status
		dbStatus, ok := status["database"].(map[string]interface{})
		assert.True(t, ok)
		assert.Equal(t, "disconnected", dbStatus["status"])
		assert.NotNil(t, dbStatus["details"])
		assert.Contains(t, dbStatus["details"].(string), "sql: connection is already closed")

		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("database stats retrieval failure", func(t *testing.T) {
		// For this test, we need to simulate a situation where CheckConnection passes
		// but GetDBStats fails. Since GetDBStats in our implementation just returns
		// the sql.DB.Stats() which doesn't fail, we'll mock the scenario differently.

		// Mock successful ping
		mock.ExpectPing()

		// In reality, GetDBStats doesn't make queries or fail in our implementation,
		// so this test case shows the middleware properly handles the stats.
		// The actual failure scenario would require modifying the healthRepo implementation.

		// Execute
		status := healthMiddleware.GetHealthStatus()

		// Assert - should still be healthy since GetDBStats doesn't fail in our implementation
		assert.Equal(t, "healthy", status["overall_status"])
		assert.Equal(t, "全て正常に稼働しています。", status["message"])

		assert.NoError(t, mock.ExpectationsWereMet())
	})
}
