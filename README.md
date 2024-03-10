# Palworld Dedicated Server GUI

This is a GUI for the Palworld Dedicated Server. Configure and manage your remote/local server visually. Control your server from anywhere with the web interface.

## [How To Use - Click here](HOW_TO_USE.md)

## Web Interface

You can either download the Windows app or use the web interface at:

### [https://app.palgui.com/](https://app.palgui.com/)

## Download

You can downloads the latest versions from the [releases page](https://github.com/diogomartino/palworld-ds-gui/releases).

[WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) is required. You most likely already have it installed, so you don't need to worry.

> [!WARNING]  
> Be aware that this software is still in early development and may contain bugs. Please report any issues you find.

## Screenshots

![Connecting](https://i.imgur.com/e5rSvBE.png)
![Home](https://i.imgur.com/157panY.png)
![Settings](https://i.imgur.com/gu0x0PS.png)
![Admin](https://i.imgur.com/49giAIK.png)
![Backups](https://i.imgur.com/3IboT0o.png)

## Development

### Requirements

- [Go](https://go.dev/)
- [Wails](https://wails.io/)
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

In `./app` run `wails dev -s` to start the app.

## Building the app

Navigate to `./app` and run `wails build --clean --platform windows/amd64`.

## Building the server

Navigate to `./server` and run `go build -o server.exe`.

## Contributing

Feel free to contribute to this project by opening issues or pull requests. Please follow the code style of the project.
