package ws

import (
	"encoding/json"
	"sync"

	"github.com/gorilla/websocket"
)

type BroadcastEvent struct {
	Type   string      `json:"type"`
	Table  string      `json:"table"`
	Record interface{} `json:"record"`
}

type Client struct {
	Conn   *websocket.Conn
	TripID string
	UserID string
}

type Hub struct {
	mu    sync.RWMutex
	rooms map[string]map[*Client]struct{} // tripID -> set of clients
}

func NewHub() *Hub {
	return &Hub{
		rooms: make(map[string]map[*Client]struct{}),
	}
}

func (h *Hub) Subscribe(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.rooms[client.TripID] == nil {
		h.rooms[client.TripID] = make(map[*Client]struct{})
	}
	h.rooms[client.TripID][client] = struct{}{}
}

func (h *Hub) Unsubscribe(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if room, ok := h.rooms[client.TripID]; ok {
		delete(room, client)
		if len(room) == 0 {
			delete(h.rooms, client.TripID)
		}
	}
}

func (h *Hub) Broadcast(tripID string, event BroadcastEvent) {
	data, err := json.Marshal(event)
	if err != nil {
		return
	}

	h.mu.RLock()
	clients := h.rooms[tripID]
	h.mu.RUnlock()

	for client := range clients {
		_ = client.Conn.WriteMessage(websocket.TextMessage, data)
	}
}
