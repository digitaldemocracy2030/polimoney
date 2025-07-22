package middleware

import (
	"crypto/tls"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	return router
}

func TestCORS(t *testing.T) {
	router := setupTestRouter()
	router.Use(CORS())
	router.GET("/test", func(c *gin.Context) {
		c.String(200, "OK")
	})

	t.Run("sets CORS headers", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, "*", w.Header().Get("Access-Control-Allow-Origin"))
		assert.Equal(t, "GET, POST, PUT, DELETE, OPTIONS", w.Header().Get("Access-Control-Allow-Methods"))
		assert.Contains(t, w.Header().Get("Access-Control-Allow-Headers"), "Authorization")
		assert.Equal(t, "true", w.Header().Get("Access-Control-Allow-Credentials"))
		assert.Equal(t, 200, w.Code)
	})

	t.Run("handles OPTIONS request", func(t *testing.T) {
		req, _ := http.NewRequest("OPTIONS", "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, 204, w.Code)
		assert.Equal(t, "*", w.Header().Get("Access-Control-Allow-Origin"))
	})
}

func TestDatabaseMiddleware(t *testing.T) {
	router := setupTestRouter()
	
	// Create a mock database
	db := &gorm.DB{}
	
	router.Use(DatabaseMiddleware(db))
	router.GET("/test", func(c *gin.Context) {
		dbFromContext, exists := c.Get("db")
		assert.True(t, exists)
		assert.Equal(t, db, dbFromContext)
		c.String(200, "OK")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
}

func TestErrorHandler(t *testing.T) {
	router := setupTestRouter()
	router.Use(ErrorHandler())

	t.Run("no error", func(t *testing.T) {
		router.GET("/no-error", func(c *gin.Context) {
			c.String(200, "OK")
		})

		req, _ := http.NewRequest("GET", "/no-error", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, 200, w.Code)
		assert.Equal(t, "OK", w.Body.String())
	})

	t.Run("with error", func(t *testing.T) {
		router.GET("/with-error", func(c *gin.Context) {
			c.Error(gin.Error{Err: assert.AnError, Type: gin.ErrorTypePublic})
			c.JSON(500, gin.H{"error": "Internal Server Error"})
		})

		req, _ := http.NewRequest("GET", "/with-error", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, 500, w.Code)
	})
}

func TestRequestID(t *testing.T) {
	router := setupTestRouter()
	router.Use(RequestID())
	
	var capturedRequestID string
	router.GET("/test", func(c *gin.Context) {
		requestID, exists := c.Get("request_id")
		assert.True(t, exists)
		capturedRequestID = requestID.(string)
		c.String(200, "OK")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.NotEmpty(t, capturedRequestID)
	assert.Equal(t, capturedRequestID, w.Header().Get("X-Request-ID"))
}

func TestHTTPSRedirect(t *testing.T) {
	// Save original env
	originalTrustedHost := os.Getenv("TRUSTED_HOST")
	defer os.Setenv("TRUSTED_HOST", originalTrustedHost)

	t.Run("redirects HTTP to HTTPS", func(t *testing.T) {
		router := setupTestRouter()
		router.Use(HTTPSRedirect())
		router.GET("/test", func(c *gin.Context) {
			c.String(200, "OK")
		})

		req, _ := http.NewRequest("GET", "/test", nil)
		req.Host = "example.com"
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusMovedPermanently, w.Code)
		// RequestURI is empty in tests, so only the host is included
		location := w.Header().Get("Location")
		assert.Equal(t, "https://example.com", location)
	})

	t.Run("does not redirect HTTPS", func(t *testing.T) {
		router := setupTestRouter()
		router.Use(HTTPSRedirect())
		router.GET("/test", func(c *gin.Context) {
			c.String(200, "OK")
		})

		req, _ := http.NewRequest("GET", "/test", nil)
		req.TLS = &tls.ConnectionState{} // Simulate HTTPS
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, 200, w.Code)
		assert.Equal(t, "OK", w.Body.String())
	})

	t.Run("uses trusted host from env", func(t *testing.T) {
		os.Setenv("TRUSTED_HOST", "trusted.example.com")
		
		router := setupTestRouter()
		router.Use(HTTPSRedirect())
		router.GET("/test", func(c *gin.Context) {
			c.String(200, "OK")
		})

		req, _ := http.NewRequest("GET", "/test", nil)
		req.Host = "untrusted.com"
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusMovedPermanently, w.Code)
		// RequestURI is empty in tests, so only the host is included
		assert.Equal(t, "https://trusted.example.com", w.Header().Get("Location"))
	})
}

func TestGenerateJWT(t *testing.T) {
	// Save original env
	originalSecret := os.Getenv("JWT_SECRET")
	defer os.Setenv("JWT_SECRET", originalSecret)

	os.Setenv("JWT_SECRET", "test-secret")

	t.Run("generates valid JWT", func(t *testing.T) {
		userID := uint(123)
		tokenString, err := GenerateJWT(userID)

		assert.NoError(t, err)
		assert.NotEmpty(t, tokenString)

		// Verify token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte("test-secret"), nil
		})

		assert.NoError(t, err)
		assert.True(t, token.Valid)

		// Check claims
		claims, ok := token.Claims.(jwt.MapClaims)
		assert.True(t, ok)
		assert.Equal(t, float64(userID), claims["user_id"])
		assert.Greater(t, claims["exp"].(float64), float64(time.Now().Unix()))
	})

	t.Run("generates different tokens for different users", func(t *testing.T) {
		token1, err1 := GenerateJWT(1)
		token2, err2 := GenerateJWT(2)

		assert.NoError(t, err1)
		assert.NoError(t, err2)
		assert.NotEqual(t, token1, token2)
	})
}

func TestJWTAuthMiddleware(t *testing.T) {
	// Save original env
	originalSecret := os.Getenv("JWT_SECRET")
	defer os.Setenv("JWT_SECRET", originalSecret)

	os.Setenv("JWT_SECRET", "test-secret")

	t.Run("missing authorization header", func(t *testing.T) {
		router := setupTestRouter()
		router.Use(JWTAuthMiddleware())
		router.GET("/protected", func(c *gin.Context) {
			c.String(200, "OK")
		})

		req, _ := http.NewRequest("GET", "/protected", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "認証トークンが必要です")
	})

	t.Run("invalid authorization header format", func(t *testing.T) {
		router := setupTestRouter()
		router.Use(JWTAuthMiddleware())
		router.GET("/protected", func(c *gin.Context) {
			c.String(200, "OK")
		})

		req, _ := http.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "InvalidFormat")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "不正な認証ヘッダー形式です")
	})

	t.Run("invalid token", func(t *testing.T) {
		router := setupTestRouter()
		router.Use(JWTAuthMiddleware())
		router.GET("/protected", func(c *gin.Context) {
			c.String(200, "OK")
		})

		req, _ := http.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer invalid.token.here")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "無効なトークンです")
	})

	t.Run("valid token", func(t *testing.T) {
		router := setupTestRouter()
		router.Use(JWTAuthMiddleware())
		
		var capturedUserID interface{}
		router.GET("/protected", func(c *gin.Context) {
			capturedUserID, _ = c.Get("user_id")
			c.String(200, "OK")
		})

		// Generate valid token
		token, _ := GenerateJWT(123)

		req, _ := http.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, 200, w.Code)
		assert.Equal(t, "OK", w.Body.String())
		assert.Equal(t, float64(123), capturedUserID)
	})

	t.Run("expired token", func(t *testing.T) {
		router := setupTestRouter()
		router.Use(JWTAuthMiddleware())
		router.GET("/protected", func(c *gin.Context) {
			c.String(200, "OK")
		})

		// Create expired token
		claims := jwt.MapClaims{
			"user_id": 123,
			"exp":     time.Now().Add(-time.Hour).Unix(), // 1 hour ago
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, _ := token.SignedString([]byte("test-secret"))

		req, _ := http.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+tokenString)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		// JWT library returns error before our expiration check
		assert.Contains(t, w.Body.String(), "token is expired")
	})
}