package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type ReadSaveRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		LaunchParams []string `json:"launchParams"`
	}
}

type ReadSaveRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Data    string `json:"data"`
}

var readSaveEvent = "READ_SAVE_NAME"

func ReadSaveHandler(conn *websocket.Conn, data []byte) {
	var message ReadSaveRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(ReadSaveRes{
			Event:   readSaveEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	config := ReadSaveName()

	conn.WriteJSON(ReadSaveRes{
		Event:   readSaveEvent,
		EventId: message.EventId,
		Success: true,
		Data:    config,
	})
}
