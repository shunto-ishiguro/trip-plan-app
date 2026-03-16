package handler

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"

	db "github.com/shunto-ishiguro/trip-plan-app/apps/api/db/generated"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/ws"
)

type ChecklistItemsHandler struct {
	queries *db.Queries
	hub     *ws.Hub
}

func NewChecklistItemsHandler(queries *db.Queries, hub *ws.Hub) *ChecklistItemsHandler {
	return &ChecklistItemsHandler{queries: queries, hub: hub}
}

func (h *ChecklistItemsHandler) List(c echo.Context) error {
	tripID := c.Param("tripId")
	typeFilter := c.QueryParam("type")

	var items []db.ChecklistItem
	var err error

	if typeFilter != "" {
		items, err = h.queries.ListChecklistItemsByType(context.Background(), db.ListChecklistItemsByTypeParams{
			TripID: tripID,
			Type:   db.ChecklistType(typeFilter),
		})
	} else {
		items, err = h.queries.ListChecklistItems(context.Background(), tripID)
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to list checklist items")
	}

	if items == nil {
		items = []db.ChecklistItem{}
	}

	return c.JSON(http.StatusOK, items)
}

func (h *ChecklistItemsHandler) Create(c echo.Context) error {
	tripID := c.Param("tripId")

	var body struct {
		Text string `json:"text"`
		Type string `json:"type"`
	}
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if body.Text == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "text is required")
	}
	if body.Type == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "type is required")
	}

	item, err := h.queries.CreateChecklistItem(context.Background(), db.CreateChecklistItemParams{
		TripID: tripID,
		Type:   db.ChecklistType(body.Type),
		Text:   body.Text,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create checklist item")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "INSERT",
		Table:  "checklist_items",
		Record: item,
	})

	return c.JSON(http.StatusCreated, item)
}

func (h *ChecklistItemsHandler) BatchCreate(c echo.Context) error {
	tripID := c.Param("tripId")

	var body struct {
		Items []struct {
			Text string `json:"text"`
			Type string `json:"type"`
		} `json:"items"`
	}
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if len(body.Items) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "items is required")
	}

	created := make([]db.ChecklistItem, 0, len(body.Items))
	for _, entry := range body.Items {
		if entry.Text == "" || entry.Type == "" {
			continue
		}

		item, err := h.queries.CreateChecklistItem(context.Background(), db.CreateChecklistItemParams{
			TripID: tripID,
			Type:   db.ChecklistType(entry.Type),
			Text:   entry.Text,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to create checklist item")
		}

		h.hub.Broadcast(tripID, ws.BroadcastEvent{
			Type:   "INSERT",
			Table:  "checklist_items",
			Record: item,
		})

		created = append(created, item)
	}

	return c.JSON(http.StatusCreated, created)
}

func (h *ChecklistItemsHandler) Toggle(c echo.Context) error {
	tripID := c.Param("tripId")
	id := c.Param("id")

	item, err := h.queries.ToggleChecklistItem(context.Background(), db.ToggleChecklistItemParams{
		ID:     id,
		TripID: tripID,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "checklist item not found")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "UPDATE",
		Table:  "checklist_items",
		Record: item,
	})

	return c.JSON(http.StatusOK, item)
}

func (h *ChecklistItemsHandler) Update(c echo.Context) error {
	tripID := c.Param("tripId")
	id := c.Param("id")

	var body struct {
		Text *string `json:"text"`
		Type *string `json:"type"`
	}
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	params := db.UpdateChecklistItemParams{
		ID:     id,
		TripID: tripID,
		Text:   body.Text,
	}
	if body.Type != nil {
		params.Type = db.NullChecklistType{ChecklistType: db.ChecklistType(*body.Type), Valid: true}
	}

	item, err := h.queries.UpdateChecklistItem(context.Background(), params)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "checklist item not found")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "UPDATE",
		Table:  "checklist_items",
		Record: item,
	})

	return c.JSON(http.StatusOK, item)
}

func (h *ChecklistItemsHandler) Delete(c echo.Context) error {
	tripID := c.Param("tripId")
	id := c.Param("id")

	err := h.queries.DeleteChecklistItem(context.Background(), db.DeleteChecklistItemParams{
		ID:     id,
		TripID: tripID,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete checklist item")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "DELETE",
		Table:  "checklist_items",
		Record: map[string]string{"id": id, "tripId": tripID},
	})

	return c.NoContent(http.StatusNoContent)
}
