package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
)

func setupRateLimitTest(rl *RateLimiter) (*echo.Echo, echo.HandlerFunc) {
	e := echo.New()
	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	}
	return e, rl.Middleware()(handler)
}

func makeRequest(e *echo.Echo, handler echo.HandlerFunc, ip string) int {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("X-Real-IP", ip)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	err := handler(c)
	if err != nil {
		// echo.NewHTTPError returns *echo.HTTPError; extract the code from it
		if he, ok := err.(*echo.HTTPError); ok {
			return he.Code
		}
		return http.StatusInternalServerError
	}
	return rec.Code
}

func TestRateLimit_WithinLimit(t *testing.T) {
	rl := &RateLimiter{
		store:  make(map[string]*rateLimitEntry),
		max:    5,
		window: time.Minute,
	}
	e, handler := setupRateLimitTest(rl)

	for i := 0; i < 5; i++ {
		code := makeRequest(e, handler, "1.2.3.4")
		if code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d", i+1, code)
		}
	}
}

func TestRateLimit_ExceedsLimit(t *testing.T) {
	rl := &RateLimiter{
		store:  make(map[string]*rateLimitEntry),
		max:    3,
		window: time.Minute,
	}
	e, handler := setupRateLimitTest(rl)

	for i := 0; i < 3; i++ {
		code := makeRequest(e, handler, "1.2.3.4")
		if code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d", i+1, code)
		}
	}

	code := makeRequest(e, handler, "1.2.3.4")
	if code != http.StatusTooManyRequests {
		t.Fatalf("expected 429, got %d", code)
	}
}

func TestRateLimit_DifferentIPs(t *testing.T) {
	rl := &RateLimiter{
		store:  make(map[string]*rateLimitEntry),
		max:    1,
		window: time.Minute,
	}
	e, handler := setupRateLimitTest(rl)

	// First request from IP A should pass
	code := makeRequest(e, handler, "10.0.0.1")
	if code != http.StatusOK {
		t.Fatalf("expected 200 for IP A, got %d", code)
	}

	// Second request from IP A should be rejected
	code = makeRequest(e, handler, "10.0.0.1")
	if code != http.StatusTooManyRequests {
		t.Fatalf("expected 429 for IP A second request, got %d", code)
	}

	// First request from IP B should still pass
	code = makeRequest(e, handler, "10.0.0.2")
	if code != http.StatusOK {
		t.Fatalf("expected 200 for IP B, got %d", code)
	}
}

func TestRateLimit_WindowExpiry(t *testing.T) {
	rl := &RateLimiter{
		store:  make(map[string]*rateLimitEntry),
		max:    1,
		window: 50 * time.Millisecond,
	}
	e, handler := setupRateLimitTest(rl)

	code := makeRequest(e, handler, "1.2.3.4")
	if code != http.StatusOK {
		t.Fatalf("expected 200, got %d", code)
	}

	code = makeRequest(e, handler, "1.2.3.4")
	if code != http.StatusTooManyRequests {
		t.Fatalf("expected 429, got %d", code)
	}

	// Wait for window to expire
	time.Sleep(60 * time.Millisecond)

	code = makeRequest(e, handler, "1.2.3.4")
	if code != http.StatusOK {
		t.Fatalf("expected 200 after window expiry, got %d", code)
	}
}
