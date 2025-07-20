package controllers

import (
	"net/http"

	"github.com/digitaldemocracy2030/polimoney/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// UserController はユーザー関連のHTTPハンドラーを管理
type UserController struct {
	userMiddleware *middleware.UserMiddleware
}

// NewUserController は新しいUserControllerを作成
func NewUserController(db *gorm.DB) *UserController {
	userMiddleware := middleware.NewUserMiddleware(db)
	return &UserController{
		userMiddleware: userMiddleware,
	}
}

// GetAllUsers は全ユーザーを取得するハンドラー
// GET /api/v1/admin/users
func (uc *UserController) GetAllUsers(c *gin.Context) {
	users, err := uc.userMiddleware.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "データベースエラー",
			"message": "middleware/user.go GetAllUsers でエラーが発生しました",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"count":  len(users),
		"data":   users,
	})
}

// GetUserByID は指定されたIDのユーザーを取得するハンドラー
// GET /api/v1/admin/users/:id
func (uc *UserController) GetUserByID(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "無効なリクエスト",
			"message": "ユーザーIDが指定されていません",
		})
		return
	}

	user, err := uc.userMiddleware.GetUserByID(idStr)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "ユーザーが見つかりません",
				"message": "middleware/user.go GetUserByID でエラーが発生しました",
				"details": err.Error(),
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "データベースエラー",
			"message": "middleware/user.go GetUserByID でエラーが発生しました",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   user,
	})
}
