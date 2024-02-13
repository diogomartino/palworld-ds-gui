package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type UpdateServerRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		LaunchParams []string `json:"launchParams"`
	}
}

type UpdateServerRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

var updateServerEvent = "UPDATE_SERVER"

func UpdateServerHandler(conn *websocket.Conn, data []byte) {
	EmitServerStatus("UPDATING", nil)

	var message UpdateServerRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(UpdateServerRes{
			Event:   updateServerEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	err = servermanager.Update()
	if err != nil {
		utils.Log("Error updating the server: " + err.Error())
		EmitServerStatus("STOPPED", nil)
		return
	}

	EmitServerStatus("STOPPED", nil)
}
