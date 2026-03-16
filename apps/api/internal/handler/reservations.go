package handler

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"

	db "github.com/shunto-ishiguro/trip-plan-app/apps/api/db/generated"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/ws"
)

type reservationResponse struct {
	ID                 string  `json:"id"`
	TripID             string  `json:"tripId"`
	Type               string  `json:"type"`
	Name               string  `json:"name"`
	ConfirmationNumber *string `json:"confirmationNumber"`
	Datetime           *string `json:"datetime"`
	Link               *string `json:"link"`
	Memo               *string `json:"memo"`
}

func toReservationResponse(r db.Reservation) reservationResponse {
	return reservationResponse{
		ID:                 r.ID,
		TripID:             r.TripID,
		Type:               string(r.Type),
		Name:               r.Name,
		ConfirmationNumber: r.ConfirmationNumber,
		Datetime:           r.Datetime,
		Link:               r.Link,
		Memo:               r.Memo,
	}
}

type ReservationsHandler struct {
	queries *db.Queries
	hub     *ws.Hub
}

func NewReservationsHandler(queries *db.Queries, hub *ws.Hub) *ReservationsHandler {
	return &ReservationsHandler{queries: queries, hub: hub}
}

func (h *ReservationsHandler) List(c echo.Context) error {
	tripID := c.Param("tripId")

	items, err := h.queries.ListReservations(context.Background(), tripID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to list reservations")
	}

	resp := make([]reservationResponse, 0, len(items))
	for _, item := range items {
		resp = append(resp, toReservationResponse(item))
	}

	return c.JSON(http.StatusOK, resp)
}

func (h *ReservationsHandler) Create(c echo.Context) error {
	tripID := c.Param("tripId")

	var body struct {
		Type               string  `json:"type"`
		Name               string  `json:"name"`
		ConfirmationNumber *string `json:"confirmationNumber"`
		Datetime           *string `json:"datetime"`
		Link               *string `json:"link"`
		Memo               *string `json:"memo"`
	}
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if body.Name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "name is required")
	}
	if body.Type == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "type is required")
	}

	item, err := h.queries.CreateReservation(context.Background(), db.CreateReservationParams{
		TripID:             tripID,
		Type:               db.ReservationType(body.Type),
		Name:               body.Name,
		ConfirmationNumber: body.ConfirmationNumber,
		Datetime:           body.Datetime,
		Link:               body.Link,
		Memo:               body.Memo,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create reservation")
	}

	resp := toReservationResponse(item)

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "INSERT",
		Table:  "reservations",
		Record: resp,
	})

	return c.JSON(http.StatusCreated, resp)
}

func (h *ReservationsHandler) Update(c echo.Context) error {
	tripID := c.Param("tripId")
	id := c.Param("id")

	var body struct {
		Type               *string `json:"type"`
		Name               *string `json:"name"`
		ConfirmationNumber *string `json:"confirmationNumber"`
		Datetime           *string `json:"datetime"`
		Link               *string `json:"link"`
		Memo               *string `json:"memo"`
	}
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	params := db.UpdateReservationParams{
		ID:                 id,
		TripID:             tripID,
		Name:               body.Name,
		ConfirmationNumber: body.ConfirmationNumber,
		Datetime:           body.Datetime,
		Link:               body.Link,
		Memo:               body.Memo,
	}
	if body.Type != nil {
		params.Type = db.NullReservationType{ReservationType: db.ReservationType(*body.Type), Valid: true}
	}

	item, err := h.queries.UpdateReservation(context.Background(), params)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "reservation not found")
	}

	resp := toReservationResponse(item)

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "UPDATE",
		Table:  "reservations",
		Record: resp,
	})

	return c.JSON(http.StatusOK, resp)
}

func (h *ReservationsHandler) Delete(c echo.Context) error {
	tripID := c.Param("tripId")
	id := c.Param("id")

	err := h.queries.DeleteReservation(context.Background(), db.DeleteReservationParams{
		ID:     id,
		TripID: tripID,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete reservation")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "DELETE",
		Table:  "reservations",
		Record: map[string]string{"id": id, "tripId": tripID},
	})

	return c.NoContent(http.StatusNoContent)
}
