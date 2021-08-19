const { resolve } = require('path');
const { app, Menu, Tray, Notification } = require('electron');
const fixPath = require('fix-path');
const fs = require('fs');
const AutoLaunch = require('auto-launch');

const homeDir = require('os').homedir();
const appDir = resolve(homeDir, '.checkPonto');
const dbFile = resolve(appDir, '.db');
let autoLaunch = new AutoLaunch({
  name: 'Check Ponto',
  path: app.getPath('exe'),
});

fixPath();

if (app.dock) {
  app.dock.hide();
}

if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir);
}

function showNotification(message) {
  new Notification({ title: "Check Ponto", body: message})
    .show() 
} 

function render(tray) {
  const items = [1, 1, 2, 2].map((ponto, index) => {
    let pontoTitle = `${ponto}ª ${index % 2 ? 'Saida' : 'Entrada'}`;
    
    return {
      label: pontoTitle,
      click: () => {
        let date = new Date(Date.now()).toLocaleString();
  
        fs.appendFileSync(dbFile, `${date};${pontoTitle}\n`);
        showNotification('Salvo com sucesso')
      },
    }
  });

  const contextMenu = Menu.buildFromTemplate([
    ...items,
    {
      type: 'separator',
    },
    {
      label: "Limpar base",
      click: () => {
        if (fs.existsSync(dbFile)) {
          fs.unlinkSync(dbFile);
          showNotification("Limpo com sucesso");      
        } else {
          showNotification("Nenhuma base encontrada");
        }
      },
    },
    {
      type: 'normal',
      label: "Sair",
      role: 'quit',
      enabled: true,
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => tray.popUpContextMenu());
}

app.on('ready', () => {
  autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLaunch.enable();
  });
  
  render(new Tray(resolve(__dirname, 'assets', 'icon.png')));
});