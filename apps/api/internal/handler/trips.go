package handler

import (
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"

	db "github.com/shunto-ishiguro/trip-plan-app/apps/api/db/generated"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/middleware"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/ws"
)

type TripsHandler struct {
	pool    *pgxpool.Pool
	queries *db.Queries
	hub     *ws.Hub
}

func NewTripsHandler(pool *pgxpool.Pool, queries *db.Queries, hub *ws.Hub) *TripsHandler {
	return &TripsHandler{pool: pool, queries: queries, hub: hub}
}

type createTripRequest struct {
	Title       string  `json:"title"`
	Destination string  `json:"destination"`
	StartDate   string  `json:"startDate"`
	EndDate     string  `json:"endDate"`
	MemberCount int32   `json:"memberCount"`
	Memo        *string `json:"memo"`
}

type updateTripRequest struct {
	Title       *string `json:"title"`
	Destination *string `json:"destination"`
	StartDate   *string `json:"startDate"`
	EndDate     *string `json:"endDate"`
	MemberCount *int32  `json:"memberCount"`
	Memo        *string `json:"memo"`
}

// ListTrips handles GET /trips
func (h *TripsHandler) ListTrips(c echo.Context) error {
	user := middleware.GetUser(c)
	if user == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	ctx := c.Request().Context()
	trips, err := h.queries.ListTripsByUser(ctx, user.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to query trips")
	}
	if trips == nil {
		trips = []db.Trip{}
	}

	return c.JSON(http.StatusOK, trips)
}

// CreateTrip handles POST /trips
func (h *TripsHandler) CreateTrip(c echo.Context) error {
	user := middleware.GetUser(c)
	if user == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	var req createTripRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if req.Title == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "title is required")
	}
	if req.Destination == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "destination is required")
	}

	ctx := c.Request().Context()

	tx, err := h.pool.Begin(ctx)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to begin transaction")
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	qtx := h.queries.WithTx(tx)

	var ownerID pgtype.UUID
	_ = ownerID.Scan(user.ID)

	trip, err := qtx.CreateTrip(ctx, db.CreateTripParams{
		Title:       req.Title,
		Destination: req.Destination,
		StartDate:   req.StartDate,
		EndDate:     req.EndDate,
		MemberCount: req.MemberCount,
		Memo:        req.Memo,
		OwnerID:     ownerID,
	})
	if err != nil {
		c.Logger().Errorf("failed to create trip: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create trip")
	}

	_, err = qtx.CreateTripMember(ctx, db.CreateTripMemberParams{
		TripID: trip.ID,
		UserID: user.ID,
		Role:   db.TripRoleOwner,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to add owner as member")
	}

	if err := tx.Commit(ctx); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to commit transaction")
	}

	return c.JSON(http.StatusCreated, trip)
}

// GetTrip handles GET /trips/:tripId
func (h *TripsHandler) GetTrip(c echo.Context) error {
	tripID := c.Param("tripId")
	ctx := c.Request().Context()

	trip, err := h.queries.GetTrip(ctx, tripID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "trip not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get trip")
	}

	return c.JSON(http.StatusOK, trip)
}

// UpdateTrip handles PUT /trips/:tripId
func (h *TripsHandler) UpdateTrip(c echo.Context) error {
	tripID := c.Param("tripId")

	var req updateTripRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	ctx := c.Request().Context()

	trip, err := h.queries.UpdateTrip(ctx, db.UpdateTripParams{
		ID:          tripID,
		Title:       req.Title,
		Destination: req.Destination,
		StartDate:   req.StartDate,
		EndDate:     req.EndDate,
		MemberCount: req.MemberCount,
		Memo:        req.Memo,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "trip not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update trip")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "UPDATE",
		Table:  "trips",
		Record: trip,
	})

	return c.JSON(http.StatusOK, trip)
}

// DeleteTrip handles DELETE /trips/:tripId
func (h *TripsHandler) DeleteTrip(c echo.Context) error {
	tripID := c.Param("tripId")
	ctx := c.Request().Context()

	err := h.queries.DeleteTrip(ctx, tripID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete trip")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:  "DELETE",
		Table: "trips",
		Record: map[string]string{
			"id": tripID,
		},
	})

	return c.NoContent(http.StatusNoContent)
}

// Register registers all trip routes on the given Echo group.
func (h *TripsHandler) Register(g *echo.Group) {
	g.GET("", h.ListTrips)
	g.POST("", h.CreateTrip)
	g.GET("/:tripId", h.GetTrip)
	g.PUT("/:tripId", h.UpdateTrip)
	g.DELETE("/:tripId", h.DeleteTrip)
}
