package middleware

import (
	"strconv"

	"github.com/digitaldemocracy2030/polimoney/models"
	"gorm.io/gorm"
)

// UserMiddleware はユーザー関連のミドルウェア機能を提供
type UserMiddleware struct {
	userRepo *models.UserRepository
	db       *gorm.DB
}

// NewUserMiddleware は新しいUserMiddlewareを作成
func NewUserMiddleware(db *gorm.DB) *UserMiddleware {
	userRepo := models.NewUserRepository(db)
	return &UserMiddleware{
		userRepo: userRepo,
		db:       db,
	}
}

// GetAllUsers は全ユーザー情報を取得するメソッド
func (um *UserMiddleware) GetAllUsers() ([]models.User, error) {
	// データベースから全ユーザー情報を取得
	// TODO: 必要に応じてフィルタリングやソート、認証などの処理を追加

	return um.userRepo.GetAllUsers()
}

// GetUserByID は指定されたIDのユーザー情報を取得するメソッド
func (um *UserMiddleware) GetUserByID(idStr string) (*models.User, error) {
	// TODO: 必要に応じて認証などの処理を追加

	// IDを数値に変換
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, err
	}

	// データベースからユーザー情報を取得
	user, err := um.userRepo.GetUserByID(id)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
