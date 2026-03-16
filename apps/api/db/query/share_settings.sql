-- name: GetShareSettings :one
SELECT * FROM share_settings WHERE trip_id = $1;

-- name: CreateShareSettings :one
INSERT INTO share_settings (trip_id, permission, share_token, created_by)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdateShareSettings :one
UPDATE share_settings SET
    permission = COALESCE(sqlc.narg('permission'), permission),
    is_active = COALESCE(sqlc.narg('is_active'), is_active)
WHERE trip_id = $1
RETURNING *;

-- name: DeleteShareSettings :exec
DELETE FROM share_settings WHERE trip_id = $1;

-- name: GetShareByToken :one
SELECT ss.*, t.title, t.destination, t.start_date, t.end_date
FROM share_settings ss
JOIN trips t ON ss.trip_id = t.id
WHERE ss.share_token = $1 AND ss.is_active = true;

-- name: GetShareSettingsByToken :one
SELECT * FROM share_settings WHERE share_token = $1 AND is_active = true;
