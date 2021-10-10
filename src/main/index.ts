import { app, BrowserWindow } from 'electron';

const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  require('source-map-support').install();
}

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  if (isDev) {
    win.loadURL('http://127.0.0.1:3000/pages/app/index.html');
    win.webContents.openDevTools();
  } else {
    win.loadURL(`file://${__dirname}/pages/app/index.html`);
  }
});
