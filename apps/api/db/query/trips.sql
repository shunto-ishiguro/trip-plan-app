-- name: ListTripsByUser :many
SELECT t.*
FROM trips t
JOIN trip_members tm ON t.id = tm.trip_id
WHERE tm.user_id = $1
ORDER BY t.start_date ASC;

-- name: GetTrip :one
SELECT * FROM trips WHERE id = $1;

-- name: CreateTrip :one
INSERT INTO trips (title, destination, start_date, end_date, member_count, memo, owner_id)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: UpdateTrip :one
UPDATE trips SET
    title = COALESCE(sqlc.narg('title'), title),
    destination = COALESCE(sqlc.narg('destination'), destination),
    start_date = COALESCE(sqlc.narg('start_date'), start_date),
    end_date = COALESCE(sqlc.narg('end_date'), end_date),
    member_count = COALESCE(sqlc.narg('member_count'), member_count),
    memo = COALESCE(sqlc.narg('memo'), memo),
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeleteTrip :exec
DELETE FROM trips WHERE id = $1;
