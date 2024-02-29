package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type StopTimedRestartRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
}

type StopTimedRestartRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

var stopTimedRestartEvent = "STOP_TIMED_RESTART"

func StopTimedRestartHandler(conn *websocket.Conn, data []byte) {
	var message StopTimedRestartRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(StopTimedRestartRes{
			Event:   stopTimedRestartEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	timedrestartmanager.Stop()

	conn.WriteJSON(StopTimedRestartRes{
		Event:   stopTimedRestartEvent,
		EventId: message.EventId,
		Success: true,
	})

	EmitTimedRestartSettings(nil)
}
