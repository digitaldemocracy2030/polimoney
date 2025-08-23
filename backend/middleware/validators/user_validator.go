package validators

import (
	"errors"
	"fmt"
	"net/mail"
)

// ValidateEmail checks if the email format is valid.
func ValidateEmail(email string) error {
	// 空の場合はエラー
	if email == "" {
		return errors.New("email is required")
	}
	_, err := mail.ParseAddress(email)
	if err != nil {
		return fmt.Errorf("invalid email format: %w", err)
	}
	return nil
}
