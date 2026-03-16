-- name: ListReservations :many
SELECT * FROM reservations
WHERE trip_id = $1
ORDER BY datetime ASC NULLS LAST;

-- name: CreateReservation :one
INSERT INTO reservations (trip_id, type, name, confirmation_number, datetime, link, memo)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: UpdateReservation :one
UPDATE reservations SET
    type = COALESCE(sqlc.narg('type'), type),
    name = COALESCE(sqlc.narg('name'), name),
    confirmation_number = COALESCE(sqlc.narg('confirmation_number'), confirmation_number),
    datetime = COALESCE(sqlc.narg('datetime'), datetime),
    link = COALESCE(sqlc.narg('link'), link),
    memo = COALESCE(sqlc.narg('memo'), memo)
WHERE id = $1 AND trip_id = $2
RETURNING *;

-- name: DeleteReservation :exec
DELETE FROM reservations WHERE id = $1 AND trip_id = $2;
