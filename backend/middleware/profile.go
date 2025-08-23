package middleware

import (
	"fmt"

	"github.com/digitaldemocracy2030/polimoney/models"
	"gorm.io/gorm"
)

// ProfileMiddleware はプロフィール関連のミドルウェア機能を提供
type ProfileMiddleware struct {
	userRepo *models.UserRepository
	db       *gorm.DB
}

// NewProfileMiddleware は新しいProfileMiddlewareを作成
func NewProfileMiddleware(db *gorm.DB) *ProfileMiddleware {
	userRepo := models.NewUserRepository(db)
	return &ProfileMiddleware{
		userRepo: userRepo,
		db:       db,
	}
}

// GetMyProfile は指定されたユーザーIDのプロフィール情報を取得するメソッド
func (pm *ProfileMiddleware) GetMyProfile(userID uint) (*models.User, error) {
	// TODO: 必要に応じて認証や権限チェックなどの処理を追加
	// TODO: userIDとJWTなどを確認して、userIDがその人自身であるかを確認する

	// 入力値の検証
	if userID <= 0 {
		return nil, fmt.Errorf("GetUserProfile: ユーザーIDは正の整数である必要があります")
	}

	// データベースからユーザー情報を取得（ロール情報も含む）
	user, err := pm.userRepo.GetUserByID(int(userID))
	if err != nil {
		return nil, err
	}

	return &user, nil
}
