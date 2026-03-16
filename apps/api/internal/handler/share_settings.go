package handler

import (
	"crypto/rand"
	"errors"
	"math/big"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"

	db "github.com/shunto-ishiguro/trip-plan-app/apps/api/db/generated"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/middleware"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/ws"
)

const passphraseCharset = "ABCDEFGHJKMNPQRSTUVWXYZ23456789" // 30 chars, excludes O/I/L/0/1
const passphraseLength = 6
const maxPassphraseRetries = 5

type ShareSettingsHandler struct {
	queries *db.Queries
	hub     *ws.Hub
}

func NewShareSettingsHandler(queries *db.Queries, hub *ws.Hub) *ShareSettingsHandler {
	return &ShareSettingsHandler{queries: queries, hub: hub}
}

type createShareSettingsRequest struct {
	Permission string `json:"permission"`
}

type updateShareSettingsRequest struct {
	Permission *string `json:"permission,omitempty"`
	IsActive   *bool   `json:"isActive,omitempty"`
}

func generatePassphrase() (string, error) {
	b := make([]byte, passphraseLength)
	charsetLen := big.NewInt(int64(len(passphraseCharset)))
	for i := range b {
		idx, err := rand.Int(rand.Reader, charsetLen)
		if err != nil {
			return "", err
		}
		b[i] = passphraseCharset[idx.Int64()]
	}
	return string(b), nil
}

// GetShareSettings returns the share settings for a trip.
func (h *ShareSettingsHandler) GetShareSettings(c echo.Context) error {
	tripID := c.Param("tripId")
	ctx := c.Request().Context()

	s, err := h.queries.GetShareSettings(ctx, tripID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "share settings not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to query share settings")
	}

	return c.JSON(http.StatusOK, s)
}

// CreateShareSettings creates share settings for a trip with a unique passphrase token.
func (h *ShareSettingsHandler) CreateShareSettings(c echo.Context) error {
	tripID := c.Param("tripId")
	user := middleware.GetUser(c)
	ctx := c.Request().Context()

	var req createShareSettingsRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if req.Permission != "view" && req.Permission != "edit" {
		return echo.NewHTTPError(http.StatusBadRequest, "permission must be 'view' or 'edit'")
	}

	for attempt := 0; attempt < maxPassphraseRetries; attempt++ {
		token, err := generatePassphrase()
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate share token")
		}

		s, err := h.queries.CreateShareSettings(ctx, db.CreateShareSettingsParams{
			TripID:     tripID,
			Permission: db.SharePermission(req.Permission),
			ShareToken: token,
			CreatedBy:  user.ID,
		})
		if err != nil {
			if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
				continue
			}
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to create share settings")
		}

		h.hub.Broadcast(tripID, ws.BroadcastEvent{
			Type:   "INSERT",
			Table:  "share_settings",
			Record: s,
		})

		return c.JSON(http.StatusCreated, s)
	}

	return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate unique share token after retries")
}

// UpdateShareSettings updates permission and/or active status of share settings.
func (h *ShareSettingsHandler) UpdateShareSettings(c echo.Context) error {
	tripID := c.Param("tripId")
	ctx := c.Request().Context()

	var req updateShareSettingsRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	params := db.UpdateShareSettingsParams{
		TripID: tripID,
	}

	if req.Permission != nil {
		if *req.Permission != "view" && *req.Permission != "edit" {
			return echo.NewHTTPError(http.StatusBadRequest, "permission must be 'view' or 'edit'")
		}
		params.Permission = db.NullSharePermission{
			SharePermission: db.SharePermission(*req.Permission),
			Valid:           true,
		}
	}
	if req.IsActive != nil {
		params.IsActive = req.IsActive
	}

	s, err := h.queries.UpdateShareSettings(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "share settings not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update share settings")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "UPDATE",
		Table:  "share_settings",
		Record: s,
	})

	return c.JSON(http.StatusOK, s)
}

// DeleteShareSettings removes share settings for a trip.
func (h *ShareSettingsHandler) DeleteShareSettings(c echo.Context) error {
	tripID := c.Param("tripId")
	ctx := c.Request().Context()

	err := h.queries.DeleteShareSettings(ctx, tripID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete share settings")
	}

	h.hub.Broadcast(tripID, ws.BroadcastEvent{
		Type:   "DELETE",
		Table:  "share_settings",
		Record: map[string]string{"tripId": tripID},
	})

	return c.NoContent(http.StatusNoContent)
}
