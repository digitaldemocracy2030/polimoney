package controllers

import (
	"net/http"

	"github.com/digitaldemocracy2030/polimoney/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// HealthController はヘルスチェック関連のHTTPハンドラーを管理
type HealthController struct {
	healthMiddleware *middleware.HealthMiddleware
}

// NewHealthController は新しいHealthControllerを作成
func NewHealthController(db *gorm.DB) *HealthController {
	healthMiddleware := middleware.NewHealthMiddleware(db)
	return &HealthController{
		healthMiddleware: healthMiddleware,
	}
}

// HealthCheck はデータベース接続の健全性をチェックするハンドラー
// GET /api/v1/health
func (hc *HealthController) HealthCheck(c *gin.Context) {
	status := hc.healthMiddleware.GetHealthStatus()

	// ステータスに基づいてHTTPステータスコードを決定
	httpStatus := http.StatusOK
	if status["status"] == "error" {
		httpStatus = http.StatusServiceUnavailable
	}

	c.JSON(httpStatus, status)
}
