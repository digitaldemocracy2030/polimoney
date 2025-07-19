-- 追加のテストユーザーデータ
INSERT INTO users (username, email, password_hash, role_id, email_verified, is_active) VALUES
    ('john_doe', 'john.doe@example.com', 'TODO:CREATE_HASH', 2, TRUE, TRUE),
    ('jane_smith', 'jane.smith@example.com', 'TODO:CREATE_HASH', 2, TRUE, TRUE),
    ('inactive_user', 'inactive@example.com', 'TODO:CREATE_HASH', 2, FALSE, FALSE),
    ('unverified_user', 'unverified@example.com', 'TODO:CREATE_HASH', 2, FALSE, TRUE);

-- サンプルのログイン試行データ
INSERT INTO login_attempts (email, success, attempted_at) VALUES
    ('admin@example.com', TRUE, NOW() - INTERVAL '1 hour'),
    ('user@example.com', TRUE, NOW() - INTERVAL '2 hours'),
    ('admin@example.com', TRUE, NOW() - INTERVAL '1 day'),
    ('invalid@example.com', FALSE, NOW() - INTERVAL '30 minutes'),
    ('invalid@example.com', FALSE, NOW() - INTERVAL '29 minutes'),
    ('invalid@example.com', FALSE, NOW() - INTERVAL '28 minutes');

-- サンプルのアクティブセッション（テスト用）
INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES
    (1, 'admin_session_token_123456789', NOW() + INTERVAL '7 days'),
    (2, 'user_session_token_987654321', NOW() + INTERVAL '1 day'),
    (3, 'moderator_session_token_456789123', NOW() + INTERVAL '3 days');

-- 期限切れのセッション（クリーンアップテスト用）
INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES
    (4, 'expired_session_token_111', NOW() - INTERVAL '1 day'),
    (2, 'old_expired_session_222', NOW() - INTERVAL '1 week');

-- サンプルのパスワードリセットトークン
INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES
    (2, 'reset_token_active_123456', NOW() + INTERVAL '1 hour', FALSE),
    (3, 'reset_token_used_789012', NOW() + INTERVAL '30 minutes', TRUE),
    (4, 'reset_token_expired_345678', NOW() - INTERVAL '1 day', FALSE);
