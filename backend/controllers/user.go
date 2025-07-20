package controllers

import (
	"net/http"
	"strconv"

	"github.com/digitaldemocracy2030/polimoney/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// UserController はユーザー関連のHTTPハンドラーを管理
type UserController struct {
	userRepo *models.UserRepository
}

// NewUserController は新しいUserControllerを作成
func NewUserController(db *gorm.DB) *UserController {
	userRepo := models.NewUserRepository(db)
	return &UserController{
		userRepo: userRepo,
	}
}

// GetAllUsers は全ユーザーを取得するハンドラー
// GET /api/v1/admin/users
func (uc *UserController) GetAllUsers(c *gin.Context) {
	users, err := uc.userRepo.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "データベースエラー",
			"message": "ユーザー一覧の取得に失敗しました",
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
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "無効なパラメータ",
			"message": "ユーザーIDは数値である必要があります",
		})
		return
	}

	user, err := uc.userRepo.GetUserByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "ユーザーが見つかりません",
				"message": "指定されたIDのユーザーは存在しません",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "データベースエラー",
			"message": "ユーザー情報の取得に失敗しました",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   user,
	})
}

// HealthCheck はデータベース接続の健全性をチェックするハンドラー
// GET /api/v1/health
func (uc *UserController) HealthCheck(c *gin.Context) {
	// GORMを使用してデータベース接続テスト
	sqlDB, err := uc.userRepo.DB.DB()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":  "error",
			"message": "データベース接続の取得に失敗しました",
			"details": err.Error(),
		})
		return
	}

	// データベース接続テスト用のシンプルなクエリ
	err = sqlDB.Ping()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":  "error",
			"message": "データベース接続に問題があります",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":   "ok",
		"message":  "データベース接続は正常です",
		"database": "connected",
	})
}
