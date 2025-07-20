package models

import (
	"time"

	"gorm.io/gorm"
)

// User はユーザー情報を表す構造体（GORMモデル）
type User struct {
	ID              uint       `json:"id" gorm:"primaryKey"`
	Username        string     `json:"username" gorm:"uniqueIndex;not null"`
	Email           string     `json:"email" gorm:"uniqueIndex;not null"`
	PasswordHash    string     `json:"-" gorm:"column:password_hash;not null"` // JSONには含めない
	RoleID          uint       `json:"role_id" gorm:"not null"`
	IsActive        bool       `json:"is_active" gorm:"default:true"`
	EmailVerified   bool       `json:"email_verified" gorm:"default:false"`
	LastLogin       *time.Time `json:"last_login"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	Role            Role       `json:"role" gorm:"foreignKey:RoleID"` // リレーション定義
	RoleName        string     `json:"role_name" gorm:"-"`            // DBには保存しない
	RoleDescription string     `json:"role_description" gorm:"-"`     // DBには保存しない
}

// Role はロール情報を表す構造体（GORMモデル）
type Role struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"uniqueIndex;not null"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableName はUserテーブル名を指定
func (User) TableName() string {
	return "users"
}

// TableName はRoleテーブル名を指定
func (Role) TableName() string {
	return "roles"
}

// UserRepository はユーザー関連のデータベース操作を行う
type UserRepository struct {
	DB *gorm.DB
}

// NewUserRepository は新しいUserRepositoryを作成
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{DB: db}
}

// GetAllUsers は全ユーザーを取得（ロール情報も含む）
func (r *UserRepository) GetAllUsers() ([]User, error) {
	var users []User

	// GORMのJoinを使用してユーザーとロール情報を結合
	err := r.DB.Table("users u").
		Select("u.id, u.username, u.email, u.role_id, u.is_active, u.email_verified, u.last_login, u.created_at, u.updated_at, r.name as role_name, r.description as role_description").
		Joins("JOIN roles r ON u.role_id = r.id").
		Order("u.created_at DESC").
		Scan(&users).Error

	if err != nil {
		return nil, err
	}

	return users, nil
}

// GetUserByID は指定されたIDのユーザーを取得
func (r *UserRepository) GetUserByID(id int) (User, error) {
	var user User

	// GORMのJoinを使用してユーザーとロール情報を結合
	err := r.DB.Table("users u").
		Select("u.id, u.username, u.email, u.role_id, u.is_active, u.email_verified, u.last_login, u.created_at, u.updated_at, r.name as role_name, r.description as role_description").
		Joins("JOIN roles r ON u.role_id = r.id").
		Where("u.id = ?", id).
		First(&user).Error

	if err != nil {
		return User{}, err
	}

	return user, nil
}

// CreateUser は新しいユーザーを作成
func (r *UserRepository) CreateUser(user *User) error {
	return r.DB.Create(user).Error
}

// UpdateUser はユーザー情報を更新
func (r *UserRepository) UpdateUser(user *User) error {
	return r.DB.Save(user).Error
}

// DeleteUser はユーザーを削除
func (r *UserRepository) DeleteUser(id uint) error {
	return r.DB.Delete(&User{}, id).Error
}

// GetUserByEmail はEmailでユーザーを取得
func (r *UserRepository) GetUserByEmail(email string) (*User, error) {
	var user User
	err := r.DB.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}
