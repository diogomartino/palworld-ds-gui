package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type RconExecHandlerRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		Hostname string `json:"hostname"`
		Password string `json:"password"`
		Command  string `json:"command"`
	}
}

type RconExecHandlerRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Data    string `json:"data"`
}

var rconExecHandlerEvent = "RCON_EXECUTE"

func RconExecHandlerHandler(conn *websocket.Conn, data []byte) {
	var message RconExecHandlerRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(RconExecHandlerRes{
			Event:   rconExecHandlerEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	result, err := rconclient.Execute(message.Data.Hostname, message.Data.Password, message.Data.Command)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(RestoreBackupRes{
			Event:   restoreBackupEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	conn.WriteJSON(RconExecHandlerRes{
		Event:   rconExecHandlerEvent,
		EventId: message.EventId,
		Success: true,
		Data:    result,
	})
}
