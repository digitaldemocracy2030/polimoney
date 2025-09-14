package validators

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/digitaldemocracy2030/polimoney/models"
)

// ValidatePoliticalFunds は政治資金収支報告書データの妥当性を検証
func ValidatePoliticalFunds(politicalFunds *models.PoliticalFunds) error {
	// 団体名の検証
	if err := validateOrganizationName(politicalFunds.OrganizationName); err != nil {
		return fmt.Errorf("団体名の検証エラー: %w", err)
	}

	// 団体種別の検証
	if err := validateOrganizationType(politicalFunds.OrganizationType); err != nil {
		return fmt.Errorf("団体種別の検証エラー: %w", err)
	}

	// 代表者名の検証
	if err := validateRepresentativeName(politicalFunds.RepresentativeName); err != nil {
		return fmt.Errorf("代表者名の検証エラー: %w", err)
	}

	// 報告年度の検証
	if err := validateReportYear(politicalFunds.ReportYear); err != nil {
		return fmt.Errorf("報告年度の検証エラー: %w", err)
	}

	// TODO: ここに追加の政治資金データの検証ロジックを追加
	// 例：収入・支出の金額、内訳データの形式等の検証
	// if err := validateFinancialData(politicalFunds); err != nil {
	//     return fmt.Errorf("財務データの検証エラー: %w", err)
	// }

	return nil
}

// validateOrganizationName は団体名の妥当性を検証
func validateOrganizationName(organizationName string) error {
	if organizationName == "" {
		return errors.New("団体名は必須です")
	}

	// 文字列の前後の空白を除去
	organizationName = strings.TrimSpace(organizationName)
	if organizationName == "" {
		return errors.New("団体名は空白のみでは無効です")
	}

	// 長さの検証（最大255文字）
	if len(organizationName) > 255 {
		return errors.New("団体名は255文字以内で入力してください")
	}

	// 最小長の検証（2文字以上）
	if len(organizationName) < 2 {
		return errors.New("団体名は2文字以上で入力してください")
	}

	return nil
}

// validateOrganizationType は団体種別の妥当性を検証
func validateOrganizationType(organizationType string) error {
	if organizationType == "" {
		return errors.New("団体種別は必須です")
	}

	// 有効な団体種別のリスト
	validTypes := []string{
		"政党",
		"政治資金団体",
		"その他の政治団体",
		"資金管理団体",
		"政党の支部",
		"政治家個人",
	}

	organizationType = strings.TrimSpace(organizationType)
	for _, validType := range validTypes {
		if organizationType == validType {
			return nil
		}
	}

	return fmt.Errorf("無効な団体種別です。有効な種別: %v", validTypes)
}

// validateRepresentativeName は代表者名の妥当性を検証
func validateRepresentativeName(representativeName string) error {
	if representativeName == "" {
		return errors.New("代表者名は必須です")
	}

	// 文字列の前後の空白を除去
	representativeName = strings.TrimSpace(representativeName)
	if representativeName == "" {
		return errors.New("代表者名は空白のみでは無効です")
	}

	// 長さの検証（最大100文字）
	if len(representativeName) > 100 {
		return errors.New("代表者名は100文字以内で入力してください")
	}

	// 最小長の検証（2文字以上）
	if len(representativeName) < 2 {
		return errors.New("代表者名は2文字以上で入力してください")
	}

	return nil
}

// validateReportYear は報告年度の妥当性を検証
func validateReportYear(reportYear int) error {
	currentYear := time.Now().Year()

	// 年度が0の場合はエラー
	if reportYear == 0 {
		return errors.New("報告年度は必須です")
	}

	// 最小年度の検証（1990年以降）
	if reportYear < 1990 {
		return errors.New("報告年度は1990年以降で入力してください")
	}

	// 未来の年度の検証（現在年度+1年まで）
	if reportYear > currentYear+1 {
		return fmt.Errorf("報告年度は%d年以下で入力してください", currentYear+1)
	}

	return nil
}

// TODO: 追加の検証関数を実装
// validateFinancialData は財務データの妥当性を検証
// func validateFinancialData(politicalFunds *models.PoliticalFunds) error {
//     // 収入・支出の金額が負の値でないかチェック
//     if politicalFunds.Income < 0 {
//         return errors.New("収入は0以上である必要があります")
//     }
//     if politicalFunds.Expenditure < 0 {
//         return errors.New("支出は0以上である必要があります")
//     }
//
//     // 収支差額の計算が正しいかチェック
//     expectedBalance := politicalFunds.Income - politicalFunds.Expenditure
//     if politicalFunds.Balance != expectedBalance {
//         return errors.New("収支差額の計算が正しくありません")
//     }
//
//     return nil
// }
