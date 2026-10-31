-- ============================================
-- 岩永淳志氏 Hub DB 登録 SQL
-- 和歌山県議会議員日高郡選挙区補欠選挙 2025年
-- ============================================

-- トランザクション開始
BEGIN;

-- ============================================
-- 1. 選挙区（districts）の登録
-- ============================================
-- 日高郡選挙区（都道府県議会議員選挙）
INSERT INTO districts (id, name, type, prefecture_codes, municipality_code, description, is_active)
VALUES (
    'a1111111-1111-1111-1111-111111111111',  -- 固定UUIDで後から参照可能に
    '日高郡選挙区',
    'PA',
    '30',  -- 和歌山県の都道府県コード
    NULL,  -- 都道府県議会選挙なので municipality_code は NULL
    '和歌山県議会議員選挙 日高郡選挙区',
    TRUE
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. 選挙（elections）の登録
-- ============================================
INSERT INTO elections (id, name, type, district_id, election_date, is_active)
VALUES (
    'b2222222-2222-2222-2222-222222222222',  -- 固定UUID
    '和歌山県議会議員日高郡選挙区補欠選挙',
    'PA',
    'a1111111-1111-1111-1111-111111111111',  -- 上で登録した選挙区ID
    '2025-06-01',
    TRUE
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. 政治家（politicians）の登録
-- ============================================
INSERT INTO politicians (id, name, name_kana, party, official_url)
VALUES (
    'c3333333-3333-3333-3333-333333333333',  -- 固定UUID
    '岩永淳志',
    'イワナガ アツシ',
    '無所属',
    'https://www.atsushi-iwanaga.jp/'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. 公開台帳（public_ledgers）の登録
-- ============================================
INSERT INTO public_ledgers (
    id,
    politician_id,
    organization_id,
    election_id,
    fiscal_year,
    total_income,
    total_expense,
    journal_count,
    ledger_source_id,
    is_test,
    last_updated_at,
    first_synced_at
)
VALUES (
    'd4444444-4444-4444-4444-444444444444',  -- 固定UUID
    'c3333333-3333-3333-3333-333333333333',  -- 政治家ID
    NULL,  -- 選挙運動用収支なので政治団体はNULL
    'b2222222-2222-2222-2222-222222222222',  -- 選挙ID
    2025,
    1255000,   -- 収入合計
    2219400,   -- 支出合計（切り上げ後）
    60,        -- 仕訳件数
    'e5555555-5555-5555-5555-555555555555',  -- Ledger側のソースID（ダミー）
    TRUE,      -- テストデータ
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    politician_id = EXCLUDED.politician_id,
    organization_id = EXCLUDED.organization_id,
    election_id = EXCLUDED.election_id,
    fiscal_year = EXCLUDED.fiscal_year,
    total_income = EXCLUDED.total_income,
    total_expense = EXCLUDED.total_expense,
    journal_count = EXCLUDED.journal_count,
    ledger_source_id = EXCLUDED.ledger_source_id,
    is_test = EXCLUDED.is_test,
    last_updated_at = EXCLUDED.last_updated_at;

-- ============================================
-- 5. 公開仕訳（public_journals）の登録
-- ============================================

-- 支出: 人件費
INSERT INTO public_journals (id, ledger_id, journal_source_id, date, description, amount, account_code, classification, non_monetary_basis, note, public_expense_amount, content_hash, is_test, synced_at)
VALUES
('e7098ad7-f6a2-4dfd-a60c-fa814d0bb47c', 'd4444444-4444-4444-4444-444444444444', 'e7098ad7-f6a2-4dfd-a60c-fa814d0bb47c', '2025-06-10', '車上運動員報酬', 30605, 'EXP_PERSONNEL_ELEC', 'campaign', NULL, '5/23~25
(11,100円/日 - その日の昼食・夕食代)*3', NULL, md5('e7098ad7-f6a2-4dfd-a60c-fa814d0bb47c-30605'), TRUE, NOW()),

('daac12d2-d36a-4401-bb85-d6503bfc035f', 'd4444444-4444-4444-4444-444444444444', 'daac12d2-d36a-4401-bb85-d6503bfc035f', '2025-06-10', '車上運動員報酬', 20497, 'EXP_PERSONNEL_ELEC', 'campaign', NULL, '5/26~27
(11,100円/日 - その日の昼食・夕食代)*2', NULL, md5('daac12d2-d36a-4401-bb85-d6503bfc035f-20497'), TRUE, NOW()),

('4e9d089f-fb19-4c8b-913f-daf8fa833388', 'd4444444-4444-4444-4444-444444444444', '4e9d089f-fb19-4c8b-913f-daf8fa833388', '2025-06-10', '車上運動員報酬', 20226, 'EXP_PERSONNEL_ELEC', 'campaign', NULL, '5/28~29
(11,100円/日 - その日の昼食・夕食代)*2', NULL, md5('4e9d089f-fb19-4c8b-913f-daf8fa833388-20226'), TRUE, NOW()),

('0db9ab7d-1b32-48f1-95d4-b6365701693c', 'd4444444-4444-4444-4444-444444444444', '0db9ab7d-1b32-48f1-95d4-b6365701693c', '2025-06-10', '車上運動員報酬', 20060, 'EXP_PERSONNEL_ELEC', 'campaign', NULL, '5/30~31
(11,100円/日 - その日の昼食・夕食代)*2', NULL, md5('0db9ab7d-1b32-48f1-95d4-b6365701693c-20060'), TRUE, NOW()),

-- 支出: 家屋費（選挙事務所）
('6afb0eed-d9c3-4833-a24c-6fbc71ae28df', 'd4444444-4444-4444-4444-444444444444', '6afb0eed-d9c3-4833-a24c-6fbc71ae28df', '2025-06-13', '選挙事務所借り上げ', 50000, 'EXP_BUILDING_ELEC_OFFICE', 'campaign', NULL, '5月7日〜6月7日', NULL, md5('6afb0eed-d9c3-4833-a24c-6fbc71ae28df-50000'), TRUE, NOW()),

-- 支出: 家屋費（演説会場）
('26d60410-bf75-4530-aec0-17befe37c47d', 'd4444444-4444-4444-4444-444444444444', '26d60410-bf75-4530-aec0-17befe37c47d', '2025-05-27', '演説会場使用料', 5500, 'EXP_BUILDING_ELEC_VENUE', 'campaign', NULL, NULL, NULL, md5('26d60410-bf75-4530-aec0-17befe37c47d-5500'), TRUE, NOW()),

-- 支出: 通信費
('f5174eef-d52e-4120-b614-87d492c268c8', 'd4444444-4444-4444-4444-444444444444', 'f5174eef-d52e-4120-b614-87d492c268c8', '2025-07-29', '電話回線使用料', 1190, 'EXP_COMMUNICATION_ELEC', 'campaign', NULL, '5月26日〜5月31日使用
6月10日分までの請求額から日数で按分', NULL, md5('f5174eef-d52e-4120-b614-87d492c268c8-1190'), TRUE, NOW()),

('faa62c6e-2588-4453-b30c-152320f387a9', 'd4444444-4444-4444-4444-444444444444', 'faa62c6e-2588-4453-b30c-152320f387a9', '2025-07-29', '電話回線使用料', 1093, 'EXP_COMMUNICATION_ELEC', 'campaign', NULL, '5月26日〜5月31日使用
6月10日分までの請求額から日数で按分', NULL, md5('faa62c6e-2588-4453-b30c-152320f387a9-1093'), TRUE, NOW()),

('eec13aeb-1e20-44dd-ab0a-66c01b8f4117', 'd4444444-4444-4444-4444-444444444444', 'eec13aeb-1e20-44dd-ab0a-66c01b8f4117', '2025-07-29', '電話回線使用料', 854, 'EXP_COMMUNICATION_ELEC', 'campaign', NULL, '5月26日〜5月31日使用
6月10日分までの請求額から日数で按分', NULL, md5('eec13aeb-1e20-44dd-ab0a-66c01b8f4117-854'), TRUE, NOW()),

-- 支出: 印刷費
('e5ed5c06-76c8-4f81-9798-fd17287820ca', 'd4444444-4444-4444-4444-444444444444', 'e5ed5c06-76c8-4f81-9798-fd17287820ca', NULL, 'ビラ印刷', 123680, 'EXP_PRINTING_ELEC', 'pre-campaign', NULL, '公費負担', 123680, md5('e5ed5c06-76c8-4f81-9798-fd17287820ca-123680'), TRUE, NOW()),

('b40d0be2-4b28-474c-a458-a253fc340e86', 'd4444444-4444-4444-4444-444444444444', 'b40d0be2-4b28-474c-a458-a253fc340e86', NULL, 'ポスター印刷', 1012176, 'EXP_PRINTING_ELEC', 'pre-campaign', NULL, '公費負担', 1012176, md5('b40d0be2-4b28-474c-a458-a253fc340e86-1012176'), TRUE, NOW()),

('a2b23a66-01a2-4f0f-bf94-9fa2f7b0af7c', 'd4444444-4444-4444-4444-444444444444', 'a2b23a66-01a2-4f0f-bf94-9fa2f7b0af7c', '2025-06-14', 'ビラ印刷', 8320, 'EXP_PRINTING_ELEC', 'pre-campaign', NULL, '自費負担', NULL, md5('a2b23a66-01a2-4f0f-bf94-9fa2f7b0af7c-8320'), TRUE, NOW()),

-- 支出: 広告費
('8e4c5c17-b3f7-44c0-ab40-bb117ae6660c', 'd4444444-4444-4444-4444-444444444444', '8e4c5c17-b3f7-44c0-ab40-bb117ae6660c', '2025-05-15', '選挙カー音響・看板・取付', 208800, 'EXP_ADVERTISING_ELEC', 'pre-campaign', NULL, NULL, NULL, md5('8e4c5c17-b3f7-44c0-ab40-bb117ae6660c-208800'), TRUE, NOW()),

('9b70da0c-4aa6-4cf4-9f26-752b929de6a5', 'd4444444-4444-4444-4444-444444444444', '9b70da0c-4aa6-4cf4-9f26-752b929de6a5', '2025-05-16', 'タスキ', 7480, 'EXP_ADVERTISING_ELEC', 'campaign', NULL, NULL, NULL, md5('9b70da0c-4aa6-4cf4-9f26-752b929de6a5-7480'), TRUE, NOW()),

('191f18d8-7796-4320-9fc5-1990645ee315', 'd4444444-4444-4444-4444-444444444444', '191f18d8-7796-4320-9fc5-1990645ee315', '2025-05-23', '選挙活動用事務所の看板制作・取付', 100000, 'EXP_ADVERTISING_ELEC', 'campaign', '看板1枚', '金銭以外
の寄附', NULL, md5('191f18d8-7796-4320-9fc5-1990645ee315-100000'), TRUE, NOW()),

('72e8550c-6b41-4aad-b232-e3d2cd4d1088', 'd4444444-4444-4444-4444-444444444444', '72e8550c-6b41-4aad-b232-e3d2cd4d1088', '2025-05-23', 'ビラの新聞折込', 32868, 'EXP_ADVERTISING_ELEC', 'campaign', NULL, NULL, NULL, md5('72e8550c-6b41-4aad-b232-e3d2cd4d1088-32868'), TRUE, NOW()),

('588927b4-65d4-4c1c-8958-99f569b8091a', 'd4444444-4444-4444-4444-444444444444', '588927b4-65d4-4c1c-8958-99f569b8091a', '2025-06-03', '選挙運動用広告', 44000, 'EXP_ADVERTISING_ELEC', 'campaign', NULL, NULL, NULL, md5('588927b4-65d4-4c1c-8958-99f569b8091a-44000'), TRUE, NOW()),

('f3fce6ea-e0c7-43d4-be14-48fd1f096197', 'd4444444-4444-4444-4444-444444444444', 'f3fce6ea-e0c7-43d4-be14-48fd1f096197', '2025-06-03', '選挙広告費', 44000, 'EXP_ADVERTISING_ELEC', 'campaign', NULL, NULL, NULL, md5('f3fce6ea-e0c7-43d4-be14-48fd1f096197-44000'), TRUE, NOW()),

('fba552fc-209e-4d49-b919-ae11b327812d', 'd4444444-4444-4444-4444-444444444444', 'fba552fc-209e-4d49-b919-ae11b327812d', '2025-06-03', 'ビラの新聞折込', 18502, 'EXP_ADVERTISING_ELEC', 'campaign', NULL, NULL, NULL, md5('fba552fc-209e-4d49-b919-ae11b327812d-18502'), TRUE, NOW()),

('96cd650a-a855-4a8b-a2f6-f8fe79a9a582', 'd4444444-4444-4444-4444-444444444444', '96cd650a-a855-4a8b-a2f6-f8fe79a9a582', '2025-06-03', 'ビラの新聞折込', 16429, 'EXP_ADVERTISING_ELEC', 'campaign', NULL, NULL, NULL, md5('96cd650a-a855-4a8b-a2f6-f8fe79a9a582-16429'), TRUE, NOW()),

('072a2b26-7d8e-49df-99cb-089b400c3bc3', 'd4444444-4444-4444-4444-444444444444', '072a2b26-7d8e-49df-99cb-089b400c3bc3', '2025-06-09', '選挙活動用事務所に掲示する立札、
のぼりのデザイン、制作
選挙活動用事務所の看板デザイン
推薦ハガキ：デザイン・印刷
新聞広告デザイン
選挙カー看板デザイン', 192368, 'EXP_ADVERTISING_ELEC', 'pre-campaign', NULL, NULL, NULL, md5('072a2b26-7d8e-49df-99cb-089b400c3bc3-192368'), TRUE, NOW()),

-- 支出: 文具費
('43eba6ba-f45e-4392-8d38-7243bac6b518', 'd4444444-4444-4444-4444-444444444444', '43eba6ba-f45e-4392-8d38-7243bac6b518', '2025-05-22', 'テープ等', 1052, 'EXP_STATIONERY_ELEC', 'campaign', NULL, NULL, NULL, md5('43eba6ba-f45e-4392-8d38-7243bac6b518-1052'), TRUE, NOW()),

('9318d0b6-c627-46c1-b332-22fbd3805f7f', 'd4444444-4444-4444-4444-444444444444', '9318d0b6-c627-46c1-b332-22fbd3805f7f', '2025-05-24', 'コピー用紙', 748, 'EXP_STATIONERY_ELEC', 'campaign', NULL, NULL, NULL, md5('9318d0b6-c627-46c1-b332-22fbd3805f7f-748'), TRUE, NOW()),

('e2161dee-2da1-4660-8e52-78d0c1d81ed1', 'd4444444-4444-4444-4444-444444444444', 'e2161dee-2da1-4660-8e52-78d0c1d81ed1', '2025-05-24', '紙袋', 1372, 'EXP_STATIONERY_ELEC', 'campaign', NULL, NULL, NULL, md5('e2161dee-2da1-4660-8e52-78d0c1d81ed1-1372'), TRUE, NOW()),

-- 支出: 食料費
('605541ca-888a-4489-a271-b1613fe1cf92', 'd4444444-4444-4444-4444-444444444444', '605541ca-888a-4489-a271-b1613fe1cf92', '2025-05-23', '弁当代（20個）', 18400, 'EXP_FOOD_ELEC', 'campaign', NULL, '23日昼食', NULL, md5('605541ca-888a-4489-a271-b1613fe1cf92-18400'), TRUE, NOW()),

('8a593817-eee6-4292-9825-d8013f66ba87', 'd4444444-4444-4444-4444-444444444444', '8a593817-eee6-4292-9825-d8013f66ba87', '2025-05-24', '弁当代（16個）', 12400, 'EXP_FOOD_ELEC', 'campaign', NULL, '24日昼食', NULL, md5('8a593817-eee6-4292-9825-d8013f66ba87-12400'), TRUE, NOW()),

('c84476fd-630d-4d98-a574-c9313ab68427', 'd4444444-4444-4444-4444-444444444444', 'c84476fd-630d-4d98-a574-c9313ab68427', '2025-05-24', 'お菓子', 2819, 'EXP_FOOD_ELEC', 'campaign', NULL, NULL, NULL, md5('c84476fd-630d-4d98-a574-c9313ab68427-2819'), TRUE, NOW()),

('87f9b91e-32e8-42dd-891e-ec23d21ae9de', 'd4444444-4444-4444-4444-444444444444', '87f9b91e-32e8-42dd-891e-ec23d21ae9de', '2025-05-24', 'お菓子', 643, 'EXP_FOOD_ELEC', 'campaign', NULL, NULL, NULL, md5('87f9b91e-32e8-42dd-891e-ec23d21ae9de-643'), TRUE, NOW()),

('8f564dcd-02d1-4561-9606-b7a2729d544e', 'd4444444-4444-4444-4444-444444444444', '8f564dcd-02d1-4561-9606-b7a2729d544e', '2025-05-25', '弁当代（20個）', 20000, 'EXP_FOOD_ELEC', 'campaign', NULL, '25日昼食', NULL, md5('8f564dcd-02d1-4561-9606-b7a2729d544e-20000'), TRUE, NOW()),

('2e3cd1fb-2079-4449-8eff-c45a5fe15c14', 'd4444444-4444-4444-4444-444444444444', '2e3cd1fb-2079-4449-8eff-c45a5fe15c14', '2025-05-26', '弁当代（20個）', 18000, 'EXP_FOOD_ELEC', 'campaign', NULL, '26日昼食', NULL, md5('2e3cd1fb-2079-4449-8eff-c45a5fe15c14-18000'), TRUE, NOW()),

('3e201a33-ec89-4538-93a5-618bf1724973', 'd4444444-4444-4444-4444-444444444444', '3e201a33-ec89-4538-93a5-618bf1724973', '2025-05-26', 'お菓子・おにぎり代（5個）', 5687, 'EXP_FOOD_ELEC', 'campaign', NULL, '26日夕食', NULL, md5('3e201a33-ec89-4538-93a5-618bf1724973-5687'), TRUE, NOW()),

('89e77119-8a58-4d41-93cb-5789b72fe243', 'd4444444-4444-4444-4444-444444444444', '89e77119-8a58-4d41-93cb-5789b72fe243', '2025-05-27', '弁当代（20個）', 13000, 'EXP_FOOD_ELEC', 'campaign', NULL, '27日昼食', NULL, md5('89e77119-8a58-4d41-93cb-5789b72fe243-13000'), TRUE, NOW()),

('a50a19ad-952e-4379-9108-28d59527ca8f', 'd4444444-4444-4444-4444-444444444444', 'a50a19ad-952e-4379-9108-28d59527ca8f', '2025-05-28', '弁当代（25個）', 22500, 'EXP_FOOD_ELEC', 'campaign', NULL, '28日昼食', NULL, md5('a50a19ad-952e-4379-9108-28d59527ca8f-22500'), TRUE, NOW()),

('b9f31318-3def-4df2-94bd-fd2fa1ea32ac', 'd4444444-4444-4444-4444-444444444444', 'b9f31318-3def-4df2-94bd-fd2fa1ea32ac', '2025-05-28', 'おにぎり代（5個）・お菓子', 2000, 'EXP_FOOD_ELEC', 'campaign', NULL, '28日夕食', NULL, md5('b9f31318-3def-4df2-94bd-fd2fa1ea32ac-2000'), TRUE, NOW()),

('afdfd7ec-edc0-4f87-a602-1e214ae4bb7c', 'd4444444-4444-4444-4444-444444444444', 'afdfd7ec-edc0-4f87-a602-1e214ae4bb7c', '2025-05-29', '弁当代（6個）', 4500, 'EXP_FOOD_ELEC', 'campaign', NULL, '29日昼食', NULL, md5('afdfd7ec-edc0-4f87-a602-1e214ae4bb7c-4500'), TRUE, NOW()),

('ac933d7b-170c-439d-8cff-84748d8d721b', 'd4444444-4444-4444-4444-444444444444', 'ac933d7b-170c-439d-8cff-84748d8d721b', '2025-05-29', '弁当代（20個）', 18000, 'EXP_FOOD_ELEC', 'campaign', NULL, '29日昼食', NULL, md5('ac933d7b-170c-439d-8cff-84748d8d721b-18000'), TRUE, NOW()),

('fb281cbd-75b9-4ebe-aa99-e61b80f0ae81', 'd4444444-4444-4444-4444-444444444444', 'fb281cbd-75b9-4ebe-aa99-e61b80f0ae81', '2025-05-29', 'おにぎり代（5個）・茶菓子', 1566, 'EXP_FOOD_ELEC', 'campaign', NULL, '29日夕食', NULL, md5('fb281cbd-75b9-4ebe-aa99-e61b80f0ae81-1566'), TRUE, NOW()),

('420cf7e5-8c25-4779-8ca8-b7d1f04d1b51', 'd4444444-4444-4444-4444-444444444444', '420cf7e5-8c25-4779-8ca8-b7d1f04d1b51', '2025-05-30', '弁当代（20個）', 19000, 'EXP_FOOD_ELEC', 'campaign', NULL, '30日昼食', NULL, md5('420cf7e5-8c25-4779-8ca8-b7d1f04d1b51-19000'), TRUE, NOW()),

('057af9cf-0298-4a7f-b512-8a247a3c878a', 'd4444444-4444-4444-4444-444444444444', '057af9cf-0298-4a7f-b512-8a247a3c878a', '2025-05-30', '弁当代（5個）・おにぎり代（5個）', 4800, 'EXP_FOOD_ELEC', 'campaign', NULL, '30日夕食', NULL, md5('057af9cf-0298-4a7f-b512-8a247a3c878a-4800'), TRUE, NOW()),

('4805ac17-8e4e-4fd4-86d9-970d4165a536', 'd4444444-4444-4444-4444-444444444444', '4805ac17-8e4e-4fd4-86d9-970d4165a536', '2025-05-31', '弁当代（25個）', 22750, 'EXP_FOOD_ELEC', 'campaign', NULL, '31日昼食', NULL, md5('4805ac17-8e4e-4fd4-86d9-970d4165a536-22750'), TRUE, NOW()),

('1063333d-b744-462c-a2ae-6dc8a3345ca5', 'd4444444-4444-4444-4444-444444444444', '1063333d-b744-462c-a2ae-6dc8a3345ca5', '2025-05-31', 'おにぎり代（5個）', 810, 'EXP_FOOD_ELEC', 'campaign', NULL, '31日夕食', NULL, md5('1063333d-b744-462c-a2ae-6dc8a3345ca5-810'), TRUE, NOW()),

-- 支出: 雑費
('250016c9-621a-433a-9ff5-9a52cbdaff5f', 'd4444444-4444-4444-4444-444444444444', '250016c9-621a-433a-9ff5-9a52cbdaff5f', '2025-05-23', '電池等', 1760, 'EXP_MISC_ELEC', 'campaign', NULL, NULL, NULL, md5('250016c9-621a-433a-9ff5-9a52cbdaff5f-1760'), TRUE, NOW()),

('35e4764d-99a9-4ac8-a1a4-0ea1d29a61c1', 'd4444444-4444-4444-4444-444444444444', '35e4764d-99a9-4ac8-a1a4-0ea1d29a61c1', '2025-05-23', 'ワッポン', 1386, 'EXP_MISC_ELEC', 'campaign', NULL, NULL, NULL, md5('35e4764d-99a9-4ac8-a1a4-0ea1d29a61c1-1386'), TRUE, NOW()),

('09ae408f-3672-4b0e-92cb-a0dd21d02a49', 'd4444444-4444-4444-4444-444444444444', '09ae408f-3672-4b0e-92cb-a0dd21d02a49', '2025-05-24', '傘', 850, 'EXP_MISC_ELEC', 'campaign', NULL, NULL, NULL, md5('09ae408f-3672-4b0e-92cb-a0dd21d02a49-850'), TRUE, NOW()),

('1f5c3f5a-2e34-48c8-9e11-951bde15caa7', 'd4444444-4444-4444-4444-444444444444', '1f5c3f5a-2e34-48c8-9e11-951bde15caa7', '2025-05-24', '電池', 569, 'EXP_MISC_ELEC', 'campaign', NULL, NULL, NULL, md5('1f5c3f5a-2e34-48c8-9e11-951bde15caa7-569'), TRUE, NOW()),

('addb8d8c-06b4-4919-b565-84f7b617654a', 'd4444444-4444-4444-4444-444444444444', 'addb8d8c-06b4-4919-b565-84f7b617654a', '2025-06-03', 'Tシャツ', 52140, 'EXP_MISC_ELEC', 'campaign', NULL, NULL, NULL, md5('addb8d8c-06b4-4919-b565-84f7b617654a-52140'), TRUE, NOW()),

('8ddb01e3-5b81-4ad0-9c82-47864ae1d021', 'd4444444-4444-4444-4444-444444444444', '8ddb01e3-5b81-4ad0-9c82-47864ae1d021', '2025-06-13', '選挙事務所
電気水道代', 14000, 'EXP_MISC_ELEC', 'campaign', NULL, '5月7日〜6月7日', NULL, md5('8ddb01e3-5b81-4ad0-9c82-47864ae1d021-14000'), TRUE, NOW()),

-- 収入: 自己資金
('5f6ae268-baec-46b0-87e0-8860a222f658', 'd4444444-4444-4444-4444-444444444444', '5f6ae268-baec-46b0-87e0-8860a222f658', '2025-05-13', '自己資金', 500000, 'REV_SELF_FINANCING', 'campaign', NULL, '自己資金', NULL, md5('5f6ae268-baec-46b0-87e0-8860a222f658-500000'), TRUE, NOW()),

-- 収入: 寄附
('b13b1d46-9ad8-450c-aed8-bcb0ecbceebc', 'd4444444-4444-4444-4444-444444444444', 'b13b1d46-9ad8-450c-aed8-bcb0ecbceebc', '2025-05-23', '寄附金', 400000, 'REV_DONATION_INDIVIDUAL_ELEC', 'campaign', NULL, '寄附金', NULL, md5('b13b1d46-9ad8-450c-aed8-bcb0ecbceebc-400000'), TRUE, NOW()),

('8acef356-e9f8-4439-b49e-a9cc96ffc858', 'd4444444-4444-4444-4444-444444444444', '8acef356-e9f8-4439-b49e-a9cc96ffc858', '2025-05-23', '金銭以外の寄附', 100000, 'REV_DONATION_INDIVIDUAL_ELEC', 'campaign', '選挙活動用事務所の看板
制作・取付', '金銭以外の寄附', NULL, md5('8acef356-e9f8-4439-b49e-a9cc96ffc858-100000'), TRUE, NOW()),

('7c14d3a0-0f57-4a5d-b770-aba3e9c19cf5', 'd4444444-4444-4444-4444-444444444444', '7c14d3a0-0f57-4a5d-b770-aba3e9c19cf5', '2025-05-23', '寄附金', 30000, 'REV_DONATION_INDIVIDUAL_ELEC', 'campaign', NULL, '寄附金', NULL, md5('7c14d3a0-0f57-4a5d-b770-aba3e9c19cf5-30000'), TRUE, NOW()),

('4384a83b-6662-4228-8fcc-d3c87fc10670', 'd4444444-4444-4444-4444-444444444444', '4384a83b-6662-4228-8fcc-d3c87fc10670', '2025-05-23', '寄附金', 10000, 'REV_DONATION_INDIVIDUAL_ELEC', 'campaign', NULL, '寄附金', NULL, md5('4384a83b-6662-4228-8fcc-d3c87fc10670-10000'), TRUE, NOW()),

('6e095d15-00cb-4728-ae28-68a520038bf1', 'd4444444-4444-4444-4444-444444444444', '6e095d15-00cb-4728-ae28-68a520038bf1', '2025-05-23', '寄附金', 10000, 'REV_DONATION_INDIVIDUAL_ELEC', 'campaign', NULL, '寄附金', NULL, md5('6e095d15-00cb-4728-ae28-68a520038bf1-10000'), TRUE, NOW()),

('268b5066-8ce6-4381-9c5d-0e8aa700ee4c', 'd4444444-4444-4444-4444-444444444444', '268b5066-8ce6-4381-9c5d-0e8aa700ee4c', '2025-05-23', '寄附金', 5000, 'REV_DONATION_INDIVIDUAL_ELEC', 'campaign', NULL, '寄附金', NULL, md5('268b5066-8ce6-4381-9c5d-0e8aa700ee4c-5000'), TRUE, NOW()),

('b8d7d762-81e9-48c0-8329-92a587dd4b90', 'd4444444-4444-4444-4444-444444444444', 'b8d7d762-81e9-48c0-8329-92a587dd4b90', '2025-05-24', '寄附金', 10000, 'REV_DONATION_INDIVIDUAL_ELEC', 'campaign', NULL, '寄附金', NULL, md5('b8d7d762-81e9-48c0-8329-92a587dd4b90-10000'), TRUE, NOW()),

('1cf692b4-51ff-4a4d-9929-feb0d30b49e7', 'd4444444-4444-4444-4444-444444444444', '1cf692b4-51ff-4a4d-9929-feb0d30b49e7', '2025-05-25', '寄附金', 10000, 'REV_DONATION_INDIVIDUAL_ELEC', 'campaign', NULL, '寄附金', NULL, md5('1cf692b4-51ff-4a4d-9929-feb0d30b49e7-10000'), TRUE, NOW()),

('19e9d30e-5a38-42d5-9251-e88d82e15594', 'd4444444-4444-4444-4444-444444444444', '19e9d30e-5a38-42d5-9251-e88d82e15594', '2025-05-25', '寄附金', 50000, 'REV_DONATION_INDIVIDUAL_ELEC', 'campaign', NULL, '寄附金', NULL, md5('19e9d30e-5a38-42d5-9251-e88d82e15594-50000'), TRUE, NOW()),

('745d21ab-7319-4cc4-8a62-09eb14bb6c18', 'd4444444-4444-4444-4444-444444444444', '745d21ab-7319-4cc4-8a62-09eb14bb6c18', '2025-05-27', '寄附金', 20000, 'REV_DONATION_INDIVIDUAL_ELEC', 'campaign', NULL, '寄附金', NULL, md5('745d21ab-7319-4cc4-8a62-09eb14bb6c18-20000'), TRUE, NOW()),

('75960998-c8f5-455c-b95a-921ba03c44d4', 'd4444444-4444-4444-4444-444444444444', '75960998-c8f5-455c-b95a-921ba03c44d4', '2025-05-27', '寄附金', 100000, 'REV_DONATION_INDIVIDUAL_ELEC', 'campaign', NULL, '寄附金', NULL, md5('75960998-c8f5-455c-b95a-921ba03c44d4-100000'), TRUE, NOW()),

('6da15982-1edc-4d8b-a2b3-2a83bbe70bea', 'd4444444-4444-4444-4444-444444444444', '6da15982-1edc-4d8b-a2b3-2a83bbe70bea', '2025-05-30', '寄附金', 10000, 'REV_DONATION_INDIVIDUAL_ELEC', 'campaign', NULL, '寄附金', NULL, md5('6da15982-1edc-4d8b-a2b3-2a83bbe70bea-10000'), TRUE, NOW())
ON CONFLICT (id) DO UPDATE SET
    ledger_id = EXCLUDED.ledger_id,
    journal_source_id = EXCLUDED.journal_source_id,
    date = EXCLUDED.date,
    description = EXCLUDED.description,
    amount = EXCLUDED.amount,
    account_code = EXCLUDED.account_code,
    classification = EXCLUDED.classification,
    non_monetary_basis = EXCLUDED.non_monetary_basis,
    note = EXCLUDED.note,
    public_expense_amount = EXCLUDED.public_expense_amount,
    content_hash = EXCLUDED.content_hash,
    is_test = EXCLUDED.is_test,
    synced_at = EXCLUDED.synced_at;

-- ============================================
-- 6. master_metadata の更新
-- ============================================
UPDATE master_metadata 
SET last_updated_at = NOW() 
WHERE table_name IN ('politicians', 'elections', 'districts');

-- トランザクション終了
COMMIT;

-- ============================================
-- 確認用クエリ
-- ============================================
-- 登録した政治家を確認
-- SELECT * FROM politicians WHERE id = 'c3333333-3333-3333-3333-333333333333';

-- 登録した台帳を確認
-- SELECT * FROM public_ledgers WHERE id = 'd4444444-4444-4444-4444-444444444444';

-- 登録した仕訳を確認
-- SELECT * FROM public_journals WHERE ledger_id = 'd4444444-4444-4444-4444-444444444444' ORDER BY date;

-- 収支サマリー
-- SELECT 
--   CASE WHEN account_code LIKE 'REV_%' THEN '収入' ELSE '支出' END as type,
--   SUM(amount) as total
-- FROM public_journals 
-- WHERE ledger_id = 'd4444444-4444-4444-4444-444444444444'
-- GROUP BY CASE WHEN account_code LIKE 'REV_%' THEN '収入' ELSE '支出' END;

