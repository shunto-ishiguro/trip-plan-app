package ws

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

func TestHub_Subscribe(t *testing.T) {
	hub := NewHub()
	client := &Client{TripID: "trip-1", UserID: "user-1"}

	hub.Subscribe(client)

	hub.mu.RLock()
	defer hub.mu.RUnlock()

	room, ok := hub.rooms["trip-1"]
	if !ok {
		t.Fatal("expected room trip-1 to exist")
	}
	if _, exists := room[client]; !exists {
		t.Fatal("expected client to be in room")
	}
	if len(room) != 1 {
		t.Fatalf("expected 1 client in room, got %d", len(room))
	}
}

func TestHub_SubscribeMultipleClients(t *testing.T) {
	hub := NewHub()
	c1 := &Client{TripID: "trip-1", UserID: "user-1"}
	c2 := &Client{TripID: "trip-1", UserID: "user-2"}

	hub.Subscribe(c1)
	hub.Subscribe(c2)

	hub.mu.RLock()
	defer hub.mu.RUnlock()

	if len(hub.rooms["trip-1"]) != 2 {
		t.Fatalf("expected 2 clients, got %d", len(hub.rooms["trip-1"]))
	}
}

func TestHub_Unsubscribe(t *testing.T) {
	hub := NewHub()
	client := &Client{TripID: "trip-1", UserID: "user-1"}

	hub.Subscribe(client)
	hub.Unsubscribe(client)

	hub.mu.RLock()
	defer hub.mu.RUnlock()

	if _, ok := hub.rooms["trip-1"]; ok {
		t.Fatal("expected room trip-1 to be removed when empty")
	}
}

func TestHub_UnsubscribeOneOfMany(t *testing.T) {
	hub := NewHub()
	c1 := &Client{TripID: "trip-1", UserID: "user-1"}
	c2 := &Client{TripID: "trip-1", UserID: "user-2"}

	hub.Subscribe(c1)
	hub.Subscribe(c2)
	hub.Unsubscribe(c1)

	hub.mu.RLock()
	defer hub.mu.RUnlock()

	room := hub.rooms["trip-1"]
	if len(room) != 1 {
		t.Fatalf("expected 1 client remaining, got %d", len(room))
	}
	if _, exists := room[c2]; !exists {
		t.Fatal("expected c2 to remain in room")
	}
}

// wsTestServer creates a test WebSocket server that subscribes the connection
// to the hub under the given tripID and keeps it alive until the connection closes.
func wsTestServer(hub *Hub, tripID, userID string) *httptest.Server {
	upgrader := websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		client := &Client{Conn: conn, TripID: tripID, UserID: userID}
		hub.Subscribe(client)
		defer func() {
			hub.Unsubscribe(client)
			conn.Close()
		}()
		// Keep reading to detect close
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				return
			}
		}
	}))
}

func dialWS(t *testing.T, serverURL string) *websocket.Conn {
	t.Helper()
	url := "ws" + strings.TrimPrefix(serverURL, "http")
	conn, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		t.Fatalf("failed to dial websocket: %v", err)
	}
	return conn
}

func TestHub_BroadcastSendsToRoom(t *testing.T) {
	hub := NewHub()
	srv := wsTestServer(hub, "trip-1", "user-1")
	defer srv.Close()

	conn := dialWS(t, srv.URL)
	defer conn.Close()

	// Give server time to subscribe the client
	time.Sleep(50 * time.Millisecond)

	event := BroadcastEvent{Type: "INSERT", Table: "spots", Record: map[string]string{"id": "s1"}}
	hub.Broadcast("trip-1", event)

	conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	_, msg, err := conn.ReadMessage()
	if err != nil {
		t.Fatalf("expected to receive message, got error: %v", err)
	}

	var received BroadcastEvent
	if err := json.Unmarshal(msg, &received); err != nil {
		t.Fatalf("failed to unmarshal: %v", err)
	}
	if received.Type != "INSERT" || received.Table != "spots" {
		t.Errorf("unexpected event: %+v", received)
	}
}

func TestHub_BroadcastDoesNotSendToOtherRooms(t *testing.T) {
	hub := NewHub()

	// Client in trip-2
	srv := wsTestServer(hub, "trip-2", "user-2")
	defer srv.Close()

	conn := dialWS(t, srv.URL)
	defer conn.Close()

	time.Sleep(50 * time.Millisecond)

	// Broadcast to trip-1 (different room)
	event := BroadcastEvent{Type: "UPDATE", Table: "spots", Record: nil}
	hub.Broadcast("trip-1", event)

	// The client in trip-2 should NOT receive this message
	conn.SetReadDeadline(time.Now().Add(200 * time.Millisecond))
	_, _, err := conn.ReadMessage()
	if err == nil {
		t.Fatal("expected no message for client in different room, but received one")
	}
}
