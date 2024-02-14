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
}

var Config AppConfig = AppConfig{
	SteamCmdPath:               filepath.Join(GetCurrentDir(), "steamcmd"),
	SteamCmdExe:                filepath.Join(GetCurrentDir(), "steamcmd", "steamcmd.exe"),
	ServerPath:                 filepath.Join(GetCurrentDir(), "server"),
	ServerExe:                  filepath.Join(GetCurrentDir(), "server", "PalServer.exe"),
	ServerDefaultConfigPath:    filepath.Join(GetCurrentDir(), "server", "DefaultPalWorldSettings.ini"),
	ServerConfigDir:            filepath.Join(GetCurrentDir(), "server", "Pal", "Saved", "Config", "WindowsServer"),
	ServerConfigPath:           filepath.Join(GetCurrentDir(), "server", "Pal", "Saved", "Config", "WindowsServer", "PalWorldSettings.ini"),
	ServerGameUserSettingsPath: filepath.Join(GetCurrentDir(), "server", "Pal", "Saved", "Config", "WindowsServer", "GameUserSettings.ini"),
	ServerSaveDir:              filepath.Join(GetCurrentDir(), "server", "Pal", "Saved", "SaveGames", "0"),
	LogsPath:                   filepath.Join(GetCurrentDir(), "logs.txt"),
	ServerProcessName:          "PalServer-Win64-Test-Cmd.exe",
	BackupsPath:                filepath.Join(GetCurrentDir(), "backups"),
	PersistedSettingsPath:      filepath.Join(GetCurrentDir(), "gui-server-settings.ini"),
	SteamCmdUrl:                "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip",
	AppId:                      "2394010",
}

type PersistedSettingsBackup struct {
	Enabled   bool    `ini:"enabled"`
	Interval  float32 `ini:"interval"`
	KeepCount int     `ini:"keepCount"`
}

type PersistedSettingsGeneral struct {
	APIKey       string `ini:"apiKey"`
	LaunchParams string `ini:"launchParams"`
}

type PersistedSettings struct {
	General PersistedSettingsGeneral
	Backup  PersistedSettingsBackup
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
}

type LaunchParams struct {
	ForceNewKey bool
	ShowKey     bool
	Help        bool
	Port        int
}

var Launch LaunchParams = LaunchParams{
	ForceNewKey: false,
	ShowKey:     false,
	Help:        false,
	Port:        21577,
}

var EmitConsoleLog func(message string, excludeClient *websocket.Conn)

func Init() {
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

	SaveSettings()

	flag.BoolVar(&Launch.ForceNewKey, "newkey", false, "Generate a new API key")
	flag.BoolVar(&Launch.ShowKey, "showkey", false, "Show the current API key")
	flag.BoolVar(&Launch.Help, "help", false, "Show help")
	flag.IntVar(&Launch.Port, "port", 21577, "Port to run the server on")

	flag.Parse()
}

func LoadSettings() error {
	cfg, err := ini.Load(Config.PersistedSettingsPath)
	if err != nil {
		return fmt.Errorf("failed to read file: %v", err)
	}

	if err = cfg.Section("General").MapTo(&Settings.General); err != nil {
		return fmt.Errorf("failed to map General section: %v", err)
	}
	if err = cfg.Section("Backup").MapTo(&Settings.Backup); err != nil {
		return fmt.Errorf("failed to map Backup section: %v", err)
	}

	return nil
}

func SaveSettings() error {
	cfg := ini.Empty()

	if err := cfg.Section("General").ReflectFrom(&Settings.General); err != nil {
		return fmt.Errorf("failed to reflect General section: %v", err)
	}
	if err := cfg.Section("Backup").ReflectFrom(&Settings.Backup); err != nil {
		return fmt.Errorf("failed to reflect Backup section: %v", err)
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
