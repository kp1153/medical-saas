const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const PROD_URL = "https://medical-saas-32pt.vercel.app";
const DEV_URL = "http://localhost:3000";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 375,
    minHeight: 600,
    title: "ClinicOS",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  const url = app.isPackaged ? PROD_URL : DEV_URL;
  mainWindow.loadURL(url);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});