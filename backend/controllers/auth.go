package controllers

import (
	"net/http"

	"github.com/digitaldemocracy2030/polimoney/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type SignupRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func NewAuthController(db *gorm.DB) *UserController {
	userMiddleware := middleware.NewUserMiddleware(db)
	return &UserController{
		userMiddleware: userMiddleware,
	}
}

// Signup は新規ユーザー登録を行うハンドラー
// POST /api/v1/signup
func (uc *UserController) Signup(c *gin.Context) {
	var signupRequest SignupRequest
	if err := c.ShouldBindJSON(&signupRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "入力データが不正です",
		})
		return
	}

	user, err := uc.userMiddleware.Signup(signupRequest.Username, signupRequest.Email, signupRequest.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "ユーザー登録に失敗しました",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "ユーザー登録に成功しました",
		"data": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

// Login はログインを行うハンドラー
// POST /api/v1/login
func (uc *UserController) Login(c *gin.Context) {
	var loginRequest LoginRequest
	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "入力データが不正です",
		})
		return
	}

	user, jwtToken, err := uc.userMiddleware.Login(loginRequest.Email, loginRequest.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "ログインに失敗しました",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "ログインに成功しました",
		"data": gin.H{
			"user":  user,
			"token": jwtToken,
		},
	})
}
