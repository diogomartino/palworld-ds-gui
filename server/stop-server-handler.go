package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type StopServerRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		LaunchParams []string `json:"launchParams"`
	}
}

var stopServerEvent = "STOP_SERVER"

func StopServerHandler(conn *websocket.Conn, data []byte) {
	EmitServerStatus("STOPPING", nil)

	var message StopServerRequest
	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   stopServerEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	err = servermanager.Stop()

	if err != nil {
		utils.Log(err.Error())
		EmitServerStatus("ERROR", nil)
	} else {
		EmitServerStatus("STOPPED", nil)
	}
}
