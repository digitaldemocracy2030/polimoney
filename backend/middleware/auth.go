package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"os"

	"github.com/digitaldemocracy2030/polimoney/models"
	"golang.org/x/crypto/bcrypt"
)

// Signup は新規ユーザー登録を行う
func (um *UserMiddleware) Signup(username, email, password string) (*models.User, error) {
	// パスワードをsha256ハッシュ化
	// bcryptの72バイト制限回避のため
	salt := os.Getenv("PASSWORD_SALT")
	sha256hashedPassword := sha256.Sum256([]byte(password + salt))
	sha256hashedPasswordString := hex.EncodeToString(sha256hashedPassword[:])

	// さらにbcryptでハッシュ化
	bcryptCost := 12
	bcryptHashedPassword, err := bcrypt.GenerateFromPassword([]byte(sha256hashedPasswordString), bcryptCost)
	if err != nil {
		return nil, fmt.Errorf("Signup failed: パスワードのハッシュ化に失敗しました: %w", err)
	}
	bcryptHashedPasswordString := string(bcryptHashedPassword)

	// ユーザーを作成
	user := &models.User{
		Username:     username,
		Email:        email,
		PasswordHash: bcryptHashedPasswordString,
		RoleID:       2, // デフォルトのロールIDを設定（2は一般ユーザー）
		// TODO: 管理者として登録する手段を検討する
	}

	// ユーザーを保存
	err = um.userRepo.CreateUser(user)
	if err != nil {
		return nil, fmt.Errorf("Signup failed: ユーザーの作成に失敗しました: %w", err)
	}

	// ユーザーを返す
	return user, nil
}

// Login はログインを行う
func (um *UserMiddleware) Login(email, password string) (*models.User, string, error) {
	// Emailでユーザーを取得
	user, err := um.userRepo.GetUserByEmail(email)
	if err != nil {
		// セキュリティ上の理由から、ユーザーが存在しないことを明示しない
		log.Printf("Login failed: ユーザー取得エラー (email: %s): %v", email, err)
		return nil, "", fmt.Errorf("Login failed: emailもしくはパスワードが正しくありません")
	}

	// パスワードをsha256ハッシュ化
	// bcryptの72バイト制限回避のため
	salt := os.Getenv("PASSWORD_SALT")
	sha256hashedPassword := sha256.Sum256([]byte(password + salt))
	sha256hashedPasswordString := hex.EncodeToString(sha256hashedPassword[:])

	// パスワードハッシュを比較
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(sha256hashedPasswordString))
	if err != nil {
		// セキュリティ上の理由から、パスワードが間違っていることを明示しない
		log.Printf("Login failed: パスワード比較エラー (email: %s): %v", email, err)
		return nil, "", fmt.Errorf("Login failed: emailもしくはパスワードが正しくありません")
	}

	// JWTを生成
	jwtToken, err := GenerateJWT(user.ID)
	if err != nil {
		return nil, "", fmt.Errorf("Login failed: GenerateJWT でエラーが発生しました: %w", err)
	}

	// 認証成功
	return user, jwtToken, nil
}
