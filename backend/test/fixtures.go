package test

import (
	"time"

	"github.com/digitaldemocracy2030/polimoney/models"
)

// GetMockUsers returns test user data
func GetMockUsers() []models.User {
	now := time.Now()
	return []models.User{
		{
			ID:            1,
			Username:      "admin",
			Email:         "admin@example.com",
			PasswordHash:  "$2a$10$YMfPPy3J5yp0jY3sZxGmNOzUgKmFY7PqBc1LTAgjnHvUQgFgdYGiu", // password: admin123
			RoleID:        1,
			IsActive:      true,
			EmailVerified: true,
			LastLogin:     &now,
			CreatedAt:     now.Add(-30 * 24 * time.Hour),
			UpdatedAt:     now,
			Role: models.Role{
				ID:          1,
				Name:        "admin",
				Description: "Administrator role",
				CreatedAt:   now.Add(-30 * 24 * time.Hour),
				UpdatedAt:   now,
			},
		},
		{
			ID:            2,
			Username:      "user1",
			Email:         "user1@example.com",
			PasswordHash:  "$2a$10$YMfPPy3J5yp0jY3sZxGmNOzUgKmFY7PqBc1LTAgjnHvUQgFgdYGiu", // password: user123
			RoleID:        2,
			IsActive:      true,
			EmailVerified: false,
			LastLogin:     nil,
			CreatedAt:     now.Add(-7 * 24 * time.Hour),
			UpdatedAt:     now.Add(-7 * 24 * time.Hour),
			Role: models.Role{
				ID:          2,
				Name:        "user",
				Description: "Regular user role",
				CreatedAt:   now.Add(-30 * 24 * time.Hour),
				UpdatedAt:   now,
			},
		},
		{
			ID:            3,
			Username:      "inactive",
			Email:         "inactive@example.com",
			PasswordHash:  "$2a$10$YMfPPy3J5yp0jY3sZxGmNOzUgKmFY7PqBc1LTAgjnHvUQgFgdYGiu",
			RoleID:        2,
			IsActive:      false,
			EmailVerified: true,
			LastLogin:     nil,
			CreatedAt:     now.Add(-90 * 24 * time.Hour),
			UpdatedAt:     now.Add(-90 * 24 * time.Hour),
			Role: models.Role{
				ID:          2,
				Name:        "user",
				Description: "Regular user role",
				CreatedAt:   now.Add(-30 * 24 * time.Hour),
				UpdatedAt:   now,
			},
		},
	}
}

// GetMockRoles returns test role data
func GetMockRoles() []models.Role {
	now := time.Now()
	return []models.Role{
		{
			ID:          1,
			Name:        "admin",
			Description: "Administrator role",
			CreatedAt:   now.Add(-30 * 24 * time.Hour),
			UpdatedAt:   now,
		},
		{
			ID:          2,
			Name:        "user",
			Description: "Regular user role",
			CreatedAt:   now.Add(-30 * 24 * time.Hour),
			UpdatedAt:   now,
		},
	}
}
