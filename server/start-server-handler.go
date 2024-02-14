package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type StartServerRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
}

type StartServerRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

var startServerEvent = "START_SERVER"

func StartServerHandler(conn *websocket.Conn, data []byte) {
	EmitServerStatus("STARTING", nil)

	var message StartServerRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(StartServerRes{
			Event:   startServerEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	err = servermanager.Start()

	if err != nil {
		utils.Log(err.Error())
		EmitServerStatus("ERROR", nil)
	} else {
		EmitServerStatus("STARTED", nil)
	}
}
