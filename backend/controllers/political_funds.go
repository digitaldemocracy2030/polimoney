package controllers

import (
	"net/http"

	"github.com/digitaldemocracy2030/polimoney/middleware"
	"github.com/digitaldemocracy2030/polimoney/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// PoliticalFundsController は政治資金収支報告書関連のHTTPハンドラーを管理
type PoliticalFundsController struct {
	politicalFundsMiddleware *middleware.PoliticalFundsMiddleware
}

// NewPoliticalFundsController は新しいPoliticalFundsControllerを作成
func NewPoliticalFundsController(db *gorm.DB) *PoliticalFundsController {
	politicalFundsMiddleware := middleware.NewPoliticalFundsMiddleware(db)
	return &PoliticalFundsController{
		politicalFundsMiddleware: politicalFundsMiddleware,
	}
}

// PostPoliticalFunds は政治資金収支報告書のデータ追加を行うハンドラー
// POST /api/v1/political_funds
func (pfc *PoliticalFundsController) PostPoliticalFunds(c *gin.Context) {
	// 送信されたデータを取得
	var politicalFunds models.PoliticalFunds
	if err := c.ShouldBindJSON(&politicalFunds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "入力データが不正です",
			"message": "政治資金収支報告書のデータ追加に失敗しました",
		})
		return
	}

	// データベースにデータを追加
	err := pfc.politicalFundsMiddleware.PostPoliticalFunds(politicalFunds)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "データベースエラー",
			"message": "政治資金収支報告書のデータ追加に失敗しました",
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"data":    politicalFunds,
	})
}
