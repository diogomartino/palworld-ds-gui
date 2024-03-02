package main

import (
	"strings"

	"github.com/gorcon/rcon"
)

type RconClient struct {
}

func NewRconClient() *RconClient {
	return &RconClient{}
}

func (r *RconClient) Init() {
	// nothing to do here yet
}

func (r *RconClient) Execute(hostname string, password string, command string) (string, error) {
	conn, err := rcon.Dial(hostname, password)
	if err != nil {
		return "", err
	}
	defer conn.Close()

	response, err := conn.Execute(command)

	if err != nil {
		return "", err
	}

	conn.Close()

	return strings.TrimSpace(response), nil
}
