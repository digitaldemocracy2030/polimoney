package middleware

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
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

// HTTPSRedirect はHTTPリダイレクトを行うミドルウェア
func HTTPSRedirect() gin.HandlerFunc {
	return func(c *gin.Context) {
		// TLS情報がなければ（=HTTPアクセスなら）リダイレクト
		if c.Request.TLS == nil {
			url := "https://" + c.Request.Host + c.Request.RequestURI
			c.Redirect(http.StatusMovedPermanently, url)
			c.Abort()
			return
		}
		c.Next()
	}
}

// GenerateJWT はJWTを生成する
func GenerateJWT(userID uint) (string, error) {
    secret := os.Getenv("JWT_SECRET")
    claims := jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(time.Hour * 24).Unix(), // 24時間有効
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret))
}

// JWTAuthMiddleware はJWT認証を行い、トークンの検証も内部で行うミドルウェア
func JWTAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Authorizationヘッダーからトークンを取得
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "JWTAuthMiddleware: 認証トークンが必要です",
            })
            c.Abort()
            return
        }

        // "Bearer "プレフィックスをチェック
        const bearerPrefix = "Bearer "
        if len(authHeader) < len(bearerPrefix) || authHeader[:len(bearerPrefix)] != bearerPrefix {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "JWTAuthMiddleware: 不正な認証ヘッダー形式です",
            })
            c.Abort()
            return
        }

        // トークン部分を抽出
        tokenString := authHeader[len(bearerPrefix):]

        // JWTトークンを検証
        secret := os.Getenv("JWT_SECRET")
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("JWTAuthMiddleware: 不正な署名方法です")
            }
            return []byte(secret), nil
        })
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "JWTAuthMiddleware: 無効なトークンです",
                "message": err.Error(),
            })
            c.Abort()
            return
        }

        // クレームを取得
        if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
            // ユーザーIDをコンテキストに設定
            if userID, exists := claims["user_id"]; exists {
                c.Set("user_id", userID)
            }

            // トークンの有効期限をチェック
            if exp, ok := claims["exp"].(float64); ok {
                if time.Now().Unix() > int64(exp) {
                    c.JSON(http.StatusUnauthorized, gin.H{
                        "error": "JWTAuthMiddleware: トークンの有効期限が切れています",
                    })
                    c.Abort()
                    return
                }
            }
        } else {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "JWTAuthMiddleware: 無効なトークンクレームです",
            })
            c.Abort()
            return
        }

        // 次のハンドラーに進む
        c.Next()
    }
}
