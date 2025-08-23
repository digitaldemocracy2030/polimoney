package validators

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidateEmail(t *testing.T) {
	// --- 正常系テストケース ---
	validTestCases := []struct {
		name  string
		email string
	}{
		{
			name:  "valid email",
			email: "test@example.com",
		},
		{
			name:  "valid email with subdomain",
			email: "test@sub.example.com",
		},
	}

	for _, tc := range validTestCases {
		t.Run(tc.name, func(t *testing.T) {
			err := ValidateEmail(tc.email)
			assert.NoError(t, err)
		})
	}

	// --- 異常系テストケース ---
	invalidTestCases := []struct {
		name  string
		email string
	}{
		{
			name:  "invalid email - no at sign",
			email: "testexample.com",
		},
		{
			name:  "invalid email - no domain",
			email: "test@",
		},
		{
			name:  "invalid email - no local part",
			email: "@example.com",
		},
		{
			name:  "invalid email - multiple at signs",
			email: "test@@example.com",
		},
		{
			name:  "empty email",
			email: "",
		},
	}

	for _, tc := range invalidTestCases {
		t.Run(tc.name, func(t *testing.T) {
			err := ValidateEmail(tc.email)
			assert.Error(t, err)
		})
	}
}
