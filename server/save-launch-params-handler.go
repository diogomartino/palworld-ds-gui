package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var saveLaunchParamsEvent = "SAVE_LAUNCH_PARAMS"

func SaveLaunchParamsHandler(conn *websocket.Conn, data []byte) {
	var message SaveLaunchParamsRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   saveLaunchParamsEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	utils.Settings.General.LaunchParams = message.Data.LaunchParams

	err = utils.SaveSettings()
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   saveLaunchParamsEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	// this response is just to flag the client that the write was successful
	// the emit below will send the new save name to all clients
	conn.WriteJSON(BaseResponse{
		Event:   saveLaunchParamsEvent,
		EventId: message.EventId,
		Success: true,
	})

	EmitLaunchParams(nil)
}
