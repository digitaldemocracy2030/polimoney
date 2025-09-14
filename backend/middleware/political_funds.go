package middleware

import (
	"fmt"

	"github.com/digitaldemocracy2030/polimoney/middleware/validators"
	"github.com/digitaldemocracy2030/polimoney/models"
	"gorm.io/gorm"
)

// PoliticalFundsMiddleware は政治資金収支報告書関連のミドルウェア機能を提供
type PoliticalFundsMiddleware struct {
	politicalFundsRepo *models.PoliticalFundsRepository
	db                 *gorm.DB
}

// NewPoliticalFundsMiddleware は新しいPoliticalFundsMiddlewareを作成
func NewPoliticalFundsMiddleware(db *gorm.DB) *PoliticalFundsMiddleware {
	politicalFundsRepo := models.NewPoliticalFundsRepository(db)
	return &PoliticalFundsMiddleware{
		politicalFundsRepo: politicalFundsRepo,
		db:                 db,
	}
}

// PostPoliticalFunds は政治資金収支報告書データを作成するメソッド
func (pfm *PoliticalFundsMiddleware) PostPoliticalFunds(politicalFunds models.PoliticalFunds) error {
	// データの妥当性検証
	if err := validators.ValidatePoliticalFunds(&politicalFunds); err != nil {
		return fmt.Errorf("PostPoliticalFunds: データの検証に失敗しました: %w", err)
	}

	// データベースにデータを作成
	if err := pfm.politicalFundsRepo.CreatePoliticalFunds(&politicalFunds); err != nil {
		return fmt.Errorf("PostPoliticalFunds: データベースへの保存に失敗しました: %w", err)
	}

	return nil
}
