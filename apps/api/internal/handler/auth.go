package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/middleware"
)

type Handler struct {
	supabaseURL        string
	supabaseServiceKey string
}

func NewHandler(supabaseURL, supabaseServiceKey string) *Handler {
	return &Handler{
		supabaseURL:        supabaseURL,
		supabaseServiceKey: supabaseServiceKey,
	}
}

type signupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type refreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// Signup creates a user via the Supabase Admin API with auto-confirm,
// then immediately logs in to return a full session.
func (h *Handler) Signup(c echo.Context) error {
	var req signupRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if req.Email == "" || req.Password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email and password are required")
	}

	// Create user via Admin API.
	adminBody, err := json.Marshal(map[string]interface{}{
		"email":         req.Email,
		"password":      req.Password,
		"email_confirm": true,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to build request")
	}

	adminReq, err := http.NewRequestWithContext(
		c.Request().Context(),
		http.MethodPost,
		fmt.Sprintf("%s/auth/v1/admin/users", h.supabaseURL),
		bytes.NewReader(adminBody),
	)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create request")
	}
	adminReq.Header.Set("Content-Type", "application/json")
	adminReq.Header.Set("Authorization", "Bearer "+h.supabaseServiceKey)
	adminReq.Header.Set("apikey", h.supabaseServiceKey)

	adminResp, err := http.DefaultClient.Do(adminReq)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to reach auth service")
	}
	defer adminResp.Body.Close()

	if adminResp.StatusCode == http.StatusUnprocessableEntity || adminResp.StatusCode == http.StatusConflict {
		return echo.NewHTTPError(http.StatusConflict, "user already exists")
	}
	if adminResp.StatusCode >= 400 {
		body, _ := io.ReadAll(adminResp.Body)
		return echo.NewHTTPError(adminResp.StatusCode, fmt.Sprintf("signup failed: %s", string(body)))
	}

	// Immediately login to obtain session tokens.
	return h.doLogin(c, req.Email, req.Password)
}

// Login authenticates via the Supabase GoTrue password grant and returns the session.
func (h *Handler) Login(c echo.Context) error {
	var req loginRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if req.Email == "" || req.Password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email and password are required")
	}

	return h.doLogin(c, req.Email, req.Password)
}

// Refresh exchanges a refresh token for a new access token via Supabase GoTrue.
func (h *Handler) Refresh(c echo.Context) error {
	var req refreshRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if req.RefreshToken == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "refresh_token is required")
	}

	body, err := json.Marshal(map[string]string{
		"refresh_token": req.RefreshToken,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to build request")
	}

	url := fmt.Sprintf("%s/auth/v1/token?grant_type=refresh_token", h.supabaseURL)
	httpReq, err := http.NewRequestWithContext(
		c.Request().Context(),
		http.MethodPost,
		url,
		bytes.NewReader(body),
	)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create request")
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("apikey", h.supabaseServiceKey)

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to reach auth service")
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to read response")
	}

	if resp.StatusCode >= 400 {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("refresh failed: %s", string(respBody)))
	}

	var result json.RawMessage
	if err := json.Unmarshal(respBody, &result); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "invalid response from auth service")
	}

	return c.JSON(http.StatusOK, result)
}

// Me returns the authenticated user's info from the request context.
func (h *Handler) Me(c echo.Context) error {
	user := middleware.GetUser(c)
	if user == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "not authenticated")
	}

	return c.JSON(http.StatusOK, map[string]string{
		"id":    user.ID,
		"email": user.Email,
	})
}

// doLogin performs the password-grant login against Supabase GoTrue
// and writes the response as-is back to the client.
func (h *Handler) doLogin(c echo.Context, email, password string) error {
	body, err := json.Marshal(map[string]string{
		"email":    email,
		"password": password,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to build request")
	}

	url := fmt.Sprintf("%s/auth/v1/token?grant_type=password", h.supabaseURL)
	httpReq, err := http.NewRequestWithContext(
		c.Request().Context(),
		http.MethodPost,
		url,
		bytes.NewReader(body),
	)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create request")
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("apikey", h.supabaseServiceKey)

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to reach auth service")
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to read response")
	}

	if resp.StatusCode == http.StatusBadRequest || resp.StatusCode == http.StatusUnauthorized {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}
	if resp.StatusCode >= 400 {
		return echo.NewHTTPError(resp.StatusCode, fmt.Sprintf("login failed: %s", string(respBody)))
	}

	var result json.RawMessage
	if err := json.Unmarshal(respBody, &result); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "invalid response from auth service")
	}

	return c.JSON(http.StatusOK, result)
}
