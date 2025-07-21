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
		os.Exit(1)
	}
}
