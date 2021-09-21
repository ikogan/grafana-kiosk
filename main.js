const { app, BrowserWindow, screen } = require('electron')

function createWindow(url, monitor, kiosk) {
    let options = {
        backgroundColor: '#000000',
        title: 'Grafana'
    }

    if (kiosk) {
        options['alwaysOnTop'] = true
        options['fullscreen'] = true
        options['kiosk'] = true
    }

    const displays = screen.getAllDisplays()

    if (monitor >= displays.length) {
        console.error(`There are only ${displays.length} monitors, display ${monitor} does not exist.`)
        app.exit(1)
        return
    }

    options['x'] = displays[monitor].bounds.x
    options['y'] = displays[monitor].bounds.y
    options['width'] = displays[monitor].bounds.width
    options['height'] = displays[monitor].bounds.height

    const win = new BrowserWindow(options)

    win.webContents.on('renderer-process-gone', () => {
        console.warn("Renderer crashed, reloading")
        win.reload()
    })

    win.loadURL(url)
}

const argv = require('yargs')(process.argv.slice(2))
    .scriptName('grafana-kiosk')
    .usage('$0 [args]')
    .demandOption(['u'])
    .alias('u', 'url')
    .describe('url', 'URL to the dashboard to load. Don\'t forget the kiosk option.')
    .default(['m'], 0)
    .alias('m', 'monitor')
    .describe('m', 'Monitor number to display on.')
    .default(['k'], true)
    .boolean('k')
    .alias('k', 'kiosk')
    .describe('k', 'Kiosk mode and fullscreen.')
    .help('h')
    .alias('h', 'help')
    .epilog('Boolean options can be turned off with --no-{option}')
    .argv

app.whenReady().then(() => {
    createWindow(argv.url, argv.monitor, argv.kiosk)

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow(argv.url, argv.monitor)
    })
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
