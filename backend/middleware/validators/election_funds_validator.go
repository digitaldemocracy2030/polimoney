package validators

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/digitaldemocracy2030/polimoney/models"
)

// ValidateElectionFunds は選挙資金収支報告書データの妥当性を検証
func ValidateElectionFunds(electionFunds *models.ElectionFunds) error {
	// 候補者名の検証
	if err := validateCandidateName(electionFunds.CandidateName); err != nil {
		return fmt.Errorf("候補者名の検証エラー: %w", err)
	}

	// 選挙種別の検証
	if err := validateElectionType(electionFunds.ElectionType); err != nil {
		return fmt.Errorf("選挙種別の検証エラー: %w", err)
	}

	// 選挙区の検証
	if err := validateElectionArea(electionFunds.ElectionArea); err != nil {
		return fmt.Errorf("選挙区の検証エラー: %w", err)
	}

	// 選挙実施日の検証
	if err := validateElectionDate(electionFunds.ElectionDate); err != nil {
		return fmt.Errorf("選挙実施日の検証エラー: %w", err)
	}

	// 所属政党の検証（オプショナル）
	if electionFunds.PoliticalParty != "" {
		if err := validatePoliticalParty(electionFunds.PoliticalParty); err != nil {
			return fmt.Errorf("所属政党の検証エラー: %w", err)
		}
	}

	// TODO: ここに追加の選挙資金データの検証ロジックを追加
	// 例：収入・支出の金額、寄付金額等の検証
	// if err := validateFinancialData(electionFunds); err != nil {
	//     return fmt.Errorf("財務データの検証エラー: %w", err)
	// }

	return nil
}

// validateCandidateName は候補者名の妥当性を検証
func validateCandidateName(candidateName string) error {
	if candidateName == "" {
		return errors.New("候補者名は必須です")
	}

	// 文字列の前後の空白を除去
	candidateName = strings.TrimSpace(candidateName)
	if candidateName == "" {
		return errors.New("候補者名は空白のみでは無効です")
	}

	return nil
}

// validateElectionType は選挙種別の妥当性を検証
func validateElectionType(electionType string) error {
	if electionType == "" {
		return errors.New("選挙種別は必須です")
	}

	// 有効な選挙種別のリスト
	validTypes := []string{
		"衆議院議員総選挙",
		"参議院議員通常選挙",
		"都道府県知事選挙",
		"都道府県議会議員選挙",
		"市町村長選挙",
		"市町村議会議員選挙",
		"政令指定都市長選挙",
		"政令指定都市議会議員選挙",
		"東京都特別区長選挙",
		"東京都特別区議会議員選挙",
		"補欠選挙",
		"再選挙",
	}

	electionType = strings.TrimSpace(electionType)
	for _, validType := range validTypes {
		if electionType == validType {
			return nil
		}
	}

	return fmt.Errorf("無効な選挙種別です。有効な種別: %v", validTypes)
}

// validateElectionArea は選挙区の妥当性を検証
func validateElectionArea(electionArea string) error {
	if electionArea == "" {
		return errors.New("選挙区は必須です")
	}

	// 文字列の前後の空白を除去
	electionArea = strings.TrimSpace(electionArea)
	if electionArea == "" {
		return errors.New("選挙区は空白のみでは無効です")
	}

	return nil
}

// validateElectionDate は選挙実施日の妥当性を検証
func validateElectionDate(electionDate time.Time) error {
	// ゼロ値の場合はエラー
	if electionDate.IsZero() {
		return errors.New("選挙実施日は必須です")
	}

	// 最小日付の検証（1945年以降）
	minDate := time.Date(1945, 1, 1, 0, 0, 0, 0, time.UTC)
	if electionDate.Before(minDate) {
		return errors.New("選挙実施日は1945年以降で入力してください")
	}

	// 未来の日付の検証（現在日時+2年まで）
	maxDate := time.Now().AddDate(2, 0, 0)
	if electionDate.After(maxDate) {
		return fmt.Errorf("選挙実施日は%s以前で入力してください", maxDate.Format("2006-01-02"))
	}

	return nil
}

// validatePoliticalParty は所属政党の妥当性を検証
func validatePoliticalParty(politicalParty string) error {
	// 文字列の前後の空白を除去
	politicalParty = strings.TrimSpace(politicalParty)
	if politicalParty == "" {
		return errors.New("所属政党は空白のみでは無効です")
	}

	// 「無所属」の場合は許可
	if politicalParty == "無所属" {
		return nil
	}

	return nil
}

// TODO: 追加の検証関数を実装
// validateFinancialData は財務データの妥当性を検証
// func validateFinancialData(electionFunds *models.ElectionFunds) error {
//     // 収入・支出の金額が負の値でないかチェック
//     if electionFunds.TotalIncome < 0 {
//         return errors.New("収入合計は0以上である必要があります")
//     }
//     if electionFunds.TotalExpenditure < 0 {
//         return errors.New("支出合計は0以上である必要があります")
//     }
//
//     // 収支差額の計算が正しいかチェック
//     expectedBalance := electionFunds.TotalIncome - electionFunds.TotalExpenditure
//     if electionFunds.Balance != expectedBalance {
//         return errors.New("収支差額の計算が正しくありません")
//     }
//
//     // 寄付金額が収入合計を超えていないかチェック
//     if electionFunds.Donations > electionFunds.TotalIncome {
//         return errors.New("寄付金額が収入合計を超えています")
//     }
//
//     // 自己資金が収入合計を超えていないかチェック
//     if electionFunds.PersonalFunds > electionFunds.TotalIncome {
//         return errors.New("自己資金が収入合計を超えています")
//     }
//
//     // 政党支援金が収入合計を超えていないかチェック
//     if electionFunds.PartySupport > electionFunds.TotalIncome {
//         return errors.New("政党支援金が収入合計を超えています")
//     }
//
//     return nil
// }
