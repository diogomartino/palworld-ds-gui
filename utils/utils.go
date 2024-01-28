package utils

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/mitchellh/go-ps"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type ConsoleEntry struct {
	Message   string
	Timestamp int64
	MsgType   string
}

type AppConfig struct {
	SteamCmdPath            string
	SteamCmdUrl             string
	SteamCmdExe             string
	ServerPath              string
	ServerExe               string
	ServerDefaultConfigPath string
	ServerConfigDir         string
	ServerConfigPath        string
	ServerProcessName       string
	AppId                   string
}

var Config AppConfig = AppConfig{
	SteamCmdPath:            filepath.Join(GetCurrentDir(), "steamcmd"),
	SteamCmdExe:             filepath.Join(GetCurrentDir(), "steamcmd", "steamcmd.exe"),
	ServerPath:              filepath.Join(GetCurrentDir(), "server"),
	ServerExe:               filepath.Join(GetCurrentDir(), "server", "PalServer.exe"),
	ServerDefaultConfigPath: filepath.Join(GetCurrentDir(), "server", "DefaultPalWorldSettings.ini"),
	ServerConfigDir:         filepath.Join(GetCurrentDir(), "server", "Pal", "Saved", "Config", "WindowsServer"),
	ServerConfigPath:        filepath.Join(GetCurrentDir(), "server", "Pal", "Saved", "Config", "WindowsServer", "PalWorldSettings.ini"),
	ServerProcessName:       "PalServer-Win64-Test-Cmd.exe",
	SteamCmdUrl:             "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip",
	AppId:                   "2394010",
}

func GetCurrentDir() string {
	ex, err := os.Executable()

	if err != nil {
		panic(err)
	}

	dir := filepath.Dir(ex)

	return dir
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

func PrintEx(ctx context.Context, message string, consoleId string) {
	consoleEntry := ConsoleEntry{
		Message:   message,
		Timestamp: time.Now().Unix(),
		MsgType:   "stdout",
	}

	runtime.EventsEmit(ctx, "ADD_CONSOLE_ENTRY", consoleId, consoleEntry)
	println(message)
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
