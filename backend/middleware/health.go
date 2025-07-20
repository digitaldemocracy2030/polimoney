package middleware

import (
	"github.com/digitaldemocracy2030/polimoney/models"
	"gorm.io/gorm"
)

// HealthMiddleware はヘルスチェック関連のミドルウェア機能を提供
type HealthMiddleware struct {
	healthRepo *models.HealthRepository
	db         *gorm.DB
}

// NewHealthMiddleware は新しいHealthMiddlewareを作成
func NewHealthMiddleware(db *gorm.DB) *HealthMiddleware {
	healthRepo := models.NewHealthRepository(db)
	return &HealthMiddleware{
		healthRepo: healthRepo,
		db:         db,
	}
}

// GetHealthStatus は総合的なヘルスステータスを取得するメソッド
func (hm *HealthMiddleware) GetHealthStatus() map[string]interface{} {
	result := map[string]interface{}{
		"overall_status": "healthy",
		"message": "全て正常に稼働しています。",
		"database": map[string]interface{}{
			"status": "connected",
			"details": nil,
		},
	}

	// データベース接続チェック
	connection := hm.healthRepo.CheckConnection()
	if connection != nil {
		result["overall_status"] = "unhealthy"
		result["message"] = "データベースへの接続に失敗しました。"
		result["database"] = map[string]interface{}{
			"status": "disconnected",
			"details": connection.Error(),
		}
		return result
	}

	// データベース統計情報を追加
	dbStats, err := hm.healthRepo.GetDBStats()
	if err != nil {
		result["overall_status"] = "unhealthy"
		result["message"] = "データベース統計情報の取得に失敗しました。"
		result["database"] = map[string]interface{}{
			"status": "connected",
			"details": err.Error(),
		}
		return result
	}

	// 正常時は統計情報を格納
	result["database"] = map[string]interface{}{
		"status": "connected",
		"details": dbStats,
	}

	return result
}
