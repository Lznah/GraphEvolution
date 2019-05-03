const {BrowserWindow, app} = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow() {
    win = new BrowserWindow({
        center: true,
        width: 1280,
        height: 720,
        icon: path.join(__dirname, 'app/img/icon.icsn'),
        fullscreen: true,
        resizable: false
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'app/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    //win.webContents.openDevTools();
    win.on('closed', function() {
        win = null
    });
}

// App Listeners

app.on('ready', createWindow);

app.on('window-all-closed',function() {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    if(win == null) {
        createWindow();
    }
});
