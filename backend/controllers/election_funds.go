package controllers

import (
	"net/http"

	"github.com/digitaldemocracy2030/polimoney/middleware"
	"github.com/digitaldemocracy2030/polimoney/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ElectionFundsController は選挙資金収支報告書関連のHTTPハンドラーを管理
type ElectionFundsController struct {
	electionFundsMiddleware *middleware.ElectionFundsMiddleware
}

// NewElectionFundsController は新しいElectionFundsControllerを作成
func NewElectionFundsController(db *gorm.DB) *ElectionFundsController {
	electionFundsMiddleware := middleware.NewElectionFundsMiddleware(db)
	return &ElectionFundsController{
		electionFundsMiddleware: electionFundsMiddleware,
	}
}

// PostElectionFunds は選挙資金収支報告書のデータ追加を行うハンドラー
// POST /api/v1/election_funds
func (efc *ElectionFundsController) PostElectionFunds(c *gin.Context) {
	// 送信されたデータを取得
	var electionFunds models.ElectionFunds
	if err := c.ShouldBindJSON(&electionFunds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "入力データが不正です",
			"message": "選挙資金収支報告書のデータ追加に失敗しました",
		})
		return
	}

	// データベースにデータを追加
	err := efc.electionFundsMiddleware.PostElectionFunds(electionFunds)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "データベースエラー",
			"message": "選挙資金収支報告書のデータ追加に失敗しました",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   electionFunds,
	})
}
