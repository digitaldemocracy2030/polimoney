package test

import (
	"database/sql"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/digitaldemocracy2030/polimoney/models"
	"gorm.io/gorm"
)

// MockHealthRepository sets up mock expectations for health repository
func MockHealthRepository(mock sqlmock.Sqlmock) {
	// Mock for CheckConnection
	mock.ExpectQuery("SELECT 1").
		WillReturnRows(sqlmock.NewRows([]string{"?column?"}).AddRow(1))
}

// MockHealthRepositoryError sets up mock expectations for health repository errors
func MockHealthRepositoryError(mock sqlmock.Sqlmock) {
	// Mock for CheckConnection error
	mock.ExpectQuery("SELECT 1").
		WillReturnError(sql.ErrConnDone)
}

// MockUserRepositoryGetAll sets up mock expectations for GetAllUsers
func MockUserRepositoryGetAll(mock sqlmock.Sqlmock) {
	users := GetMockUsers()

	// Mock for GetAllUsers - main query
	rows := sqlmock.NewRows([]string{
		"id", "username", "email", "password_hash", "role_id",
		"is_active", "email_verified", "last_login", "created_at", "updated_at",
	})

	for _, user := range users {
		rows.AddRow(
			user.ID, user.Username, user.Email, user.PasswordHash, user.RoleID,
			user.IsActive, user.EmailVerified, user.LastLogin, user.CreatedAt, user.UpdatedAt,
		)
	}

	mock.ExpectQuery("SELECT \\* FROM \"users\" ORDER BY created_at DESC").
		WillReturnRows(rows)

	// Mock for Role preload
	roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"})
	for _, role := range GetMockRoles() {
		roleRows.AddRow(role.ID, role.Name, role.Description, role.CreatedAt, role.UpdatedAt)
	}

	mock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" IN").
		WillReturnRows(roleRows)
}

// MockUserRepositoryGetByID sets up mock expectations for GetUserByID
func MockUserRepositoryGetByID(mock sqlmock.Sqlmock, userID int) {
	users := GetMockUsers()
	var user *models.User

	for _, u := range users {
		if u.ID == uint(userID) {
			user = &u
			break
		}
	}

	if user == nil {
		mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE \"users\".\"id\" = \\$1").
			WithArgs(userID).
			WillReturnError(gorm.ErrRecordNotFound)
		return
	}

	// Mock for GetUserByID - main query
	rows := sqlmock.NewRows([]string{
		"id", "username", "email", "password_hash", "role_id",
		"is_active", "email_verified", "last_login", "created_at", "updated_at",
	}).AddRow(
		user.ID, user.Username, user.Email, user.PasswordHash, user.RoleID,
		user.IsActive, user.EmailVerified, user.LastLogin, user.CreatedAt, user.UpdatedAt,
	)

	mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE \"users\".\"id\" = \\$1").
		WithArgs(userID).
		WillReturnRows(rows)

	// Mock for Role preload
	roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"}).
		AddRow(user.Role.ID, user.Role.Name, user.Role.Description, user.Role.CreatedAt, user.Role.UpdatedAt)

	mock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" = \\$1").
		WithArgs(user.RoleID).
		WillReturnRows(roleRows)
}

// MockUserRepositoryGetByEmail sets up mock expectations for GetUserByEmail
func MockUserRepositoryGetByEmail(mock sqlmock.Sqlmock, email string) {
	users := GetMockUsers()
	var user *models.User

	for _, u := range users {
		if u.Email == email {
			user = &u
			break
		}
	}

	if user == nil {
		mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE email = \\$1").
			WithArgs(email).
			WillReturnError(gorm.ErrRecordNotFound)
		return
	}

	// Mock for GetUserByEmail - main query
	rows := sqlmock.NewRows([]string{
		"id", "username", "email", "password_hash", "role_id",
		"is_active", "email_verified", "last_login", "created_at", "updated_at",
	}).AddRow(
		user.ID, user.Username, user.Email, user.PasswordHash, user.RoleID,
		user.IsActive, user.EmailVerified, user.LastLogin, user.CreatedAt, user.UpdatedAt,
	)

	mock.ExpectQuery("SELECT \\* FROM \"users\" WHERE email = \\$1").
		WithArgs(email).
		WillReturnRows(rows)

	// Mock for Role preload
	roleRows := sqlmock.NewRows([]string{"id", "name", "description", "created_at", "updated_at"}).
		AddRow(user.Role.ID, user.Role.Name, user.Role.Description, user.Role.CreatedAt, user.Role.UpdatedAt)

	mock.ExpectQuery("SELECT \\* FROM \"roles\" WHERE \"roles\".\"id\" = \\$1").
		WithArgs(user.RoleID).
		WillReturnRows(roleRows)
}

// MockUserRepositoryCreate sets up mock expectations for CreateUser
func MockUserRepositoryCreate(mock sqlmock.Sqlmock, user *models.User) {
	mock.ExpectBegin()
	mock.ExpectQuery("INSERT INTO \"users\"").
		WithArgs(
			user.Username, user.Email, user.PasswordHash, user.RoleID,
			user.IsActive, user.EmailVerified, user.LastLogin,
			sqlmock.AnyArg(), sqlmock.AnyArg(),
		).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(user.ID))
	mock.ExpectCommit()
}

// MockDBStats sets up mock expectations for database statistics
func MockDBStats(mock sqlmock.Sqlmock) {
	// Mock for connection stats
	mock.ExpectQuery("SELECT count\\(\\*\\) FROM pg_stat_activity").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(5))

	// Mock for database size
	mock.ExpectQuery("SELECT pg_database_size").
		WillReturnRows(sqlmock.NewRows([]string{"pg_database_size"}).AddRow(1024000))

	// Mock for table count
	mock.ExpectQuery("SELECT count\\(\\*\\) FROM information_schema.tables").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(10))
}
