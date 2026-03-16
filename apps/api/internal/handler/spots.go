package handler

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"

	db "github.com/shunto-ishiguro/trip-plan-app/apps/api/db/generated"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/middleware"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/ws"
)

type SpotsHandler struct {
	queries *db.Queries
	hub     *ws.Hub
}

func NewSpotsHandler(queries *db.Queries, hub *ws.Hub) *SpotsHandler {
	return &SpotsHandler{queries: queries, hub: hub}
}

type createSpotRequest struct {
	DayIndex  int32    `json:"dayIndex"`
	Order     int32    `json:"order"`
	Name      string   `json:"name"`
	Address   *string  `json:"address"`
	StartTime *string  `json:"startTime"`
	EndTime   *string  `json:"endTime"`
	Memo      *string  `json:"memo"`
	Latitude  *float64 `json:"latitude"`
	Longitude *float64 `json:"longitude"`
}

type updateSpotRequest struct {
	DayIndex  *int32   `json:"dayIndex"`
	Order     *int32   `json:"order"`
	Name      *string  `json:"name"`
	Address   *string  `json:"address"`
	StartTime *string  `json:"startTime"`
	EndTime   *string  `json:"endTime"`
	Memo      *string  `json:"memo"`
	Latitude  *float64 `json:"latitude"`
	Longitude *float64 `json:"longitude"`
}

// ListSpots handles GET /trips/:tripId/spots?dayIndex=N
func (h *SpotsHandler) ListSpots(c echo.Context) error {
	tripID := c.Param("tripId")
	ctx := c.Request().Context()

	var spots []db.Spot
	var err error

	if dayIndexStr := c.QueryParam("dayIndex"); dayIndexStr != "" {
		dayIndex, parseErr := strconv.ParseInt(dayIndexStr, 10, 32)
		if parseErr != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid dayIndex")
		}
		spots, err = h.queries.ListSpotsByDay(ctx, db.ListSpotsByDayParams{
			TripID:   tripID,
			DayIndex: int32(dayIndex),
		})
	} else {
		spots, err = h.queries.ListSpots(ctx, tripID)
	}

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to query spots")
	}
	if spots == nil {
		spots = []db.Spot{}
	}

	return c.JSON(http.StatusOK, spots)
}

// CreateSpot handles POST /trips/:tripId/spots
func (h *SpotsHandler) CreateSpot(c echo.Context) error {
	tripID := c.Param("tripId")
	_ = middleware.GetUser(c)

	var req createSpotRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if strings.TrimSpace(req.Name) == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "name is required")
	}

	ctx := c.Request().Context()

	spot, err := h.queries.CreateSpot(ctx, db.CreateSpotParams{
		TripID:    tripID,
		DayIndex:  req.DayIndex,
		Order:     req.Order,
		Name:      req.Name,
		Address:   req.Address,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		Memo:      req.Memo,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create spot")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "INSERT",
		Table:  "spots",
		Record: spot,
	})

	return c.JSON(http.StatusCreated, spot)
}

// GetSpot handles GET /trips/:tripId/spots/:id
func (h *SpotsHandler) GetSpot(c echo.Context) error {
	tripID := c.Param("tripId")
	id := c.Param("id")
	ctx := c.Request().Context()

	spot, err := h.queries.GetSpot(ctx, db.GetSpotParams{
		ID:     id,
		TripID: tripID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "spot not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get spot")
	}

	return c.JSON(http.StatusOK, spot)
}

// UpdateSpot handles PUT /trips/:tripId/spots/:id
func (h *SpotsHandler) UpdateSpot(c echo.Context) error {
	tripID := c.Param("tripId")
	id := c.Param("id")

	var req updateSpotRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	ctx := c.Request().Context()

	spot, err := h.queries.UpdateSpot(ctx, db.UpdateSpotParams{
		ID:        id,
		TripID:    tripID,
		DayIndex:  req.DayIndex,
		Order:     req.Order,
		Name:      req.Name,
		Address:   req.Address,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		Memo:      req.Memo,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "spot not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update spot")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "UPDATE",
		Table:  "spots",
		Record: spot,
	})

	return c.JSON(http.StatusOK, spot)
}

// DeleteSpot handles DELETE /trips/:tripId/spots/:id
func (h *SpotsHandler) DeleteSpot(c echo.Context) error {
	tripID := c.Param("tripId")
	id := c.Param("id")
	ctx := c.Request().Context()

	err := h.queries.DeleteSpot(ctx, db.DeleteSpotParams{
		ID:     id,
		TripID: tripID,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete spot")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:  "DELETE",
		Table: "spots",
		Record: map[string]string{
			"id":     id,
			"tripId": tripID,
		},
	})

	return c.NoContent(http.StatusNoContent)
}
