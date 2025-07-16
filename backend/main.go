package main

import (
    "github.com/gin-gonic/gin"
)

func main() {
	// ルーターを作成
    r := gin.Default()

	// ハンドラー
    r.GET("/api/hello", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Hello from Go API!",
        })
    })

	// TODO: データベースの接続
	// app/{議員さんid}/page.tsxで表示する前提
	// 収入・支出の図の作成はreact側でやる

	// サーバーを起動
    r.Run(":8080")
}
