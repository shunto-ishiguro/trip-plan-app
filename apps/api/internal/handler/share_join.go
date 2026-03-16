package handler

import (
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"

	db "github.com/shunto-ishiguro/trip-plan-app/apps/api/db/generated"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/middleware"
)

type ShareJoinHandler struct {
	queries *db.Queries
}

func NewShareJoinHandler(queries *db.Queries) *ShareJoinHandler {
	return &ShareJoinHandler{queries: queries}
}

type sharePreview struct {
	TripID      string `json:"tripId"`
	Title       string `json:"title"`
	Destination string `json:"destination"`
	StartDate   string `json:"startDate"`
	EndDate     string `json:"endDate"`
	Permission  string `json:"permission"`
}

type joinRequest struct {
	Token string `json:"token"`
}

type joinResponse struct {
	TripID string `json:"tripId"`
	Role   string `json:"role"`
}

// PreviewShare returns trip info for a share token without authentication.
func (h *ShareJoinHandler) PreviewShare(c echo.Context) error {
	token := c.Param("token")
	ctx := c.Request().Context()

	row, err := h.queries.GetShareByToken(ctx, token)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "share link not found or inactive")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to query share preview")
	}

	return c.JSON(http.StatusOK, sharePreview{
		TripID:      row.TripID,
		Title:       row.Title,
		Destination: row.Destination,
		StartDate:   row.StartDate,
		EndDate:     row.EndDate,
		Permission:  string(row.Permission),
	})
}

// JoinShare adds the authenticated user to a trip via share token.
func (h *ShareJoinHandler) JoinShare(c echo.Context) error {
	user := middleware.GetUser(c)
	if user == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "not authenticated")
	}

	var req joinRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if req.Token == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "token is required")
	}

	ctx := c.Request().Context()

	ss, err := h.queries.GetShareSettingsByToken(ctx, req.Token)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "share link not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to query share settings")
	}

	// Map permission to role.
	role := "viewer"
	if ss.Permission == db.SharePermissionEdit {
		role = "editor"
	}

	err = h.queries.UpsertTripMember(ctx, db.UpsertTripMemberParams{
		TripID: ss.TripID,
		UserID: user.ID,
		Role:   db.TripRole(role),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to join trip")
	}

	return c.JSON(http.StatusOK, joinResponse{
		TripID: ss.TripID,
		Role:   role,
	})
}
