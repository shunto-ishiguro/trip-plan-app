package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/auth"
)

const UserContextKey = "user"

type AuthUser struct {
	ID    string
	Email string
}

func JWTAuth(verifier *auth.JWTVerifier) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			header := c.Request().Header.Get("Authorization")
			if header == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "missing authorization header")
			}

			parts := strings.SplitN(header, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid authorization format")
			}

			payload, err := verifier.Verify(parts[1])
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
			}

			c.Set(UserContextKey, &AuthUser{
				ID:    payload.Sub,
				Email: payload.Email,
			})

			return next(c)
		}
	}
}

func GetUser(c echo.Context) *AuthUser {
	u, ok := c.Get(UserContextKey).(*AuthUser)
	if !ok {
		return nil
	}
	return u
}
