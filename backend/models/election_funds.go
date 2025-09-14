package models

import (
	"time"

	"gorm.io/gorm"
)

// ElectionFunds は選挙資金収支報告書のデータを表す構造体（GORMモデル）
type ElectionFunds struct {
	ID                  uint      `json:"id" gorm:"primaryKey"`
	UserID              uint      `json:"user_id" gorm:"not null;comment:ユーザーID"`
	CandidateName       string    `json:"candidate_name" gorm:"not null;comment:候補者名"`
	ElectionType        string    `json:"election_type" gorm:"not null;comment:選挙種別"`
	ElectionArea        string    `json:"election_area" gorm:"not null;comment:選挙区"`
	ElectionDate        time.Time `json:"election_date" gorm:"not null;comment:選挙実施日"`
	PoliticalParty      string    `json:"political_party" gorm:"comment:所属政党"`

	// TODO: ここに選挙資金収支報告書の具体的なデータ構造を定義
	// 例：収入、支出、寄付、内訳等のフィールド
	// TotalIncome         int64     `json:"total_income" gorm:"comment:収入合計"`
	// TotalExpenditure    int64     `json:"total_expenditure" gorm:"comment:支出合計"`
	// Balance             int64     `json:"balance" gorm:"comment:収支差額"`
	// Donations           int64     `json:"donations" gorm:"comment:寄付金額"`
	// PersonalFunds       int64     `json:"personal_funds" gorm:"comment:自己資金"`
	// PartySupport        int64     `json:"party_support" gorm:"comment:政党支援金"`
	// IncomeBreakdown     string    `json:"income_breakdown" gorm:"type:text;comment:収入内訳（JSON形式）"`
	// ExpenditureBreakdown string   `json:"expenditure_breakdown" gorm:"type:text;comment:支出内訳（JSON形式）"`

	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// TableName はElectionFundsテーブル名を指定
func (ElectionFunds) TableName() string {
	return "election_funds"
}

// ElectionFundsRepository は選挙資金関連のデータベース操作を行う
type ElectionFundsRepository struct {
	DB *gorm.DB
}

// NewElectionFundsRepository は新しいElectionFundsRepositoryを作成
func NewElectionFundsRepository(db *gorm.DB) *ElectionFundsRepository {
	return &ElectionFundsRepository{DB: db}
}

// GetAllElectionFunds は全選挙資金データを取得
func (r *ElectionFundsRepository) GetAllElectionFunds() ([]ElectionFunds, error) {
	var electionFunds []ElectionFunds

	err := r.DB.Order("election_date DESC, created_at DESC").Find(&electionFunds).Error
	if err != nil {
		return nil, err
	}
	return electionFunds, nil
}

// GetElectionFundsByID は指定されたIDの選挙資金データを取得
func (r *ElectionFundsRepository) GetElectionFundsByID(id int) (ElectionFunds, error) {
	var electionFunds ElectionFunds

	err := r.DB.First(&electionFunds, id).Error
	if err != nil {
		return ElectionFunds{}, err
	}

	return electionFunds, nil
}

// CreateElectionFunds は新しい選挙資金データを作成
func (r *ElectionFundsRepository) CreateElectionFunds(electionFunds *ElectionFunds) error {
	return r.DB.Create(electionFunds).Error
}

// UpdateElectionFunds は選挙資金データを更新
func (r *ElectionFundsRepository) UpdateElectionFunds(electionFunds *ElectionFunds) error {
	return r.DB.Save(electionFunds).Error
}

// DeleteElectionFunds は選挙資金データを削除
func (r *ElectionFundsRepository) DeleteElectionFunds(id uint) error {
	return r.DB.Delete(&ElectionFunds{}, id).Error
}

// GetElectionFundsByCandidate は指定された候補者名の選挙資金データを取得
func (r *ElectionFundsRepository) GetElectionFundsByCandidate(candidateName string) ([]ElectionFunds, error) {
	var electionFunds []ElectionFunds

	err := r.DB.Where("candidate_name LIKE ?", "%"+candidateName+"%").Order("election_date DESC, created_at DESC").Find(&electionFunds).Error
	if err != nil {
		return nil, err
	}
	return electionFunds, nil
}

// GetElectionFundsByElectionType は指定された選挙種別の選挙資金データを取得
func (r *ElectionFundsRepository) GetElectionFundsByElectionType(electionType string) ([]ElectionFunds, error) {
	var electionFunds []ElectionFunds

	err := r.DB.Where("election_type = ?", electionType).Order("election_date DESC, created_at DESC").Find(&electionFunds).Error
	if err != nil {
		return nil, err
	}
	return electionFunds, nil
}

// GetElectionFundsByElectionArea は指定された選挙区の選挙資金データを取得
func (r *ElectionFundsRepository) GetElectionFundsByElectionArea(electionArea string) ([]ElectionFunds, error) {
	var electionFunds []ElectionFunds

	err := r.DB.Where("election_area LIKE ?", "%"+electionArea+"%").Order("election_date DESC, created_at DESC").Find(&electionFunds).Error
	if err != nil {
		return nil, err
	}
	return electionFunds, nil
}

// GetElectionFundsByDateRange は指定された期間の選挙資金データを取得
func (r *ElectionFundsRepository) GetElectionFundsByDateRange(startDate, endDate time.Time) ([]ElectionFunds, error) {
	var electionFunds []ElectionFunds

	err := r.DB.Where("election_date BETWEEN ? AND ?", startDate, endDate).Order("election_date DESC, created_at DESC").Find(&electionFunds).Error
	if err != nil {
		return nil, err
	}
	return electionFunds, nil
}

// GetElectionFundsByPoliticalParty は指定された政党の選挙資金データを取得
func (r *ElectionFundsRepository) GetElectionFundsByPoliticalParty(politicalParty string) ([]ElectionFunds, error) {
	var electionFunds []ElectionFunds

	err := r.DB.Where("political_party LIKE ?", "%"+politicalParty+"%").Order("election_date DESC, created_at DESC").Find(&electionFunds).Error
	if err != nil {
		return nil, err
	}
	return electionFunds, nil
}
