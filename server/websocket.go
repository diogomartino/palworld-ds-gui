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
	clients       = make(map[*websocket.Conn]bool)
	mutex         = &sync.Mutex{}
	eventHandlers = map[string]func(*websocket.Conn, []byte){
		startServerEvent:            StartServerHandler,
		stopServerEvent:             StopServerHandler,
		restartServerEvent:          RestartServerHandler,
		readConfigEvent:             ReadConfigHandler,
		readSaveEvent:               ReadSaveHandler,
		writeSaveEvent:              WriteSaveHandler,
		writeConfigEvent:            WriteConfigHandler,
		clientInitEvent:             ClientInitHandler,
		updateServerEvent:           UpdateServerHandler,
		startBackupsEvent:           StartBackupsHandler,
		stopBackupsEvent:            StopBackupsHandler,
		createBackupEvent:           CreateBackupHandler,
		getBackupsEvent:             GetBackupsHandler,
		deleteBackupEvent:           DeleteBackupHandler,
		restoreBackupEvent:          RestoreBackupHandler,
		getBackupsConfigEvent:       GetBackupsConfigHandler,
		saveLaunchParamsEvent:       SaveLaunchParamsHandler,
		getSteamAvatarEvent:         GetSteamAvatarHandler,
		rconExecHandlerEvent:        RconExecHandlerHandler,
		saveAdditionalSettingsEvent: SaveAdditionalSettingsHandler,
	}
)

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

		if handler, ok := eventHandlers[message.Event]; ok {
			handler(conn, p)
		} else {
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
	BroadcastJSON(SimpleResponse{
		BaseResponse: BaseResponse{
			Event:   "SERVER_STATUS_CHANGED",
			Success: true,
		},
		Data: status,
	}, exclude)
}

func EmitServerConfig(config string, exclude *websocket.Conn) {
	BroadcastJSON(SimpleResponse{
		BaseResponse: BaseResponse{
			Event:   "SERVER_CONFIG_CHANGED",
			Success: true,
		},
		Data: config,
	}, exclude)
}

func EmitBackupSettings(exclude *websocket.Conn) {
	BroadcastJSON(BackupSettingsResponse{
		BaseResponse: BaseResponse{
			Event:   "BACKUP_SETTINGS_CHANGED",
			Success: true,
		},
		Data: utils.Settings.Backup,
	}, exclude)
}

func EmitAdditionalSettings(exclude *websocket.Conn) {
	BroadcastJSON(TimedRestartSettingsResponse{
		BaseResponse: BaseResponse{
			Event:   "ADDITIONAL_SETTINGS_CHANGED",
			Success: true,
		},
		Data: AdditionalSettings{utils.Settings.TimedRestart, utils.Settings.RestartOnCrash},
	}, exclude)
}

func EmitSaveName(name string, exclude *websocket.Conn) {
	BroadcastJSON(SimpleResponse{
		BaseResponse: BaseResponse{
			Event:   "SERVER_SAVE_NAME_CHANGED",
			Success: true,
		},
		Data: name,
	}, exclude)
}

func EmitLaunchParams(exclude *websocket.Conn) {
	BroadcastJSON(SimpleResponse{
		BaseResponse: BaseResponse{
			Event:   "LAUNCH_PARAMS_CHANGED",
			Success: true,
		},
		Data: utils.Settings.General.LaunchParams,
	}, exclude)
}

func LogToClient(message string, conn *websocket.Conn) {
	BroadcastJSON(SimpleResponse{
		BaseResponse: BaseResponse{
			Event:   "ADD_CONSOLE_ENTRY",
			Success: true,
		},
		Data: strings.TrimSpace(message),
	}, conn)
}
