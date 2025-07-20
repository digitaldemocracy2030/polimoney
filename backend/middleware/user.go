package middleware

import (
	"fmt"
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

	// 入力値の検証
	if idStr == "" {
		return nil, fmt.Errorf("GetUserByID: ユーザーIDが空です")
	}

	// IDを数値に変換
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, fmt.Errorf("GetUserByID: ユーザーIDが数値ではありません: %w", err)
	}

	// IDが0以下の場合はエラーを返す
	if id <= 0 {
		return nil, fmt.Errorf("GetUserByID: ユーザーIDは正の整数である必要があります")
	}

	// データベースからユーザー情報を取得
	user, err := um.userRepo.GetUserByID(id)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
