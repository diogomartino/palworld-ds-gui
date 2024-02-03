package rconclient

import (
	"strings"

	"github.com/gorcon/rcon"
)

type RconClient struct {
}

func NewRconClient() *RconClient {
	return &RconClient{}
}

func (r *RconClient) Execute(hostname string, password string, command string) string {
	conn, err := rcon.Dial(hostname, password)
	if err != nil {
		return ""
	}
	defer conn.Close()

	response, err := conn.Execute(command)

	if err != nil {
		return ""
	}

	return strings.TrimSpace(response)
}
