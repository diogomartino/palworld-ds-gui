package main

import (
	"encoding/json"
	"fmt"
	"palworld-ds-gui-server/utils"
	"sync"
	"time"

	"github.com/gocolly/colly/v2"
	"github.com/gorilla/websocket"
)

type GetSteamAvatarRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		SteamId64 string `json:"steamID64"`
	}
}

type CacheEntry struct {
	AvatarURL string
	Expires   time.Time
}

var avatarCache = make(map[string]CacheEntry)
var cacheMutex = &sync.Mutex{}

var getSteamAvatarEvent = "GET_STEAM_AVATAR"

func GetSteamAvatarHandler(conn *websocket.Conn, data []byte) {
	var message GetSteamAvatarRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   getSteamAvatarEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	imageUrl, err := GetSteamProfileAvatar(message.Data.SteamId64)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   getSteamAvatarEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	conn.WriteJSON(SimpleResponse{
		BaseResponse: BaseResponse{
			Event:   getSteamAvatarEvent,
			EventId: message.EventId,
			Success: true,
		},
		Data: imageUrl,
	})
}

func GetSteamProfileAvatar(steamid string) (string, error) {
	cacheMutex.Lock()
	if entry, found := avatarCache[steamid]; found {
		if time.Now().Before(entry.Expires) {
			cacheMutex.Unlock()
			return entry.AvatarURL, nil
		}
	}
	cacheMutex.Unlock()

	profileURL := fmt.Sprintf("https://steamcommunity.com/profiles/%s", steamid)
	c := colly.NewCollector()

	var (
		profileImageURL string
		wg              sync.WaitGroup
	)

	wg.Add(1)

	c.OnHTML(".playerAvatarAutoSizeInner > img", func(e *colly.HTMLElement) {
		profileImageURL = e.Attr("src")
		wg.Done()
	})

	err := c.Visit(profileURL)
	if err != nil {
		return "", err
	}

	wg.Wait()

	cacheMutex.Lock()
	avatarCache[steamid] = CacheEntry{
		AvatarURL: profileImageURL,
		Expires:   time.Now().Add(time.Hour),
	}
	cacheMutex.Unlock()

	return profileImageURL, nil
}
