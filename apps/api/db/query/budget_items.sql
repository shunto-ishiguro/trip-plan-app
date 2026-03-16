-- name: ListBudgetItems :many
SELECT * FROM budget_items WHERE trip_id = $1;

-- name: CreateBudgetItem :one
INSERT INTO budget_items (trip_id, category, name, amount, pricing_type, memo)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: UpdateBudgetItem :one
UPDATE budget_items SET
    category = COALESCE(sqlc.narg('category'), category),
    name = COALESCE(sqlc.narg('name'), name),
    amount = COALESCE(sqlc.narg('amount'), amount),
    pricing_type = COALESCE(sqlc.narg('pricing_type'), pricing_type),
    memo = COALESCE(sqlc.narg('memo'), memo)
WHERE id = $1 AND trip_id = $2
RETURNING *;

-- name: DeleteBudgetItem :exec
DELETE FROM budget_items WHERE id = $1 AND trip_id = $2;
