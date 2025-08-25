package models

import (
	"gorm.io/gorm"
)

// HealthRepository はヘルスチェック関連のデータベース操作を行う
type HealthRepository struct {
	DB *gorm.DB
}

// NewHealthRepository は新しいHealthRepositoryを作成
func NewHealthRepository(db *gorm.DB) *HealthRepository {
	return &HealthRepository{DB: db}
}

// CheckConnection はデータベース接続の健全性をチェックするメソッド
func (r *HealthRepository) CheckConnection() error {
	// GORM DBから sql.DB を取得
	sqlDB, err := r.DB.DB()
	if err != nil {
		return err
	}

	// データベース接続をテスト
	return sqlDB.Ping()
}

// GetDBStats はデータベース接続の統計情報を取得するメソッド
func (r *HealthRepository) GetDBStats() (map[string]interface{}, error) {
	sqlDB, err := r.DB.DB()
	if err != nil {
		return nil, err
	}

	stats := sqlDB.Stats()

	return map[string]interface{}{
		"open_connections":     stats.OpenConnections,
		"in_use":               stats.InUse,
		"idle":                 stats.Idle,
		"wait_count":           stats.WaitCount,
		"wait_duration":        stats.WaitDuration.String(),
		"max_idle_closed":      stats.MaxIdleClosed,
		"max_idle_time_closed": stats.MaxIdleTimeClosed,
		"max_lifetime_closed":  stats.MaxLifetimeClosed,
	}, nil
}
