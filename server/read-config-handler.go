package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type ReadConfigRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		LaunchParams []string `json:"launchParams"`
	}
}

type ReadConfigRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Data    string `json:"data"`
}

var readConfigEvent = "READ_CONFIG"

func ReadConfigHandler(conn *websocket.Conn, data []byte) {
	var message ReadConfigRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(ReadConfigRes{
			Event:   readConfigEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	config := ReadConfig()

	conn.WriteJSON(ReadConfigRes{
		Event:   readConfigEvent,
		EventId: message.EventId,
		Success: true,
		Data:    config,
	})
}
