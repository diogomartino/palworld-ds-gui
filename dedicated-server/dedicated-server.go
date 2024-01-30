package dedicatedserver

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"palword-ds-gui/utils"
	"regexp"
	"strings"
	"time"

	"github.com/mitchellh/go-ps"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type DedicatedServer struct {
	cmd       *exec.Cmd
	serverCmd *exec.Cmd
	serverPid int
}

var ctx context.Context
var currentConsoleId string = "DEDICATED_SERVER"

func NewDedicatedServer() *DedicatedServer {
	return &DedicatedServer{}
}

func Print(message string) {
	utils.PrintEx(ctx, message, currentConsoleId)
}

func (d *DedicatedServer) Init(srcCtx context.Context) {
	ctx = srcCtx
	proc, _ := utils.FindProcessByName(utils.Config.ServerProcessName)

	if proc != nil {
		Print("A server is already running, killing it...")

		err := utils.KillProcessByPid(proc.Pid())

		if err != nil {
			Print("Error stopping server: " + err.Error())
			return
		}

		Print("Server killed successfully")
	}

	if _, err := os.Stat(utils.Config.ServerPath); os.IsNotExist(err) {
		Print("Server directory not found, creating...")
		runtime.EventsEmit(ctx, "SET_LOADING_STATUS", "INSTALLING_SERVER")

		os.Mkdir(utils.Config.ServerPath, 0755)
		d.DownloadDedicatedServer()
	}

	Print("Server is ready")
}

func (d *DedicatedServer) DownloadDedicatedServer() {
	Print("Downloading dedicated server...")

	if d.IsRunning() {
		Print("Cannot update server while it's running. Stopping it...")
		d.Stop()
		return
	}

	cmd := exec.Command(utils.Config.SteamCmdExe,
		"+force_install_dir", utils.Config.ServerPath,
		"+login", "anonymous",
		"+app_update", utils.Config.AppId, "validate",
		"+quit")

	cmd.Dir = utils.Config.SteamCmdPath
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	d.cmd = cmd

	cmd.Run()
}

func (d *DedicatedServer) MonitorServerProcess() {
	for {
		time.Sleep(4 * time.Second)

		// was killed via gui
		if d.serverPid == 0 {
			break
		}

		proc, err := utils.FindProcessByPid(d.serverPid)

		if proc == nil || err != nil {
			Print("Server seems to have stopped (crashed?)")
			runtime.EventsEmit(ctx, "SET_SERVER_STATUS", "STOPPED")
			break
		}
	}
}

func (d *DedicatedServer) Start() {
	Print("Starting dedicated server...")
	runtime.EventsEmit(ctx, "SET_SERVER_STATUS", "STARTING")

	d.serverCmd = exec.Command(utils.Config.ServerExe)
	d.serverCmd.Dir = utils.Config.ServerPath
	d.serverCmd.Stdout = os.Stdout
	d.serverCmd.Stderr = os.Stderr

	err := d.serverCmd.Start()
	if err != nil {
		Print(err.Error())
		runtime.EventsEmit(ctx, "SET_SERVER_STATUS", "ERROR")
		return
	}

	var attempts int = 10
	var proc ps.Process

	whileLoop := true
	for whileLoop {
		time.Sleep(1 * time.Second)

		proc, err = utils.FindProcessByName(utils.Config.ServerProcessName)
		if err != nil {
			continue
		}

		if proc != nil {
			whileLoop = false
		}

		attempts--

		if attempts <= 0 {
			whileLoop = false
		}
	}

	if proc == nil {
		Print("Server process not found")
		runtime.EventsEmit(ctx, "SET_SERVER_STATUS", "ERROR")
		return
	}

	d.serverPid = proc.Pid()

	Print("Server started")
	runtime.EventsEmit(ctx, "SET_SERVER_STATUS", "STARTED")

	go d.MonitorServerProcess()
}

func (d *DedicatedServer) Update() {
	runtime.EventsEmit(ctx, "SET_SERVER_STATUS", "UPDATING")
	d.DownloadDedicatedServer()
	Print("Server updated")
	runtime.EventsEmit(ctx, "SET_SERVER_STATUS", "STOPPED")
}

func (d *DedicatedServer) Stop() {
	if !d.IsRunning() {
		return
	}

	Print("Stopping dedicated server...")
	runtime.EventsEmit(ctx, "SET_SERVER_STATUS", "STOPPING")

	err := utils.KillProcessByPid(d.serverPid)
	if err != nil {
		Print(err.Error())
		runtime.EventsEmit(ctx, "SET_SERVER_STATUS", "ERROR")
		return
	}

	if d.serverCmd != nil && d.serverCmd.Process != nil {
		err := d.serverCmd.Process.Kill()
		if err != nil {
			Print(err.Error())
			runtime.EventsEmit(ctx, "SET_SERVER_STATUS", "ERROR")
			return
		}
	}

	Print("Server stopped")
	runtime.EventsEmit(ctx, "SET_SERVER_STATUS", "STOPPED")
	d.serverPid = 0
}

func (d *DedicatedServer) IsRunning() bool {
	if d.serverPid == 0 {
		return false
	}

	proc, _ := utils.FindProcessByPid(d.serverPid)

	return proc != nil
}

func (d *DedicatedServer) Restart() {
	Print("Restarting dedicated server...")
	runtime.EventsEmit(ctx, "SET_SERVER_STATUS", "RESTARTING")

	d.Stop()
	d.Start()
}

func (d *DedicatedServer) ReadConfig() string {
	configPath := utils.Config.ServerConfigPath

	// If config file doesn't exist yet, use default config
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		configPath = utils.Config.ServerDefaultConfigPath
	}

	configData, err := os.ReadFile(configPath)
	if err != nil {
		panic(err)
	}

	configString := strings.TrimSpace(string(configData))
	isEmpty := len(configString) == 0

	// if the config file is empty, use default config
	if isEmpty {
		configData, err := os.ReadFile(utils.Config.ServerDefaultConfigPath)

		if err != nil {
			panic(err)
		}

		return strings.TrimSpace(string(configData))
	}

	return configString
}

func (d *DedicatedServer) WriteConfig(configString string) {
	if _, err := os.Stat(utils.Config.ServerConfigDir); os.IsNotExist(err) {
		os.MkdirAll(utils.Config.ServerConfigDir, 0755)
	}

	if _, err := os.Stat(utils.Config.ServerConfigPath); os.IsNotExist(err) {

		_, err := os.Create(utils.Config.ServerConfigPath)
		if err != nil {
			panic(err)
		}
	}

	err := os.WriteFile(utils.Config.ServerConfigPath, []byte(configString), 0644)
	if err != nil {
		panic(err)
	}
}

func (d *DedicatedServer) ReadSaveName() string {
	// If file doesn't exist yet, return empty string (user hasn't joined the server for the first time yet)
	if _, err := os.Stat(utils.Config.ServerGameUserSettingsPath); os.IsNotExist(err) {
		return ""
	}

	settingsData, err := os.ReadFile(utils.Config.ServerGameUserSettingsPath)
	if err != nil {
		panic(err)
	}

	settingsString := strings.TrimSpace(string(settingsData))
	re := regexp.MustCompile(`DedicatedServerName=([^\s]+)`)
	match := re.FindStringSubmatch(settingsString)

	if len(match) == 2 {
		return match[1]
	}

	return ""
}

func (d *DedicatedServer) WriteSaveName(newSaveName string) error {
	settingsData, err := os.ReadFile(utils.Config.ServerGameUserSettingsPath)
	if err != nil {
		return err
	}

	settingsString := strings.TrimSpace(string(settingsData))
	re := regexp.MustCompile(`DedicatedServerName=([^\s]+)`)
	settingsString = re.ReplaceAllString(settingsString, fmt.Sprintf("DedicatedServerName=%s", newSaveName))

	err = os.WriteFile(utils.Config.ServerGameUserSettingsPath, []byte(settingsString), os.ModePerm)
	if err != nil {
		return err
	}

	return nil
}

func (d *DedicatedServer) Dispose() {
	if d.cmd != nil && d.cmd.Process != nil {
		err := d.cmd.Process.Kill()
		if err != nil {
			Print(err.Error())
		}
	}

	d.Stop()
	utils.LogToFile("dedicated-server.go: Dispose()")
}
