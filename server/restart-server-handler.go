package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type RestartServerRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		LaunchParams []string `json:"launchParams"`
	}
}

type RestartServerRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

var restartServerEvent = "RESTART_SERVER"

func RestartServerHandler(conn *websocket.Conn, data []byte) {
	EmitServerStatus("RESTARTING", nil)

	var message RestartServerRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(RestartServerRes{
			Event:   restartServerEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	err = servermanager.Restart()
	if err != nil {
		utils.Log("Error restarting the server: " + err.Error())
		EmitServerStatus("STOPPED", nil)
		return
	}

	EmitServerStatus("STARTED", nil)
}
