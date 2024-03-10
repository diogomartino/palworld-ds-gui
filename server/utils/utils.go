package utils

import (
	"flag"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/mitchellh/go-ps"
	"github.com/tidwall/gjson"
	"gopkg.in/ini.v1"
)

type AppConfig struct {
	SteamCmdPath               string
	SteamCmdUrl                string
	SteamCmdExe                string
	ServerPath                 string
	ServerExe                  string
	ServerDefaultConfigPath    string
	ServerConfigDir            string
	ServerConfigPath           string
	ServerGameUserSettingsPath string
	ServerSaveDir              string
	ServerProcessName          string
	BackupsPath                string
	LogsPath                   string
	PersistedSettingsPath      string
	AppId                      string
	ServerVersion              string
}

var Config AppConfig = AppConfig{
	AppId:         "2394010",
	ServerVersion: "", // Will be read from server JSON on init
	// Configs below are OS specific and will be set on init
	SteamCmdPath:               "",
	SteamCmdExe:                "",
	ServerPath:                 "",
	ServerExe:                  "",
	ServerDefaultConfigPath:    "",
	ServerConfigDir:            "",
	ServerConfigPath:           "",
	ServerGameUserSettingsPath: "",
	ServerSaveDir:              "",
	LogsPath:                   "",
	ServerProcessName:          "",
	BackupsPath:                "",
	PersistedSettingsPath:      "",
	SteamCmdUrl:                "",
}

type PersistedSettingsBackup struct {
	Enabled   bool    `ini:"enabled"`
	Interval  float32 `ini:"interval"`
	KeepCount int     `ini:"keepCount"`
}

type PersistedTimedRestart struct {
	Enabled  bool    `ini:"enabled"`
	Interval float32 `ini:"interval"`
}

type PersistedRestartOnCrash struct {
	Enabled bool `ini:"enabled"`
}

type PersistedSettingsGeneral struct {
	APIKey       string `ini:"apiKey"`
	LaunchParams string `ini:"launchParams"`
}

type PersistedSettings struct {
	General        PersistedSettingsGeneral
	Backup         PersistedSettingsBackup
	TimedRestart   PersistedTimedRestart
	RestartOnCrash PersistedRestartOnCrash
}

var Settings PersistedSettings = PersistedSettings{
	General: PersistedSettingsGeneral{
		APIKey:       "CHANGE_ME",
		LaunchParams: "-useperfthreads -NoAsyncLoadingThread -UseMultithreadForDS",
	},
	Backup: PersistedSettingsBackup{
		Enabled:   false,
		Interval:  1,
		KeepCount: 24,
	},
	TimedRestart: PersistedTimedRestart{
		Enabled:  false,
		Interval: 4,
	},
	RestartOnCrash: PersistedRestartOnCrash{
		Enabled: false,
	},
}

type LaunchParams struct {
	ForceNewKey bool
	ShowKey     bool
	Help        bool
	Port        int
	ServerPath  string
}

var Launch LaunchParams = LaunchParams{
	ForceNewKey: false,
	ShowKey:     false,
	Help:        false,
	Port:        21577,
	ServerPath:  "server",
}

var EmitConsoleLog func(message string, excludeClient *websocket.Conn)

func Init(serverJSON string) {
	Config.ServerVersion = gjson.Get(serverJSON, "productVersion").String()

	flag.BoolVar(&Launch.ForceNewKey, "newkey", false, "Generate a new API key")
	flag.BoolVar(&Launch.ShowKey, "showkey", false, "Show the current API key")
	flag.BoolVar(&Launch.Help, "help", false, "Show help")
	flag.IntVar(&Launch.Port, "port", 21577, "Port to run the server on")
	flag.StringVar(&Launch.ServerPath, "serverpath", "server", "Palworld Dedicated Server path (relative to the executable)")

	flag.Parse()

	InitWindowsConfigs()

	logsFile, logErr := os.OpenFile(Config.LogsPath, os.O_RDWR|os.O_CREATE, 0666)
	if logErr != nil {
		panic(logErr)
	}
	defer logsFile.Close()

	settingsFile, settingsErr := os.OpenFile(Config.PersistedSettingsPath, os.O_RDWR|os.O_CREATE, 0666)
	if settingsErr != nil {
		panic(settingsErr)
	}
	defer settingsFile.Close()

	err := LoadSettings()
	if err != nil {
		panic(err)
	}

	LogToFile("utils.go: Init() - Palword Dedicated Server GUI v"+Config.ServerVersion, false)
}

func InitWindowsConfigs() {
	Config.SteamCmdPath = filepath.Join(GetCurrentDir(), "steamcmd")
	Config.SteamCmdExe = filepath.Join(GetCurrentDir(), "steamcmd", "steamcmd.exe")
	Config.ServerPath = filepath.Join(GetCurrentDir(), Launch.ServerPath)
	Config.ServerExe = filepath.Join(GetCurrentDir(), Launch.ServerPath, "PalServer.exe")
	Config.ServerDefaultConfigPath = filepath.Join(GetCurrentDir(), Launch.ServerPath, "DefaultPalWorldSettings.ini")
	Config.ServerConfigDir = filepath.Join(GetCurrentDir(), Launch.ServerPath, "Pal", "Saved", "Config", "WindowsServer")
	Config.ServerConfigPath = filepath.Join(GetCurrentDir(), Launch.ServerPath, "Pal", "Saved", "Config", "WindowsServer", "PalWorldSettings.ini")
	Config.ServerGameUserSettingsPath = filepath.Join(GetCurrentDir(), Launch.ServerPath, "Pal", "Saved", "Config", "WindowsServer", "GameUserSettings.ini")
	Config.ServerSaveDir = filepath.Join(GetCurrentDir(), Launch.ServerPath, "Pal", "Saved", "SaveGames", "0")
	Config.LogsPath = filepath.Join(GetCurrentDir(), "logs.txt")
	Config.ServerProcessName = "PalServer-Win64-Test-Cmd.exe"
	Config.BackupsPath = filepath.Join(GetCurrentDir(), "backups")
	Config.PersistedSettingsPath = filepath.Join(GetCurrentDir(), "gui-server-settings.ini")
	Config.SteamCmdUrl = "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip"
}

var sections = map[string]interface{}{
	"General":        &Settings.General,
	"Backup":         &Settings.Backup,
	"TimedRestart":   &Settings.TimedRestart,
	"RestartOnCrash": &Settings.RestartOnCrash,
}

func LoadSettings() error {
	cfg, err := ini.Load(Config.PersistedSettingsPath)
	if err != nil {
		return fmt.Errorf("failed to read file: %v", err)
	}

	for section, settings := range sections {
		if err = cfg.Section(section).MapTo(settings); err != nil {
			return fmt.Errorf("failed to map %s section: %v", section, err)
		}
	}

	return nil
}

func SaveSettings() error {
	cfg := ini.Empty()

	for section, settings := range sections {
		if err := cfg.Section(section).ReflectFrom(settings); err != nil {
			return fmt.Errorf("failed to reflect %s section: %v", section, err)
		}
	}

	if err := cfg.SaveTo(Config.PersistedSettingsPath); err != nil {
		return fmt.Errorf("failed to save file: %v", err)
	}

	return nil
}

func GetCurrentDir() string {
	ex, err := os.Executable()

	if err != nil {
		panic(err)
	}

	dir := filepath.Dir(ex)

	return dir
}

func LogToFile(message string, print bool) {
	if print {
		println(message)
	}

	logsFile, err := os.OpenFile(Config.LogsPath, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		panic(err)
	}

	defer logsFile.Close()

	formatedMessage := fmt.Sprintf("[%s] %s", time.Now().Format("02-01-2006 15:04:05"), message)

	logsFile.WriteString(formatedMessage + "\n")
}

func Log(message string) {
	LogToFile(message, true)

	if EmitConsoleLog != nil {
		EmitConsoleLog(message, nil)
	}
}

func DownloadFile(url string, path string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	out, err := os.Create(path)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	return err
}

func FindProcessByName(processName string) (ps.Process, error) {
	processes, err := ps.Processes()
	if err != nil {
		return nil, fmt.Errorf("error listing processes: %v", err)
	}

	for _, process := range processes {
		if strings.Contains(process.Executable(), processName) {
			return process, nil
		}
	}

	return nil, fmt.Errorf("process with name %s not found", processName)
}

func KillProcessByPid(pid int) error {
	process, err := os.FindProcess(pid)
	if err != nil {
		return err
	}

	err = process.Kill()
	if err != nil {
		return err
	}

	return nil
}

func FindProcessByPid(pid int) (ps.Process, error) {
	processes, err := ps.Processes()
	if err != nil {
		return nil, fmt.Errorf("error listing processes: %v", err)
	}

	for _, process := range processes {
		if process.Pid() == pid {
			return process, nil
		}
	}

	return nil, fmt.Errorf("process with pid %d not found", pid)
}

func GetOutboundIP() net.IP {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		return nil
	}
	defer conn.Close()

	localAddr := conn.LocalAddr().(*net.UDPAddr)

	return localAddr.IP
}

func GetExternalIPv4() (string, error) {
	resp, err := http.Get("https://text.ipv4.wtfismyip.com/")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	ipBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return strings.TrimSpace(string(ipBytes)), nil
}

func OpenExplorerWithFile(folderPath, fileName string) error {
	cmd := exec.Command("explorer", "/select,", fileName)
	cmd.Dir = folderPath

	err := cmd.Run()
	if err != nil {
		return err
	}

	return nil
}
