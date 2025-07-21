package config

import (
	"log"
	"os"
)

// 必須環境変数をまとめてチェック
func CheckRequiredEnvVariables() {
	// 必須環境変数のリスト
	requiredEnvVariables := []string{
		"ENV",
		"PASSWORD_SALT",
		"JWT_SECRET",
	}

	var requirementSatisfied = true
	for _, v := range requiredEnvVariables {
		if os.Getenv(v) == "" {
			log.Printf("・%s\n", v)
			requirementSatisfied = false
		}
	}
	if !requirementSatisfied {
		log.Fatalf("config: 以上の環境変数が設定されていません。")
		log.Println("cp .env.example .env を実行して、環境変数を設定してください。")
		log.Println("または、以下のコマンドで個別に環境変数を追加できます:")
		for _, v := range requiredEnvVariables {
			log.Printf("export %s=your_value", v)
		}
		os.Exit(1)
	}
}
