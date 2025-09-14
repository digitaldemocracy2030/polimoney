package models

import (
	"time"

	"gorm.io/gorm"
)

// PoliticalFunds は政治資金収支報告書のデータを表す構造体（GORMモデル）
type PoliticalFunds struct {
	ID                  uint      `json:"id" gorm:"primaryKey"`
	UserID              uint      `json:"user_id" gorm:"not null;comment:ユーザーID"`
	OrganizationName    string    `json:"organization_name" gorm:"not null;comment:団体名"`
	OrganizationType    string    `json:"organization_type" gorm:"not null;comment:団体種別"`
	RepresentativeName  string    `json:"representative_name" gorm:"not null;comment:代表者名"`
	ReportYear          int       `json:"report_year" gorm:"not null;comment:報告年度"`

	// TODO: ここに政治資金収支報告書の具体的なデータ構造を定義
	// 例：収入、支出、内訳等のフィールド
	// Income              int64     `json:"income" gorm:"comment:収入合計"`
	// Expenditure         int64     `json:"expenditure" gorm:"comment:支出合計"`
	// Balance             int64     `json:"balance" gorm:"comment:収支差額"`
	// IncomeBreakdown     string    `json:"income_breakdown" gorm:"type:text;comment:収入内訳（JSON形式）"`
	// ExpenditureBreakdown string   `json:"expenditure_breakdown" gorm:"type:text;comment:支出内訳（JSON形式）"`

	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// TableName はPoliticalFundsテーブル名を指定
func (PoliticalFunds) TableName() string {
	return "political_funds"
}

// PoliticalFundsRepository は政治資金関連のデータベース操作を行う
type PoliticalFundsRepository struct {
	DB *gorm.DB
}

// NewPoliticalFundsRepository は新しいPoliticalFundsRepositoryを作成
func NewPoliticalFundsRepository(db *gorm.DB) *PoliticalFundsRepository {
	return &PoliticalFundsRepository{DB: db}
}

// GetAllPoliticalFunds は全政治資金データを取得
func (r *PoliticalFundsRepository) GetAllPoliticalFunds() ([]PoliticalFunds, error) {
	var politicalFunds []PoliticalFunds

	err := r.DB.Order("report_year DESC, created_at DESC").Find(&politicalFunds).Error
	if err != nil {
		return nil, err
	}
	return politicalFunds, nil
}

// GetPoliticalFundsByID は指定されたIDの政治資金データを取得
func (r *PoliticalFundsRepository) GetPoliticalFundsByID(id int) (PoliticalFunds, error) {
	var politicalFunds PoliticalFunds

	err := r.DB.First(&politicalFunds, id).Error
	if err != nil {
		return PoliticalFunds{}, err
	}

	return politicalFunds, nil
}

// CreatePoliticalFunds は新しい政治資金データを作成
func (r *PoliticalFundsRepository) CreatePoliticalFunds(politicalFunds *PoliticalFunds) error {
	return r.DB.Create(politicalFunds).Error
}

// UpdatePoliticalFunds は政治資金データを更新
func (r *PoliticalFundsRepository) UpdatePoliticalFunds(politicalFunds *PoliticalFunds) error {
	return r.DB.Save(politicalFunds).Error
}

// DeletePoliticalFunds は政治資金データを削除
func (r *PoliticalFundsRepository) DeletePoliticalFunds(id uint) error {
	return r.DB.Delete(&PoliticalFunds{}, id).Error
}

// GetPoliticalFundsByYear は指定された年度の政治資金データを取得
func (r *PoliticalFundsRepository) GetPoliticalFundsByYear(year int) ([]PoliticalFunds, error) {
	var politicalFunds []PoliticalFunds

	err := r.DB.Where("report_year = ?", year).Order("created_at DESC").Find(&politicalFunds).Error
	if err != nil {
		return nil, err
	}
	return politicalFunds, nil
}

// GetPoliticalFundsByOrganization は指定された団体名の政治資金データを取得
func (r *PoliticalFundsRepository) GetPoliticalFundsByOrganization(organizationName string) ([]PoliticalFunds, error) {
	var politicalFunds []PoliticalFunds

	err := r.DB.Where("organization_name LIKE ?", "%"+organizationName+"%").Order("report_year DESC, created_at DESC").Find(&politicalFunds).Error
	if err != nil {
		return nil, err
	}
	return politicalFunds, nil
}
