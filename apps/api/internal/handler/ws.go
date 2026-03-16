package handler

import (
	"errors"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"

	db "github.com/shunto-ishiguro/trip-plan-app/apps/api/db/generated"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/auth"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/ws"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // allow all origins for now
	},
}

type WSHandler struct {
	hub      *ws.Hub
	verifier *auth.JWTVerifier
	queries  *db.Queries
}

func NewWSHandler(hub *ws.Hub, verifier *auth.JWTVerifier, queries *db.Queries) *WSHandler {
	return &WSHandler{hub: hub, verifier: verifier, queries: queries}
}

// HandleWS upgrades the connection to WebSocket for real-time trip updates.
func (h *WSHandler) HandleWS(c echo.Context) error {
	tripID := c.Param("tripId")
	token := c.QueryParam("token")

	if token == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "missing token query parameter")
	}

	// Verify JWT.
	payload, err := h.verifier.Verify(token)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
	}

	// Check user is at least a viewer of the trip.
	ctx := c.Request().Context()
	_, err = h.queries.GetTripMember(ctx, db.GetTripMemberParams{
		TripID: tripID,
		UserID: payload.Sub,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusForbidden, "not a member of this trip")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to check membership")
	}

	// Upgrade to WebSocket.
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Printf("websocket upgrade failed: %v", err)
		return err
	}
	defer conn.Close()

	client := &ws.Client{
		Conn:   conn,
		TripID: tripID,
		UserID: payload.Sub,
	}

	h.hub.Subscribe(client)
	defer h.hub.Unsubscribe(client)

	// Send connected message.
	if err := conn.WriteJSON(map[string]string{
		"type":   "connected",
		"tripId": tripID,
	}); err != nil {
		return nil
	}

	// Read loop to detect disconnection.
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}

	return nil
}
