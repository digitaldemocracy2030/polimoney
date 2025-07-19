package main

import (
	"log"
	"os"
	"time"

	"github.com/digitaldemocracy2030/polimoney/config"
	"github.com/digitaldemocracy2030/polimoney/controllers"
	"github.com/digitaldemocracy2030/polimoney/middleware"
	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// サーバー起動時刻を保存
	startTime := time.Now().Format("2006-01-02 15:04:05")

	// データベース接続を確立
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("データベース接続エラー: %v", err)
	}
	defer db.Close()

	// Ginルーターを作成
	r := gin.Default()

	// ミドルウェアを設定
	r.Use(middleware.CORS())
	r.Use(middleware.RequestID())
	r.Use(middleware.DatabaseMiddleware(db))
	r.Use(middleware.ErrorHandler())

	// コントローラーを初期化
	userController := controllers.NewUserController(db)

	// ルートハンドラー
	r.GET("/", func(c *gin.Context) {
		c.String(200, "Welcome to the API - Started at "+startTime)
	})
	r.POST("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// ヘルスチェックエンドポイント
	r.GET("/health", userController.HealthCheck)

	// API v1 グループ
	v1 := r.Group("/api/v1")
	{
		// ユーザー関連のエンドポイント
		admin := v1.Group("/admin")
		{
			admin.GET("", userController.GetAllUsers)     // 全ユーザー取得
			admin.GET("/:id", userController.GetUserByID) // 特定ユーザー取得
		}
	}

	// サーバーを起動
	log.Printf("Server starting on port %s at %s", port, startTime)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("サーバー起動エラー: %v", err)
	}
}
