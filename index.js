const {app, BrowserWindow} = require("electron");

function createMainWindow(){
    let main = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntergration: true
        }
    });

    main.loadFile('index.html');
    main.show();
}

app.whenReady().then(createMainWindow);