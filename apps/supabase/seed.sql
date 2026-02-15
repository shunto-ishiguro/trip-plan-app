-- Seed data for Trip Plan App
-- Idempotent: deletes existing data first (cascade handles child tables)

DELETE FROM trip_members;
DELETE FROM trips;

-- Test users (Supabase Auth)
-- Password for both: "password123"
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', jsonb_build_object('sub', '00000000-0000-0000-0000-000000000001', 'email', 'alice@example.com'), 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', jsonb_build_object('sub', '00000000-0000-0000-0000-000000000002', 'email', 'bob@example.com'), 'email', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Trips (with owner_id)
INSERT INTO trips (id, title, destination, start_date, end_date, member_count, memo, owner_id)
VALUES
  ('11111111-1111-1111-1111-111111111111', '京都旅行', '京都', '2025-04-01', '2025-04-03', 2, '桜の季節に京都を巡る旅', '00000000-0000-0000-0000-000000000001'),
  ('22222222-2222-2222-2222-222222222222', '沖縄バカンス', '沖縄', '2025-07-20', '2025-07-23', 4, '夏の沖縄でビーチリゾート', '00000000-0000-0000-0000-000000000001'),
  ('33333333-3333-3333-3333-333333333333', '北海道グルメ旅', '北海道', '2025-09-10', '2025-09-13', 3, NULL, '00000000-0000-0000-0000-000000000002');

-- Trip Members
INSERT INTO trip_members (trip_id, user_id, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'editor'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000002', 'owner');

-- Spots (Kyoto trip)
INSERT INTO spots (id, trip_id, day_index, "order", name, address, start_time, end_time, memo, latitude, longitude)
VALUES
  ('aaaa0001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 0, 0, '伏見稲荷大社', '京都市伏見区深草藪之内町68', '09:00', '11:00', '千本鳥居を散策', 34.9671, 135.7727),
  ('aaaa0001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 0, 1, '清水寺', '京都市東山区清水1丁目294', '13:00', '15:00', NULL, 34.9949, 135.7850),
  ('aaaa0001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 1, 0, '金閣寺', '京都市北区金閣寺町1', '10:00', '12:00', NULL, 35.0394, 135.7292),
  ('aaaa0001-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111', 1, 1, '嵐山竹林', '京都市右京区嵯峨天龍寺芒ノ馬場町', '14:00', '16:00', '竹林の小径を歩く', 35.0170, 135.6713);

-- Budget Items (Kyoto trip)
INSERT INTO budget_items (id, trip_id, category, name, amount, pricing_type, memo)
VALUES
  ('bbbb0001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'transport', '新幹線（往復）', 27000, 'per_person', '東京↔京都 のぞみ'),
  ('bbbb0001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'accommodation', '京都ホテル（2泊）', 30000, 'total', NULL),
  ('bbbb0001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'food', '食費（概算）', 5000, 'per_person', NULL);

-- Checklist Items (Kyoto trip)
INSERT INTO checklist_items (id, trip_id, type, text, checked)
VALUES
  ('cccc0001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'packing', 'パスポート', true),
  ('cccc0001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'packing', '充電器', false),
  ('cccc0001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'todo', 'ホテルにチェックイン時間を確認', false),
  ('cccc0001-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111', 'todo', 'レンタカーの予約', true);

-- Reservations (Kyoto trip)
INSERT INTO reservations (id, trip_id, type, name, confirmation_number, datetime, link, memo)
VALUES
  ('dddd0001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'hotel', '京都グランドホテル', 'KGH-2025-1234', '2025-04-01T15:00:00', 'https://example.com/reservation/1234', 'チェックイン15:00'),
  ('dddd0001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'restaurant', '祇園料亭 花月', NULL, '2025-04-01T18:30:00', NULL, '予約名: 山田');

-- Share Settings (Kyoto trip - with token)
INSERT INTO share_settings (id, trip_id, share_url, permission, share_token, is_active, created_by)
VALUES
  ('eeee0001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', '/share/preview/test-kyoto-token-2025', 'edit', 'test-kyoto-token-2025', true, '00000000-0000-0000-0000-000000000001');
