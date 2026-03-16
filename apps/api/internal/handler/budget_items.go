package handler

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"

	db "github.com/shunto-ishiguro/trip-plan-app/apps/api/db/generated"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/ws"
)

type budgetItemResponse struct {
	ID          string  `json:"id"`
	TripID      string  `json:"tripId"`
	Category    string  `json:"category"`
	Name        string  `json:"name"`
	Amount      float64 `json:"amount"`
	PricingType string  `json:"pricingType"`
	Memo        *string `json:"memo"`
}

func toBudgetItemResponse(b db.BudgetItem) budgetItemResponse {
	return budgetItemResponse{
		ID:          b.ID,
		TripID:      b.TripID,
		Category:    string(b.Category),
		Name:        b.Name,
		Amount:      float64(b.Amount),
		PricingType: string(b.PricingType),
		Memo:        b.Memo,
	}
}

type BudgetItemsHandler struct {
	queries *db.Queries
	hub     *ws.Hub
}

func NewBudgetItemsHandler(queries *db.Queries, hub *ws.Hub) *BudgetItemsHandler {
	return &BudgetItemsHandler{queries: queries, hub: hub}
}

func (h *BudgetItemsHandler) List(c echo.Context) error {
	tripID := c.Param("tripId")

	items, err := h.queries.ListBudgetItems(context.Background(), tripID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to list budget items")
	}

	resp := make([]budgetItemResponse, 0, len(items))
	for _, item := range items {
		resp = append(resp, toBudgetItemResponse(item))
	}

	return c.JSON(http.StatusOK, resp)
}

func (h *BudgetItemsHandler) Create(c echo.Context) error {
	tripID := c.Param("tripId")

	var body struct {
		Category    string  `json:"category"`
		Name        string  `json:"name"`
		Amount      float64 `json:"amount"`
		PricingType string  `json:"pricingType"`
		Memo        *string `json:"memo"`
	}
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if body.Name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "name is required")
	}
	if body.Category == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "category is required")
	}
	if body.Amount == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "amount is required")
	}

	if body.PricingType == "" {
		body.PricingType = "total"
	}

	item, err := h.queries.CreateBudgetItem(context.Background(), db.CreateBudgetItemParams{
		TripID:      tripID,
		Category:    db.BudgetCategory(body.Category),
		Name:        body.Name,
		Amount:      int32(body.Amount),
		PricingType: db.PricingType(body.PricingType),
		Memo:        body.Memo,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create budget item")
	}

	resp := toBudgetItemResponse(item)

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "INSERT",
		Table:  "budget_items",
		Record: resp,
	})

	return c.JSON(http.StatusCreated, resp)
}

func (h *BudgetItemsHandler) Update(c echo.Context) error {
	tripID := c.Param("tripId")
	id := c.Param("id")

	var body struct {
		Category    *string  `json:"category"`
		Name        *string  `json:"name"`
		Amount      *float64 `json:"amount"`
		PricingType *string  `json:"pricingType"`
		Memo        *string  `json:"memo"`
	}
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	params := db.UpdateBudgetItemParams{
		ID:     id,
		TripID: tripID,
		Name:   body.Name,
		Memo:   body.Memo,
	}

	if body.Category != nil {
		params.Category = db.NullBudgetCategory{BudgetCategory: db.BudgetCategory(*body.Category), Valid: true}
	}
	if body.PricingType != nil {
		params.PricingType = db.NullPricingType{PricingType: db.PricingType(*body.PricingType), Valid: true}
	}
	if body.Amount != nil {
		v := int32(*body.Amount)
		params.Amount = &v
	}

	item, err := h.queries.UpdateBudgetItem(context.Background(), params)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "budget item not found")
	}

	resp := toBudgetItemResponse(item)

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "UPDATE",
		Table:  "budget_items",
		Record: resp,
	})

	return c.JSON(http.StatusOK, resp)
}

func (h *BudgetItemsHandler) Delete(c echo.Context) error {
	tripID := c.Param("tripId")
	id := c.Param("id")

	err := h.queries.DeleteBudgetItem(context.Background(), db.DeleteBudgetItemParams{
		ID:     id,
		TripID: tripID,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete budget item")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "DELETE",
		Table:  "budget_items",
		Record: map[string]string{"id": id, "tripId": tripID},
	})

	return c.NoContent(http.StatusNoContent)
}
