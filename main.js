const electron = require("electron");
const path = require('path');
const { nativeImage, Tray, Menu } = require("electron");

const BrowserWindow = electron.BrowserWindow;
const app = electron.app;
const dialog = electron.dialog;

let mainWindow;
let tray = null;

function createTray() {
    const icon = path.join("./assets/clock.png");
    const trayicon = nativeImage.createFromPath(icon);
    tray = new Tray(trayicon.resize({width: 256}));
    tray.setToolTip('MTimer');
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Show App",
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: "Quit",
            click: () => {
                dialog.showMessageBox({
                    type: 'info',
                    buttons: ['Yes', 'No'],
                    cancelId: 0,
                    defaultId: 1,
                    title: 'STOP',
                    detail: 'Do you really want to quit?'
                  }).then(({ response, checkboxChecked }) => {
                    if (!response) {
                        app.isQuiting = true;
                        app.quit();
                    }
                  })
            }
        },
    ]);

    tray.setContextMenu(contextMenu);

}


async function createMainWindow() {
    if (!tray) {
        createTray()
    }

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "MTimer",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, 
            enableRemoteModule: false,
            skipTaskbar: true,
            backgroundThrottling: false
        }
    });

    mainWindow.loadFile("./html/index.html");

    mainWindow.on('minimize',function(event){
        event.preventDefault();
        mainWindow.hide();
    });


    mainWindow.on('close', function(event) {
        if(!app.isQuiting){
            event.preventDefault();
            mainWindow.hide();
        }
    
        return false;
    });
}

app.on("ready", createMainWindow);
