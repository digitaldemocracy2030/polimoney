package models

import (
	"database/sql"
	"time"
)

// User はユーザー情報を表す構造体
type User struct {
	ID            int       `json:"id" db:"id"`
	Username      string    `json:"username" db:"username"`
	Email         string    `json:"email" db:"email"`
	PasswordHash  string    `json:"-" db:"password_hash"` // JSONには含めない
	RoleID        int       `json:"role_id" db:"role_id"`
	IsActive      bool      `json:"is_active" db:"is_active"`
	EmailVerified bool      `json:"email_verified" db:"email_verified"`
	LastLogin     *time.Time `json:"last_login" db:"last_login"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
}

// Role はロール情報を表す構造体
type Role struct {
	ID          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// UserWithRole はユーザーとロール情報を結合した構造体
type UserWithRole struct {
	User
	RoleName        string `json:"role_name" db:"role_name"`
	RoleDescription string `json:"role_description" db:"role_description"`
}

// UserRepository はユーザー関連のデータベース操作を行う
type UserRepository struct {
	DB *sql.DB
}

// NewUserRepository は新しいUserRepositoryを作成
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{DB: db}
}

// GetAllUsers は全ユーザーを取得（ロール情報も含む）
func (r *UserRepository) GetAllUsers() ([]UserWithRole, error) {
	query := `
		SELECT u.id, u.username, u.email, u.role_id, u.is_active, u.email_verified,
		       u.last_login, u.created_at, u.updated_at, r.name as role_name, r.description as role_description
		FROM users u
		JOIN roles r ON u.role_id = r.id
		ORDER BY u.created_at DESC
	`

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []UserWithRole
	for rows.Next() {
		var user UserWithRole
		err := rows.Scan(
			&user.ID, &user.Username, &user.Email, &user.RoleID, &user.IsActive, &user.EmailVerified,
			&user.LastLogin, &user.CreatedAt, &user.UpdatedAt, &user.RoleName, &user.RoleDescription,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

// GetUserByID は指定されたIDのユーザーを取得
func (r *UserRepository) GetUserByID(id int) (*UserWithRole, error) {
	query := `
		SELECT u.id, u.username, u.email, u.role_id, u.is_active, u.email_verified,
		       u.last_login, u.created_at, u.updated_at, r.name as role_name, r.description as role_description
		FROM users u
		JOIN roles r ON u.role_id = r.id
		WHERE u.id = $1
	`

	var user UserWithRole
	err := r.DB.QueryRow(query, id).Scan(
		&user.ID, &user.Username, &user.Email, &user.RoleID, &user.IsActive, &user.EmailVerified,
		&user.LastLogin, &user.CreatedAt, &user.UpdatedAt, &user.RoleName, &user.RoleDescription,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}
