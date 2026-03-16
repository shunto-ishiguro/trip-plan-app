package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	echomw "github.com/labstack/echo/v4/middleware"

	db "github.com/shunto-ishiguro/trip-plan-app/apps/api/db/generated"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/auth"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/config"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/handler"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/middleware"
	"github.com/shunto-ishiguro/trip-plan-app/apps/api/internal/ws"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// Database
	pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("failed to ping database: %v", err)
	}

	// sqlc queries
	queries := db.New(pool)

	// JWT verifier
	verifier := auth.NewJWTVerifier(cfg.JWTSecret)

	// WebSocket hub
	hub := ws.NewHub()

	// Echo
	e := echo.New()
	e.HideBanner = true

	// Global middleware
	e.Use(echomw.Logger())
	e.Use(echomw.Recover())
	e.Use(echomw.CORSWithConfig(echomw.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Authorization", "Content-Type"},
	}))

	// Health check
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})

	// API v1 group
	v1 := e.Group("/api/v1")

	// Auth middleware
	authMW := middleware.JWTAuth(verifier)

	// Rate limiter for auth endpoints (10 req / 15 min)
	authRL := middleware.NewRateLimiter(10, 15*time.Minute)

	// --- Auth routes ---
	authHandler := handler.NewHandler(cfg.SupabaseURL, cfg.SupabaseServiceKey)
	authGroup := v1.Group("/auth")
	authGroup.POST("/signup", authHandler.Signup, authRL.Middleware())
	authGroup.POST("/login", authHandler.Login, authRL.Middleware())
	authGroup.POST("/refresh", authHandler.Refresh, authRL.Middleware())
	authGroup.GET("/me", authHandler.Me, authMW)

	// --- Trip routes ---
	tripsHandler := handler.NewTripsHandler(pool, queries, hub)
	v1.GET("/trips", tripsHandler.ListTrips, authMW)
	v1.POST("/trips", tripsHandler.CreateTrip, authMW)

	// Trip-scoped routes (require membership)
	tripGroup := v1.Group("/trips/:tripId", authMW)

	tripGroup.GET("", tripsHandler.GetTrip, middleware.AuthorizeTrip(pool, middleware.RoleViewer))
	tripGroup.PUT("", tripsHandler.UpdateTrip, middleware.AuthorizeTrip(pool, middleware.RoleEditor))
	tripGroup.DELETE("", tripsHandler.DeleteTrip, middleware.AuthorizeTrip(pool, middleware.RoleOwner))

	// --- Spots ---
	spotsHandler := handler.NewSpotsHandler(queries, hub)
	tripGroup.GET("/spots", spotsHandler.ListSpots, middleware.AuthorizeTrip(pool, middleware.RoleViewer))
	tripGroup.POST("/spots", spotsHandler.CreateSpot, middleware.AuthorizeTrip(pool, middleware.RoleEditor))
	tripGroup.GET("/spots/:id", spotsHandler.GetSpot, middleware.AuthorizeTrip(pool, middleware.RoleViewer))
	tripGroup.PUT("/spots/:id", spotsHandler.UpdateSpot, middleware.AuthorizeTrip(pool, middleware.RoleEditor))
	tripGroup.DELETE("/spots/:id", spotsHandler.DeleteSpot, middleware.AuthorizeTrip(pool, middleware.RoleEditor))

	// --- Budget items ---
	budgetHandler := handler.NewBudgetItemsHandler(queries, hub)
	tripGroup.GET("/budget-items", budgetHandler.List, middleware.AuthorizeTrip(pool, middleware.RoleViewer))
	tripGroup.POST("/budget-items", budgetHandler.Create, middleware.AuthorizeTrip(pool, middleware.RoleEditor))
	tripGroup.PUT("/budget-items/:id", budgetHandler.Update, middleware.AuthorizeTrip(pool, middleware.RoleEditor))
	tripGroup.DELETE("/budget-items/:id", budgetHandler.Delete, middleware.AuthorizeTrip(pool, middleware.RoleEditor))

	// --- Checklist items ---
	checklistHandler := handler.NewChecklistItemsHandler(queries, hub)
	tripGroup.GET("/checklist-items", checklistHandler.List, middleware.AuthorizeTrip(pool, middleware.RoleViewer))
	tripGroup.POST("/checklist-items", checklistHandler.Create, middleware.AuthorizeTrip(pool, middleware.RoleEditor))
	tripGroup.POST("/checklist-items/batch", checklistHandler.BatchCreate, middleware.AuthorizeTrip(pool, middleware.RoleEditor))
	tripGroup.PATCH("/checklist-items/:id/toggle", checklistHandler.Toggle, middleware.AuthorizeTrip(pool, middleware.RoleEditor))
	tripGroup.PUT("/checklist-items/:id", checklistHandler.Update, middleware.AuthorizeTrip(pool, middleware.RoleEditor))
	tripGroup.DELETE("/checklist-items/:id", checklistHandler.Delete, middleware.AuthorizeTrip(pool, middleware.RoleEditor))

	// --- Reservations ---
	reservationsHandler := handler.NewReservationsHandler(queries, hub)
	tripGroup.GET("/reservations", reservationsHandler.List, middleware.AuthorizeTrip(pool, middleware.RoleViewer))
	tripGroup.POST("/reservations", reservationsHandler.Create, middleware.AuthorizeTrip(pool, middleware.RoleEditor))
	tripGroup.PUT("/reservations/:id", reservationsHandler.Update, middleware.AuthorizeTrip(pool, middleware.RoleEditor))
	tripGroup.DELETE("/reservations/:id", reservationsHandler.Delete, middleware.AuthorizeTrip(pool, middleware.RoleEditor))

	// --- Share settings (owner only) ---
	shareHandler := handler.NewShareSettingsHandler(queries, hub)
	tripGroup.GET("/share", shareHandler.GetShareSettings, middleware.AuthorizeTrip(pool, middleware.RoleOwner))
	tripGroup.POST("/share", shareHandler.CreateShareSettings, middleware.AuthorizeTrip(pool, middleware.RoleOwner))
	tripGroup.PUT("/share", shareHandler.UpdateShareSettings, middleware.AuthorizeTrip(pool, middleware.RoleOwner))
	tripGroup.DELETE("/share", shareHandler.DeleteShareSettings, middleware.AuthorizeTrip(pool, middleware.RoleOwner))

	// --- Members ---
	membersHandler := handler.NewTripMembersHandler(queries, hub)
	tripGroup.GET("/members", membersHandler.ListMembers, middleware.AuthorizeTrip(pool, middleware.RoleViewer))
	tripGroup.PUT("/members/:userId", membersHandler.UpdateMemberRole, middleware.AuthorizeTrip(pool, middleware.RoleOwner))
	tripGroup.DELETE("/members/:userId", membersHandler.RemoveMember, middleware.AuthorizeTrip(pool, middleware.RoleOwner))

	// --- WebSocket ---
	wsHandler := handler.NewWSHandler(hub, verifier, queries)
	v1.GET("/trips/:tripId/ws", wsHandler.HandleWS)

	// --- Share join (no trip scope) ---
	shareJoinHandler := handler.NewShareJoinHandler(queries)
	v1.GET("/share/preview/:token", shareJoinHandler.PreviewShare)
	v1.POST("/share/join", shareJoinHandler.JoinShare, authMW)

	// Graceful shutdown
	go func() {
		if err := e.Start(fmt.Sprintf(":%s", cfg.Port)); err != nil {
			log.Printf("shutting down: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(ctx); err != nil {
		log.Fatal(err)
	}
}
