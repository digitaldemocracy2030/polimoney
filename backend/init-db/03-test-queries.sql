-- ログインシステムのテストクエリ集
-- これらのクエリは実際には実行されませんが、動作確認の参考として保存されます

-- 1. 全ユーザーとロール情報の表示
-- SELECT u.id, u.username, u.email, r.name as role, u.is_active, u.email_verified
-- FROM users u
-- JOIN roles r ON u.role_id = r.id
-- ORDER BY u.created_at;

-- 2. ログイン認証のクエリ例（emailでユーザー検索）
-- SELECT u.id, u.username, u.email, u.password_hash, r.name as role, u.is_active, u.email_verified
-- FROM users u
-- JOIN roles r ON u.role_id = r.id
-- WHERE u.email = 'admin@example.com' AND u.is_active = TRUE;

-- 3. アクティブなセッションの確認
-- SELECT s.session_token, u.username, u.email, s.expires_at, s.created_at
-- FROM user_sessions s
-- JOIN users u ON s.user_id = u.id
-- WHERE s.expires_at > NOW()
-- ORDER BY s.created_at DESC;

-- 4. ログイン試行履歴の確認
-- SELECT email, success, attempted_at
-- FROM login_attempts
-- WHERE email = 'admin@example.com'
-- ORDER BY attempted_at DESC
-- LIMIT 10;

-- 5. 失敗したログイン試行の統計
-- SELECT email, COUNT(*) as failed_attempts, MAX(attempted_at) as last_attempt
-- FROM login_attempts
-- WHERE success = FALSE AND attempted_at > NOW() - INTERVAL '1 hour'
-- GROUP BY email
-- HAVING COUNT(*) >= 3;

-- 6. ロール別ユーザー数の統計
-- SELECT r.name as role, COUNT(u.id) as user_count
-- FROM roles r
-- LEFT JOIN users u ON r.id = u.role_id
-- GROUP BY r.id, r.name
-- ORDER BY user_count DESC;

-- 7. 有効なパスワードリセットトークンの確認
-- SELECT t.token, u.username, u.email, t.expires_at, t.created_at
-- FROM password_reset_tokens t
-- JOIN users u ON t.user_id = u.id
-- WHERE t.used = FALSE AND t.expires_at > NOW();

-- 8. 期限切れセッションの削除（クリーンアップ用）
-- DELETE FROM user_sessions WHERE expires_at < NOW();

-- 9. 古いログイン試行履歴の削除（30日以上前）
-- DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '30 days';

-- 10. ユーザーの最終ログイン更新
-- UPDATE users SET last_login = NOW() WHERE id = 1;
