package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"palworld-ds-gui-server/utils"
)

type Api struct {
}

func NewApi() *Api {
	return &Api{}
}

func PrintApiKey() {
	fmt.Printf("\n\n🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\n")
	fmt.Printf("Anyone with your API key can control your server. Keep it secret!\n")
	fmt.Printf("Your current API key is: %s\n", utils.Settings.General.APIKey)
	fmt.Printf("To generate a new API key, run the program with the --newkey flag\n")
	fmt.Printf("🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\n\n")
}

func (a *Api) Init() {
	if !HasApiKey() || utils.Launch.ForceNewKey {
		GenerateApiKey()
	}

	if utils.Launch.ShowKey {
		PrintApiKey()
	}

	internalIp := utils.GetOutboundIP()
	externalIp, err := utils.GetExternalIPv4()
	if err != nil {
		utils.LogToFile("Failed to get external IP: "+err.Error(), true)
		fmt.Printf("Server is running on %s:%d\n", internalIp, utils.Launch.Port)
	} else {
		fmt.Printf("Server is running on %s:%d (Local IP: %s:%d)\n", externalIp, utils.Launch.Port, internalIp, utils.Launch.Port)
	}

	utils.EmitConsoleLog = LogToClient

	http.HandleFunc("/ws", handleWebSocket)
	http.ListenAndServe(fmt.Sprintf(":%d", utils.Launch.Port), nil)
}

func GenerateApiKey() {
	randomBytes := make([]byte, 32)
	rand.Read(randomBytes)
	hasher := sha256.New()
	hasher.Write(randomBytes)
	hash := hasher.Sum(nil)
	stringHash := hex.EncodeToString(hash)

	utils.Settings.General.APIKey = stringHash
	err := utils.SaveSettings()
	if err != nil {
		panic(err)
	}

	PrintApiKey()
}

func HasApiKey() bool {
	if utils.Settings.General.APIKey == "" || utils.Settings.General.APIKey == "CHANGE_ME" {
		return false
	}

	return true
}
