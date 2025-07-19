package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

	// ルーターを作成
    r := gin.Default()

	// ハンドラー
	r.GET("/", func(c *gin.Context) {
		c.String(200, "Welcome to the API")
	})
    r.POST("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "status": "ok",
        })
    })

	// TODO: データベースの接続
	// テスト用にdocker-composeで起動しているPostgreSQLに接続する
	// 本番環境では、Azure Database for PostgreSQLに接続する

	// app/{議員さんid}/page.tsxで表示する前提
	// 収入・支出の図の作成はreact側でやる

	// サーバーを起動
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
