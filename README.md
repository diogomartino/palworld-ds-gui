# Palworld Dedicated Server GUI

This is a GUI for the Palworld Dedicated Server. Configure and manage your server visually. Only Windows is supported at the moment.

## Download

You can downloads the latest versions from the [releases page](https://github.com/diogomartino/palworld-ds-gui/releases).

[WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) is required. You most likely already have it installed, so you don't need to worry.

> [!WARNING]  
> Be aware that this software is still in early development and may contain bugs. Please report any issues you find.

[Quick Start Guide](HOW_TO_USE.md)

## Screenshots

![Connecting](https://i.imgur.com/e5rSvBE.png)
![Home](https://i.imgur.com/157panY.png)
![Settings](https://i.imgur.com/gu0x0PS.png)
![Admin](https://i.imgur.com/49giAIK.png)
![Backups](https://i.imgur.com/3IboT0o.png)

## Developmen

### Requirements

- [Go](https://go.dev/)
- [Wails](https://wails.io/)
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

```
wails dev -s
```

## Building

```
wails build --clean --platform windows/amd64
```

## Contributing

Feel free to contribute to this project by opening issues or pull requests. Please follow the code style of the project.
