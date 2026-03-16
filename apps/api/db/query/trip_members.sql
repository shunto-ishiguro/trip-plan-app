-- name: ListTripMembers :many
SELECT * FROM trip_members WHERE trip_id = $1 ORDER BY joined_at;

-- name: GetTripMember :one
SELECT * FROM trip_members WHERE trip_id = $1 AND user_id = $2;

-- name: CreateTripMember :one
INSERT INTO trip_members (trip_id, user_id, role)
VALUES ($1, $2, $3)
RETURNING *;

-- name: UpsertTripMember :exec
INSERT INTO trip_members (trip_id, user_id, role)
VALUES ($1, $2, $3)
ON CONFLICT (trip_id, user_id) DO NOTHING;

-- name: UpdateTripMemberRole :one
UPDATE trip_members SET role = $3
WHERE trip_id = $1 AND user_id = $2
RETURNING *;

-- name: DeleteTripMember :exec
DELETE FROM trip_members WHERE trip_id = $1 AND user_id = $2;
