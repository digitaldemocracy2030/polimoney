package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoadDatabaseConfig(t *testing.T) {
	// Save original environment variables
	originalVars := map[string]string{
		"DB_HOST":     os.Getenv("DB_HOST"),
		"DB_PORT":     os.Getenv("DB_PORT"),
		"DB_USER":     os.Getenv("DB_USER"),
		"DB_PASSWORD": os.Getenv("DB_PASSWORD"),
		"DB_NAME":     os.Getenv("DB_NAME"),
		"DB_SSLMODE":  os.Getenv("DB_SSLMODE"),
	}

	// Restore original values after test
	defer func() {
		for key, value := range originalVars {
			os.Setenv(key, value)
		}
	}()

	t.Run("load config from environment variables", func(t *testing.T) {
		// Set test environment variables
		os.Setenv("DB_HOST", "test-host")
		os.Setenv("DB_PORT", "5432")
		os.Setenv("DB_USER", "test-user")
		os.Setenv("DB_PASSWORD", "test-password")
		os.Setenv("DB_NAME", "test-db")
		os.Setenv("DB_SSLMODE", "disable")

		// Load config
		config := LoadDatabaseConfig()

		// Assert
		assert.Equal(t, "test-host", config.Host)
		assert.Equal(t, "5432", config.Port)
		assert.Equal(t, "test-user", config.User)
		assert.Equal(t, "test-password", config.Password)
		assert.Equal(t, "test-db", config.DBName)
		assert.Equal(t, "disable", config.SSLMode)
	})

	t.Run("empty environment variables", func(t *testing.T) {
		// Clear environment variables
		os.Setenv("DB_HOST", "")
		os.Setenv("DB_PORT", "")
		os.Setenv("DB_USER", "")
		os.Setenv("DB_PASSWORD", "")
		os.Setenv("DB_NAME", "")
		os.Setenv("DB_SSLMODE", "")

		// Load config
		config := LoadDatabaseConfig()

		// Assert all values are empty
		assert.Empty(t, config.Host)
		assert.Empty(t, config.Port)
		assert.Empty(t, config.User)
		assert.Empty(t, config.Password)
		assert.Empty(t, config.DBName)
		assert.Empty(t, config.SSLMode)
	})
}

func TestDatabaseConfig_GetConnectionString(t *testing.T) {
	t.Run("generate connection string", func(t *testing.T) {
		config := &DatabaseConfig{
			Host:     "localhost",
			Port:     "5432",
			User:     "postgres",
			Password: "secret",
			DBName:   "mydb",
			SSLMode:  "require",
		}

		expected := "host=localhost port=5432 user=postgres password=secret dbname=mydb sslmode=require"
		actual := config.GetConnectionString()

		assert.Equal(t, expected, actual)
	})

	t.Run("connection string with special characters", func(t *testing.T) {
		config := &DatabaseConfig{
			Host:     "db.example.com",
			Port:     "5433",
			User:     "admin@db",
			Password: "p@$$w0rd!",
			DBName:   "test_db",
			SSLMode:  "disable",
		}

		expected := "host=db.example.com port=5433 user=admin@db password=p@$$w0rd! dbname=test_db sslmode=disable"
		actual := config.GetConnectionString()

		assert.Equal(t, expected, actual)
	})

	t.Run("empty config", func(t *testing.T) {
		config := &DatabaseConfig{}

		expected := "host= port= user= password= dbname= sslmode="
		actual := config.GetConnectionString()

		assert.Equal(t, expected, actual)
	})
}

func TestConnectDB(t *testing.T) {
	// Save original environment variables
	originalVars := map[string]string{
		"DB_HOST":     os.Getenv("DB_HOST"),
		"DB_PORT":     os.Getenv("DB_PORT"),
		"DB_USER":     os.Getenv("DB_USER"),
		"DB_PASSWORD": os.Getenv("DB_PASSWORD"),
		"DB_NAME":     os.Getenv("DB_NAME"),
		"DB_SSLMODE":  os.Getenv("DB_SSLMODE"),
	}

	// Restore original values after test
	defer func() {
		for key, value := range originalVars {
			os.Setenv(key, value)
		}
	}()

	t.Run("connection failure with invalid config", func(t *testing.T) {
		// Set invalid environment variables
		os.Setenv("DB_HOST", "invalid-host-that-does-not-exist")
		os.Setenv("DB_PORT", "99999")
		os.Setenv("DB_USER", "")
		os.Setenv("DB_PASSWORD", "")
		os.Setenv("DB_NAME", "")
		os.Setenv("DB_SSLMODE", "disable")

		// Execute
		db, err := ConnectDB()

		// Assert
		assert.Error(t, err)
		assert.Nil(t, db)
		assert.Contains(t, err.Error(), "データベースの接続に失敗")
	})
}