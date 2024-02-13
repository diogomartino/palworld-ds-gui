package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type ClientInitRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		NewSaveName string `json:"saveName"`
	}
}

type ClientInitRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Data    string `json:"data"`
}

var clientInitEvent = "INIT"

func ClientInitHandler(conn *websocket.Conn, data []byte) {
	var message ClientInitRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(ClientInitRes{
			Event:   clientInitEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	serverRunning := servermanager.IsRunning()
	currentState := "STOPPED"
	if serverRunning {
		currentState = "STARTED"
	}

	conn.WriteJSON(ClientInitRes{
		Event:   clientInitEvent,
		EventId: message.EventId,
		Success: true,
		Data:    currentState,
	})
}
