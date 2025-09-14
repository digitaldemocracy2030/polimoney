package middleware

import (
	"fmt"

	"github.com/digitaldemocracy2030/polimoney/middleware/validators"
	"github.com/digitaldemocracy2030/polimoney/models"
	"gorm.io/gorm"
)

// ElectionFundsMiddleware は選挙資金収支報告書関連のミドルウェア機能を提供
type ElectionFundsMiddleware struct {
	electionFundsRepo *models.ElectionFundsRepository
	db                *gorm.DB
}

// NewElectionFundsMiddleware は新しいElectionFundsMiddlewareを作成
func NewElectionFundsMiddleware(db *gorm.DB) *ElectionFundsMiddleware {
	electionFundsRepo := models.NewElectionFundsRepository(db)
	return &ElectionFundsMiddleware{
		electionFundsRepo: electionFundsRepo,
		db:                db,
	}
}

// PostElectionFunds は選挙資金収支報告書データを作成するメソッド
func (efm *ElectionFundsMiddleware) PostElectionFunds(electionFunds models.ElectionFunds) error {
	// データの妥当性検証
	if err := validators.ValidateElectionFunds(&electionFunds); err != nil {
		return fmt.Errorf("PostElectionFunds: データの検証に失敗しました: %w", err)
	}

	// データベースにデータを作成
	if err := efm.electionFundsRepo.CreateElectionFunds(&electionFunds); err != nil {
		return fmt.Errorf("PostElectionFunds: データベースへの保存に失敗しました: %w", err)
	}

	return nil
}
