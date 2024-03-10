package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"palworld-ds-gui-server/utils"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}
	clients = make(map[*websocket.Conn]bool)
	mutex   = &sync.Mutex{}
)

type BaseRequest struct {
	Event string `json:"event"`
}

type BaseResponse struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Data    string `json:"data"`
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	authToken := r.URL.Query().Get("auth")

	if authToken != utils.Settings.General.APIKey {
		utils.Log(fmt.Sprintf("Unauthorized connection attempt from %s", r.RemoteAddr))
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		utils.LogToFile(err.Error(), true)
		return
	}

	mutex.Lock()
	clients[conn] = true
	mutex.Unlock()

	defer func() {
		mutex.Lock()
		delete(clients, conn)
		mutex.Unlock()
		conn.Close()
		utils.Log(fmt.Sprintf("%s disconnected from the GUI server", conn.RemoteAddr().String()))
	}()

	utils.Log(fmt.Sprintf("%s connected to the GUI server", conn.RemoteAddr().String()))

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			utils.LogToFile(err.Error(), true)
			break
		}

		if messageType != websocket.TextMessage {
			utils.LogToFile("Received non-text message", true)
			continue
		}

		var message BaseRequest
		err = json.Unmarshal(p, &message)
		if err != nil {
			utils.LogToFile(err.Error(), true)
			continue
		}

		switch message.Event {
		case startServerEvent:
			StartServerHandler(conn, p)
		case stopServerEvent:
			StopServerHandler(conn, p)
		case restartServerEvent:
			RestartServerHandler(conn, p)
		case readConfigEvent:
			ReadConfigHandler(conn, p)
		case readSaveEvent:
			ReadSaveHandler(conn, p)
		case writeSaveEvent:
			WriteSaveHandler(conn, p)
		case writeConfigEvent:
			WriteConfigHandler(conn, p)
		case clientInitEvent:
			ClientInitHandler(conn, p)
		case updateServerEvent:
			UpdateServerHandler(conn, p)
		case startBackupsEvent:
			StartBackupsHandler(conn, p)
		case stopBackupsEvent:
			StopBackupsHandler(conn, p)
		case createBackupEvent:
			CreateBackupHandler(conn, p)
		case getBackupsEvent:
			GetBackupsHandler(conn, p)
		case deleteBackupEvent:
			DeleteBackupHandler(conn, p)
		case restoreBackupEvent:
			RestoreBackupHandler(conn, p)
		case getBackupsConfigEvent:
			GetBackupsConfigHandler(conn, p)
		case saveLaunchParamsEvent:
			SaveLaunchParamsHandler(conn, p)
		case getSteamAvatarEvent:
			GetSteamAvatarHandler(conn, p)
		case rconExecHandlerEvent:
			RconExecHandlerHandler(conn, p)
		case saveAdditionalSettingsEvent:
			SaveAdditionalSettingsHandler(conn, p)
		default:
			utils.LogToFile(fmt.Sprintf("Unknown event: %s", message.Event), true)
		}
	}
}

func BroadcastJSON(v interface{}, exclude *websocket.Conn) {
	mutex.Lock()
	defer mutex.Unlock()
	for client := range clients {
		if client == exclude {
			continue
		}

		err := client.WriteJSON(v)
		if err != nil {
			utils.Log(err.Error())
			client.Close()
			delete(clients, client)
		}
	}
}

func EmitServerStatus(status string, exclude *websocket.Conn) {
	BroadcastJSON(BaseResponse{
		Event:   "SERVER_STATUS_CHANGED",
		Data:    status,
		Success: true,
	}, exclude)
}

func EmitServerConfig(config string, exclude *websocket.Conn) {
	BroadcastJSON(BaseResponse{
		Event:   "SERVER_CONFIG_CHANGED",
		Success: true,
		Data:    config,
	}, exclude)
}

func EmitBackupSettings(exclude *websocket.Conn) {
	type BackupSettingsResponse struct {
		Event   string                        `json:"event"`
		Success bool                          `json:"success"`
		Data    utils.PersistedSettingsBackup `json:"data"`
	}

	BroadcastJSON(BackupSettingsResponse{
		Event:   "BACKUP_SETTINGS_CHANGED",
		Success: true,
		Data:    utils.Settings.Backup,
	}, exclude)
}

func EmitAdditionalSettings(exclude *websocket.Conn) {

	type TimedRestartSettingsResponse struct {
		Event   string             `json:"event"`
		Success bool               `json:"success"`
		Data    AdditionalSettings `json:"data"`
	}

	BroadcastJSON(TimedRestartSettingsResponse{
		Event:   "ADDITIONAL_SETTINGS_CHANGED",
		Success: true,
		Data:    AdditionalSettings{utils.Settings.TimedRestart, utils.Settings.RestartOnCrash},
	}, exclude)
}

func EmitSaveName(name string, exclude *websocket.Conn) {
	BroadcastJSON(BaseResponse{
		Event:   "SERVER_SAVE_NAME_CHANGED",
		Data:    name,
		Success: true,
	}, exclude)
}

func EmitLaunchParams(exclude *websocket.Conn) {
	BroadcastJSON(BaseResponse{
		Event:   "SERVER_SAVE_NAME_CHANGED",
		Data:    utils.Settings.General.LaunchParams,
		Success: true,
	}, exclude)
}

func LogToClient(message string, conn *websocket.Conn) {
	BroadcastJSON(BaseResponse{
		Event:   "ADD_CONSOLE_ENTRY",
		Data:    strings.TrimSpace(message),
		Success: true,
	}, conn)
}
