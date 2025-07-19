package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// CORS はCORSヘッダーを設定するミドルウェア
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type")
		c.Header("Access-Control-Allow-Credentials", "true")

		// OPTIONSリクエストの場合は処理を終了
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// DatabaseMiddleware はデータベース接続をコンテキストに設定するミドルウェア
func DatabaseMiddleware(db interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	}
}

// ErrorHandler はエラーハンドリング用のミドルウェア
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// エラーが発生した場合の処理
		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			log.Printf("エラーが発生しました: %v", err.Error())

			// エラーレスポンスを返す
			c.JSON(500, gin.H{
				"error":   "内部サーバーエラー",
				"message": "処理中にエラーが発生しました",
			})
		}
	}
}

// RequestID はリクエストにユニークなIDを付与するミドルウェア
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := generateRequestID()
		c.Header("X-Request-ID", requestID)
		c.Set("request_id", requestID)
		c.Next()
	}
}

// generateRequestID は簡単なリクエストIDを生成
func generateRequestID() string {
	return time.Now().Format("20060102150405") + "-" + time.Now().Format("000000")
}
