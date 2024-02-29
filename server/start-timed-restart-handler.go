package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type StartTimedRestartRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		Interval float32 `json:"interval"`
	}
}

type StartTimedRestartRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

var startTimedRestartEvent = "START_TIMED_RESTART"

func StartTimedRestartHandler(conn *websocket.Conn, data []byte) {
	var message StartTimedRestartRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(StartTimedRestartRes{
			Event:   startTimedRestartEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	timedrestartmanager.Start(message.Data.Interval)

	conn.WriteJSON(StartTimedRestartRes{
		Event:   startTimedRestartEvent,
		EventId: message.EventId,
		Success: true,
	})

	EmitTimedRestartSettings(nil)
}
