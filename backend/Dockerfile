# マルチステージビルド
FROM golang:1.24-alpine AS builder

# 作業ディレクトリを設定
WORKDIR /app

# 必要なパッケージをインストール
RUN apk add --no-cache git

# Go modulesのファイルをコピー
COPY go.mod go.sum ./

# 依存関係をダウンロード
RUN go mod download

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# 本番用イメージ
FROM alpine:latest

# 必要なパッケージをインストール
RUN apk --no-cache add ca-certificates postgresql-client tzdata

# 作業ディレクトリを作成
WORKDIR /root/

# ビルドしたバイナリをコピー
COPY --from=builder /app/main .

# 待機スクリプトをコピー
COPY wait-for-postgres.sh .
RUN chmod +x wait-for-postgres.sh && \
    sed -i 's/\r$//' wait-for-postgres.sh

# ポートを公開
EXPOSE 8080

# アプリケーションを実行
CMD ["./wait-for-postgres.sh", "postgres", "./main"]
