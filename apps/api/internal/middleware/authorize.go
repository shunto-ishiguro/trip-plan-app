package middleware

import (
	"context"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
)

type TripRole string

const (
	RoleOwner  TripRole = "owner"
	RoleEditor TripRole = "editor"
	RoleViewer TripRole = "viewer"
)

var roleLevel = map[TripRole]int{
	RoleOwner:  3,
	RoleEditor: 2,
	RoleViewer: 1,
}

func AuthorizeTrip(pool *pgxpool.Pool, requiredRole TripRole) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user := GetUser(c)
			if user == nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "not authenticated")
			}

			tripID := c.Param("tripId")
			if tripID == "" {
				return echo.NewHTTPError(http.StatusBadRequest, "missing tripId")
			}

			var role TripRole
			err := pool.QueryRow(context.Background(),
				"SELECT role FROM trip_members WHERE trip_id = $1 AND user_id = $2",
				tripID, user.ID,
			).Scan(&role)
			if err != nil {
				return echo.NewHTTPError(http.StatusForbidden, "not a member of this trip")
			}

			if roleLevel[role] < roleLevel[requiredRole] {
				return echo.NewHTTPError(http.StatusForbidden, "insufficient permissions")
			}

			c.Set("tripRole", role)
			return next(c)
		}
	}
}
