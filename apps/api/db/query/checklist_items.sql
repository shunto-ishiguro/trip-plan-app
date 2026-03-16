-- name: ListChecklistItems :many
SELECT * FROM checklist_items WHERE trip_id = $1;

-- name: ListChecklistItemsByType :many
SELECT * FROM checklist_items WHERE trip_id = $1 AND type = $2;

-- name: CreateChecklistItem :one
INSERT INTO checklist_items (trip_id, type, text)
VALUES ($1, $2, $3)
RETURNING *;

-- name: ToggleChecklistItem :one
UPDATE checklist_items SET checked = NOT checked
WHERE id = $1 AND trip_id = $2
RETURNING *;

-- name: UpdateChecklistItem :one
UPDATE checklist_items SET
    text = COALESCE(sqlc.narg('text'), text),
    type = COALESCE(sqlc.narg('type'), type)
WHERE id = $1 AND trip_id = $2
RETURNING *;

-- name: DeleteChecklistItem :exec
DELETE FROM checklist_items WHERE id = $1 AND trip_id = $2;
