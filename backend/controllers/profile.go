package controllers

import (
	"net/http"

	"github.com/digitaldemocracy2030/polimoney/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ProfileController はプロフィール関連のHTTPハンドラーを管理
type ProfileController struct {
	profileMiddleware *middleware.ProfileMiddleware
}

// NewProfileController は新しいProfileControllerを作成
func NewProfileController(db *gorm.DB) *ProfileController {
	profileMiddleware := middleware.NewProfileMiddleware(db)
	return &ProfileController{
		profileMiddleware: profileMiddleware,
	}
}

// GetMyPage は認証されたユーザーのプロフィール情報を取得するハンドラー
// GET /api/v1/profile
func (pc *ProfileController) GetMyPage(c *gin.Context) {
	// JWTAuthMiddleware から設定されたユーザーIDを取得
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "認証エラー",
			"message": "ユーザーIDが取得できませんでした",
		})
		return
	}

	// ユーザーIDをuintに変換
	userIDFloat, ok := userIDValue.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "内部エラー",
			"message": "ユーザーIDの形式が不正です",
		})
		return
	}
	userID := uint(userIDFloat)

	// ユーザー情報を取得
	user, err := pc.profileMiddleware.GetMyProfile(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "ユーザーが見つかりません",
				"message": "middleware/profile.go GetUserProfile でエラーが発生しました",
				"details": err.Error(),
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "データベースエラー",
			"message": "middleware/profile.go GetUserProfile でエラーが発生しました",
			"details": err.Error(),
		})
		return
	}

	// レスポンスを返す
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   user,
	})
}
