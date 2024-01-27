# Palworld Dedicated Server GUI

This is a GUI for the Palworld Dedicated Server. Configure and manage your server visually. Only Windows is supported at the moment.

## Download

You can download the latest version from the [releases page](https://github.com/diogomartino/palworld-ds-gui/releases).

[WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) is required. You most likely already have it installed, so you don't need to worry.

## Screenshots

![Screenshot 1](https://i.imgur.com/hDWhGFq.png)
![Screenshot 2](https://i.imgur.com/cKq0HO0.png)

## Instructions

1. Open the app
2. Wait for the dedicated server to be downloaded from Steam
3. Configure your server
4. Hit the "Start" button

The default settings are the official settings. You can change them to your liking.

## Development

### Future plans

- Add support for Linux and macOS
- Create RCON management interface
- Automated backups (both local and remote)
- Automatic server updates
- Multiple map management
- User profiles management
- Automated imports of local worlds

### Requirements

- [Go](https://go.dev/)
- [Wails](https://wails.io/)
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

```
wails dev
```

This will launch the application in development mode. The interface will also run on http://localhost:34115 in case you want to run it in a browser.

You might also want to open `wails.json` and remove the `frontend:build` so typescript does not prevent the app from compiling.

## Building

```
wails build --clean --platform windows/amd64
```

## Contributing

Feel free to contribute to this project by opening issues or pull requests. Please follow the code style of the project.
