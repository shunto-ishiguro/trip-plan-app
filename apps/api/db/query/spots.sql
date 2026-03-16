-- name: ListSpots :many
SELECT * FROM spots
WHERE trip_id = $1
ORDER BY day_index, "order";

-- name: ListSpotsByDay :many
SELECT * FROM spots
WHERE trip_id = $1 AND day_index = $2
ORDER BY "order";

-- name: GetSpot :one
SELECT * FROM spots WHERE id = $1 AND trip_id = $2;

-- name: CreateSpot :one
INSERT INTO spots (trip_id, day_index, "order", name, address, start_time, end_time, memo, latitude, longitude)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING *;

-- name: UpdateSpot :one
UPDATE spots SET
    day_index = COALESCE(sqlc.narg('day_index'), day_index),
    "order" = COALESCE(sqlc.narg('order'), "order"),
    name = COALESCE(sqlc.narg('name'), name),
    address = COALESCE(sqlc.narg('address'), address),
    start_time = COALESCE(sqlc.narg('start_time'), start_time),
    end_time = COALESCE(sqlc.narg('end_time'), end_time),
    memo = COALESCE(sqlc.narg('memo'), memo),
    latitude = COALESCE(sqlc.narg('latitude'), latitude),
    longitude = COALESCE(sqlc.narg('longitude'), longitude)
WHERE id = $1 AND trip_id = $2
RETURNING *;

-- name: DeleteSpot :exec
DELETE FROM spots WHERE id = $1 AND trip_id = $2;
