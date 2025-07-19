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

	// ルーターを作成
    r := gin.Default()

	// サーバー起動時刻を保存
	startTime := time.Now().Format("2006-01-02 15:04:05")

	// データベース接続を確立
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("データベース接続エラー: %v", err)
	}
	defer db.Close()

	// ミドルウェアを設定
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())
	r.Use(middleware.RequestID())
	r.Use(middleware.DatabaseMiddleware(db))
	r.Use(middleware.ErrorHandler())

	// コントローラーを初期化
	userController := controllers.NewUserController(db)

	// ルートハンドラー
	r.GET("/", func(c *gin.Context) {
		c.String(200, "Welcome to the API")
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
		users := v1.Group("/users")
		{
			users.GET("", userController.GetAllUsers)     // 全ユーザー取得
			users.GET("/:id", userController.GetUserByID) // 特定ユーザー取得
		}
	}

	// サーバーを起動
	log.Printf("Server starting on port %s at %s", port, startTime)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("サーバー起動エラー: %v", err)
	}
}
