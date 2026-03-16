package middleware

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
)

type rateLimitEntry struct {
	count     int
	expiresAt time.Time
}

type RateLimiter struct {
	mu     sync.Mutex
	store  map[string]*rateLimitEntry
	max    int
	window time.Duration
}

func NewRateLimiter(max int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		store:  make(map[string]*rateLimitEntry),
		max:    max,
		window: window,
	}

	// cleanup expired entries every 5 minutes
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			rl.cleanup()
		}
	}()

	return rl
}

func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for key, entry := range rl.store {
		if now.After(entry.expiresAt) {
			delete(rl.store, key)
		}
	}
}

func (rl *RateLimiter) Middleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ip := c.Request().Header.Get("X-Forwarded-For")
			if ip == "" {
				ip = c.Request().Header.Get("X-Real-IP")
			}
			if ip == "" {
				ip = c.RealIP()
			}

			rl.mu.Lock()
			entry, ok := rl.store[ip]
			now := time.Now()

			if !ok || now.After(entry.expiresAt) {
				rl.store[ip] = &rateLimitEntry{
					count:     1,
					expiresAt: now.Add(rl.window),
				}
				rl.mu.Unlock()
				return next(c)
			}

			entry.count++
			if entry.count > rl.max {
				retryAfter := entry.expiresAt.Sub(now).Seconds()
				rl.mu.Unlock()
				c.Response().Header().Set("Retry-After", strconv.Itoa(int(retryAfter)))
				return echo.NewHTTPError(http.StatusTooManyRequests, "too many requests")
			}

			rl.mu.Unlock()
			return next(c)
		}
	}
}
