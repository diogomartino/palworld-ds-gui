package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type WriteConfigRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		NewConfig string `json:"config"`
	}
}

type WriteConfigRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Data    string `json:"data"`
}

var writeConfigEvent = "WRITE_CONFIG"

func WriteConfigHandler(conn *websocket.Conn, data []byte) {
	var message WriteConfigRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(WriteConfigRes{
			Event:   writeConfigEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	WriteConfig(message.Data.NewConfig)

	// this response is just to flag the client that the write was successful
	// the emit below will send the new config to all clients
	conn.WriteJSON(WriteConfigRes{
		Event:   writeConfigEvent,
		EventId: message.EventId,
		Success: true,
	})

	EmitServerConfig(message.Data.NewConfig, nil)
}
