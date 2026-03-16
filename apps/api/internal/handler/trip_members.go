package handler

import (
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"

	db "github.com/shunto-ishiguro/trip-plan-app/apps/api/db/generated"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/ws"
)

type TripMembersHandler struct {
	queries *db.Queries
	hub     *ws.Hub
}

func NewTripMembersHandler(queries *db.Queries, hub *ws.Hub) *TripMembersHandler {
	return &TripMembersHandler{queries: queries, hub: hub}
}

type updateRoleRequest struct {
	Role string `json:"role"`
}

// ListMembers returns all members of a trip.
func (h *TripMembersHandler) ListMembers(c echo.Context) error {
	tripID := c.Param("tripId")
	ctx := c.Request().Context()

	members, err := h.queries.ListTripMembers(ctx, tripID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to query trip members")
	}
	if members == nil {
		members = []db.TripMember{}
	}

	return c.JSON(http.StatusOK, members)
}

// UpdateMemberRole changes the role of a trip member.
func (h *TripMembersHandler) UpdateMemberRole(c echo.Context) error {
	tripID := c.Param("tripId")
	userID := c.Param("userId")
	ctx := c.Request().Context()

	var req updateRoleRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if req.Role == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "role is required")
	}

	m, err := h.queries.UpdateTripMemberRole(ctx, db.UpdateTripMemberRoleParams{
		TripID: tripID,
		UserID: userID,
		Role:   db.TripRole(req.Role),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "member not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update member role")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "UPDATE",
		Table:  "trip_members",
		Record: m,
	})

	return c.JSON(http.StatusOK, m)
}

// RemoveMember removes a member from a trip.
func (h *TripMembersHandler) RemoveMember(c echo.Context) error {
	tripID := c.Param("tripId")
	userID := c.Param("userId")
	ctx := c.Request().Context()

	err := h.queries.DeleteTripMember(ctx, db.DeleteTripMemberParams{
		TripID: tripID,
		UserID: userID,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to remove member")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "DELETE",
		Table:  "trip_members",
		Record: map[string]string{"tripId": tripID, "userId": userID},
	})

	return c.NoContent(http.StatusNoContent)
}
