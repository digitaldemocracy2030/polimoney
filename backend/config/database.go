package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

// DatabaseConfig はデータベース接続設定を保持
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// LoadDatabaseConfig は環境変数からデータベース設定を読み込み
func LoadDatabaseConfig() *DatabaseConfig {
	return &DatabaseConfig{
		Host:     getEnvOrDefault("DB_HOST", "localhost"),
		Port:     getEnvOrDefault("DB_PORT", "5432"),
		User:     getEnvOrDefault("DB_USER", "postgres"),
		Password: getEnvOrDefault("DB_PASSWORD", "postgres123"),
		DBName:   getEnvOrDefault("DB_NAME", "polimoney"),
		SSLMode:  getEnvOrDefault("DB_SSLMODE", "disable"),
	}
}

// GetConnectionString はPostgreSQL接続文字列を生成
func (c *DatabaseConfig) GetConnectionString() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode)
}

// ConnectDB はデータベースへの接続を確立
func ConnectDB() (*sql.DB, error) {
	config := LoadDatabaseConfig()
	connStr := config.GetConnectionString()

	log.Printf("データベースに接続中: %s:%s/%s", config.Host, config.Port, config.DBName)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("データベースの接続に失敗: %v", err)
	}

	// 接続テスト
	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("データベースのpingに失敗: %v", err)
	}

	log.Println("データベース接続が成功しました")
	return db, nil
}

// getEnvOrDefault は環境変数を取得し、存在しない場合はデフォルト値を返す
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
