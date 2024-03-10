## Quick Start Guide

1. Download the **GUI Server** `PalworldDSGUI_Server.exe` from the [releases page](https://github.com/diogomartino/palworld-ds-gui/releases).
2. Place the executable in a folder of your choice.
3. Run the executable.
4. Wait until the server is downloaded from the Steam servers.
5. An API key will be shown on the console. Save it, you will need it to connect to the server.
6. Download the **GUI Client** `PalworldDSGui.exe` from the [releases page](https://github.com/diogomartino/palworld-ds-gui/releases) OR use the web version at [https://app.palgui.com/](https://app.palgui.com/).
7. Open the client and use the API key to connect to the server.

## Remote Server

If you want to run the server on a remote machine (eg: a VPS), the steps are the same as above, you just need to download and execute the server on the remote machine, and then use the client to connect to it. You may need to open the port **21577** on the remote machine to be able to access it from the client.

## Using an existing server

If you already have a Palworld server, you can still use this tool, you just need to make sure that the folder structure is correct, which should look like this:

```plaintext
SomeRandomFolder/
├── server/ <------- This is your existing server folder (the one with the **PalServer.exe** executable)
├── PalworldDSGUI_Server.exe
```

The `server` folder should contain the `PalServer.exe` executable and all the other files that come with the server. The `PalworldDSGUI_Server.exe` should be in the same folder as the `server` folder. Then you can run the `PalworldDSGUI_Server.exe` and it will detect the existing server. If you want to use a different folder name, you can use the `-serverpath` parameter to specify the folder name.

## GUI server parameters

| Param       | Description                        | Default |
| ----------- | ---------------------------------- | ------- |
| -newkey     | Generate a new API key             |
| -showkey    | Show the current API key           |
| -help       | Show help                          |
| -port       | Port to run the server on          | 21577   |
| -serverpath | Path to the PalWorld server folder | server  |

To use the parameters, you need to open a command prompt and navigate to the folder where the `PalworldDSGUI_Server.exe` is located. Then you can run the executable with the parameters you want. For example, to run the server on port 12345 and with a custom server folder, you can run the following command:

```plaintext
PalworldDSGUI_Server.exe -port 12345 -serverpath PalServer
```

## Running the server on Linux

Coming soon.

## Running it in Docker

Coming soon.
