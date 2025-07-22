package config

import (
	"bytes"
	"log"
	"os"
	"os/exec"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCheckRequiredEnvVariables(t *testing.T) {
	// Save original environment variables
	originalEnv := map[string]string{
		"ENV":           os.Getenv("ENV"),
		"PASSWORD_SALT": os.Getenv("PASSWORD_SALT"),
		"JWT_SECRET":    os.Getenv("JWT_SECRET"),
	}

	// Restore original values after test
	defer func() {
		for key, value := range originalEnv {
			os.Setenv(key, value)
		}
	}()

	t.Run("all required variables set", func(t *testing.T) {
		// Set all required environment variables
		os.Setenv("ENV", "test")
		os.Setenv("PASSWORD_SALT", "test_salt")
		os.Setenv("JWT_SECRET", "test_secret")

		// Capture log output
		var buf bytes.Buffer
		log.SetOutput(&buf)
		defer log.SetOutput(os.Stderr)

		// Execute - should not exit
		CheckRequiredEnvVariables()

		// Assert no error logs
		output := buf.String()
		assert.NotContains(t, output, "環境変数が設定されていません")
	})

	t.Run("missing ENV variable", func(t *testing.T) {
		if os.Getenv("RUN_EXIT_TESTS") == "1" {
			// This will be run in a subprocess
			os.Setenv("ENV", "")
			os.Setenv("PASSWORD_SALT", "test_salt")
			os.Setenv("JWT_SECRET", "test_secret")
			CheckRequiredEnvVariables()
			return
		}

		// Run test in subprocess
		cmd := exec.Command(os.Args[0], "-test.run=TestCheckRequiredEnvVariables/missing_ENV_variable")
		cmd.Env = append(os.Environ(), "RUN_EXIT_TESTS=1")
		output, err := cmd.CombinedOutput()

		// The command should exit with status 1
		assert.Error(t, err)
		assert.Contains(t, string(output), "・ENV")
		assert.Contains(t, string(output), "環境変数が設定されていません")
	})

	t.Run("missing PASSWORD_SALT variable", func(t *testing.T) {
		if os.Getenv("RUN_EXIT_TESTS") == "1" {
			// This will be run in a subprocess
			os.Setenv("ENV", "test")
			os.Setenv("PASSWORD_SALT", "")
			os.Setenv("JWT_SECRET", "test_secret")
			CheckRequiredEnvVariables()
			return
		}

		// Run test in subprocess
		cmd := exec.Command(os.Args[0], "-test.run=TestCheckRequiredEnvVariables/missing_PASSWORD_SALT_variable")
		cmd.Env = append(os.Environ(), "RUN_EXIT_TESTS=1")
		output, err := cmd.CombinedOutput()

		// The command should exit with status 1
		assert.Error(t, err)
		assert.Contains(t, string(output), "・PASSWORD_SALT")
		assert.Contains(t, string(output), "環境変数が設定されていません")
	})

	t.Run("missing JWT_SECRET variable", func(t *testing.T) {
		if os.Getenv("RUN_EXIT_TESTS") == "1" {
			// This will be run in a subprocess
			os.Setenv("ENV", "test")
			os.Setenv("PASSWORD_SALT", "test_salt")
			os.Setenv("JWT_SECRET", "")
			CheckRequiredEnvVariables()
			return
		}

		// Run test in subprocess
		cmd := exec.Command(os.Args[0], "-test.run=TestCheckRequiredEnvVariables/missing_JWT_SECRET_variable")
		cmd.Env = append(os.Environ(), "RUN_EXIT_TESTS=1")
		output, err := cmd.CombinedOutput()

		// The command should exit with status 1
		assert.Error(t, err)
		assert.Contains(t, string(output), "・JWT_SECRET")
		assert.Contains(t, string(output), "環境変数が設定されていません")
	})

	t.Run("all variables missing", func(t *testing.T) {
		if os.Getenv("RUN_EXIT_TESTS") == "1" {
			// This will be run in a subprocess
			os.Setenv("ENV", "")
			os.Setenv("PASSWORD_SALT", "")
			os.Setenv("JWT_SECRET", "")
			CheckRequiredEnvVariables()
			return
		}

		// Run test in subprocess
		cmd := exec.Command(os.Args[0], "-test.run=TestCheckRequiredEnvVariables/all_variables_missing")
		cmd.Env = append(os.Environ(), "RUN_EXIT_TESTS=1")
		output, err := cmd.CombinedOutput()

		// The command should exit with status 1
		assert.Error(t, err)
		outputStr := string(output)
		
		// Check all variables are listed
		assert.Contains(t, outputStr, "・ENV")
		assert.Contains(t, outputStr, "・PASSWORD_SALT")
		assert.Contains(t, outputStr, "・JWT_SECRET")
		
		// Check error message
		assert.Contains(t, outputStr, "環境変数が設定されていません")
		assert.Contains(t, outputStr, "cp .env.example .env")
		
		// Check export commands are shown
		assert.Contains(t, outputStr, "export ENV=your_value")
		assert.Contains(t, outputStr, "export PASSWORD_SALT=your_value")
		assert.Contains(t, outputStr, "export JWT_SECRET=your_value")
	})

	t.Run("multiple variables missing", func(t *testing.T) {
		if os.Getenv("RUN_EXIT_TESTS") == "1" {
			// This will be run in a subprocess
			os.Setenv("ENV", "test")
			os.Setenv("PASSWORD_SALT", "")
			os.Setenv("JWT_SECRET", "")
			CheckRequiredEnvVariables()
			return
		}

		// Run test in subprocess
		cmd := exec.Command(os.Args[0], "-test.run=TestCheckRequiredEnvVariables/multiple_variables_missing")
		cmd.Env = append(os.Environ(), "RUN_EXIT_TESTS=1")
		output, err := cmd.CombinedOutput()

		// The command should exit with status 1
		assert.Error(t, err)
		outputStr := string(output)
		
		// ENV should not be listed as it's set
		assert.NotContains(t, outputStr, "・ENV")
		
		// PASSWORD_SALT and JWT_SECRET should be listed
		assert.Contains(t, outputStr, "・PASSWORD_SALT")
		assert.Contains(t, outputStr, "・JWT_SECRET")
		
		// Check error message
		assert.Contains(t, outputStr, "環境変数が設定されていません")
		
		// Count occurrences of missing variables
		envCount := strings.Count(outputStr, "・ENV")
		saltCount := strings.Count(outputStr, "・PASSWORD_SALT")
		jwtCount := strings.Count(outputStr, "・JWT_SECRET")
		
		assert.Equal(t, 0, envCount, "ENV should not be listed as missing")
		assert.Equal(t, 1, saltCount, "PASSWORD_SALT should be listed once")
		assert.Equal(t, 1, jwtCount, "JWT_SECRET should be listed once")
	})
}