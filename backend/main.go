package main

import (
	"log"
	"os"
	"time"

	"github.com/digitaldemocracy2030/polimoney/config"
	"github.com/digitaldemocracy2030/polimoney/controllers"
	"github.com/digitaldemocracy2030/polimoney/middleware"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// .envファイルを読み込む
	if err := godotenv.Load(); err != nil {
		log.Println("main: .envファイルが見つかりませんでした。読み込みをスキップします。")
	}

	// 必須環境変数をチェック
	config.CheckRequiredEnvVariables()

	// ポート番号を設定
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// サーバー起動時刻を日本時間（JST）で保存
	jst, _ := time.LoadLocation("Asia/Tokyo")
	startTime := time.Now().In(jst).Format("2006-01-02 15:04:05")

	// データベース接続を確立
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("main: データベース接続エラー: %v", err)
	}

	// GORM接続のクリーンアップ
	defer func() {
		sqlDB, err := db.DB()
		if err != nil {
			log.Printf("main: データベース接続の取得に失敗: %v", err)
			return
		}
		sqlDB.Close()
	}()

	// Ginルーターを作成
	r := gin.Default()

	// ミドルウェアを設定
	env := os.Getenv("ENV")
	if env == "production" {
		r.Use(middleware.HTTPSRedirect())
	}
	r.Use(middleware.CORS())                 // CORSミドルウェアを追加
	r.Use(middleware.RequestID())            // Request IDミドルウェアを追加
	r.Use(middleware.DatabaseMiddleware(db)) // データベース接続ミドルウェアを追加
	r.Use(middleware.ErrorHandler())         // エラーハンドリングミドルウェアを追加

	// コントローラー初期化
	userController := controllers.NewUserController(db)
	healthController := controllers.NewHealthController(db)
	authController := controllers.NewAuthController(db)
	profileController := controllers.NewProfileController(db)
	politicalFundsController := controllers.NewPoliticalFundsController(db)
	electionFundsController := controllers.NewElectionFundsController(db)

	// エンドポイントを設定
	// ルートハンドラー (開発用)
	r.GET("/", func(c *gin.Context) {
		c.String(200, "Welcome to the API - Started at "+startTime)
	})

	// API v1 グループ
	v1 := r.Group("/api/v1")
	{
		// ヘルスチェック controllers/health.go
		v1.GET("/health", healthController.HealthCheck)

		// ログイン controllers/auth.go
		v1.POST("/signup", authController.Signup)
		v1.POST("/login", authController.Login)

		// 以下、管理者用
		// TODO: ロール確認のミドルウェアを追加する
		admin := v1.Group("/admin")
		admin.Use(middleware.JWTAuthMiddleware()) // ログイン必須
		{
			// ユーザー関連の controllers/user.go
			users := admin.Group("/users")
			{
				users.GET("", userController.GetAllUsers)     // 全ユーザー取得
				users.GET("/:id", userController.GetUserByID) // 特定ユーザー取得
			}
			// 政治資金収支報告書
			politicalFunds := admin.Group("/political_funds")
			{
				// TODO: GETも追加する
				// 政治資金収支報告書のデータ追加 controllers/political_funds.go
				politicalFunds.POST("", politicalFundsController.PostPoliticalFunds)
			}

			// 選挙運動費用収支報告書
			electionFunds := admin.Group("/election_funds")
			{
				// TODO: GETも追加する
				// 選挙運動費用収支報告書のデータ追加 controllers/election_funds.go
				electionFunds.POST("", electionFundsController.PostElectionFunds)
			}
		}

		// マイページ (自分自身の情報)
		profile := v1.Group("/profile")
		profile.Use(middleware.JWTAuthMiddleware()) // ログイン必須
		{
			// TODO: マイページ以下のエンドポイント (データの確認・編集などを想定)
			// マイページの取得 controllers/profile.go
			profile.GET("", profileController.GetMyPage)
		}

		// TODO: ユーザー自身の政治資金収支報告書・選挙運動費用収支報告書の登録機能を追加
	}

	// サーバーを起動
	log.Printf("Server starting on port %s at %s", port, startTime)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("サーバー起動エラー: %v", err)
	}
}
