package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type ClientInitRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		NewSaveName string `json:"saveName"`
	}
}

type ClientInitResData struct {
	CurrentServerStatus string `json:"currentServerStatus"`
	CurrentLaunchParams string `json:"currentLaunchParams"`
}

type ClientInitRes struct {
	Event   string            `json:"event"`
	EventId string            `json:"eventId"`
	Success bool              `json:"success"`
	Error   string            `json:"error"`
	Data    ClientInitResData `json:"data"`
}

var clientInitEvent = "INIT"

func ClientInitHandler(conn *websocket.Conn, data []byte) {
	var message ClientInitRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(ClientInitRes{
			Event:   clientInitEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	serverRunning := servermanager.IsRunning()
	currentState := "STOPPED"
	if serverRunning {
		currentState = "STARTED"
	}

	conn.WriteJSON(ClientInitRes{
		Event:   clientInitEvent,
		EventId: message.EventId,
		Success: true,
		Data:    ClientInitResData{CurrentServerStatus: currentState, CurrentLaunchParams: utils.Settings.General.LaunchParams},
	})

	// TODO: might be a good idea to send all the needed state to the client (config, backup settings, save name, etc.) instead of making multiple requests
}
