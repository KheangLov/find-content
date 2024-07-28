const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.maximize();

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, '/dist/find-content/browser/index.html'),
      protocol: 'file:',
      slashes: true
    })
  );
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
