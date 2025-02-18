const { app, BrowserWindow, screen } = require('electron')
const console = require('console');

function createWindow(url, options, crash=-1) {
    const win = new BrowserWindow(options)

    console.log("Loading Grafana...")
    win.loadURL(url)

    if (crash > -1) {
        setTimeout(() => { win.webContents.forcefullyCrashRenderer() }, crash)
    }

    return win
}

const argv = require('yargs')(process.argv.slice(1))
    .scriptName('grafana-kiosk')
    .usage('$0 [args]')
    .demandOption(['u'])
    .alias('u', 'url')
    .requiresArg('u')
    .describe('url', 'URL to the dashboard to load. Don\'t forget the kiosk option.')
    .default(['m'], 0)
    .alias('m', 'monitor')
    .requiresArg('m')
    .describe('m', 'Monitor number to display on.')
    .default(['k'], true)
    .boolean('k')
    .alias('k', 'kiosk')
    .describe('k', 'Kiosk mode and fullscreen.')
    .help('h')
    .alias('h', 'help')
    .option('crash')
    .number('crash')
    .nargs('crash', 1)
    .requiresArg('crash')
    .describe('crash', 'Crash after n millseconds')
    .epilog('Boolean options can be turned off with --no-{option}')
    .argv

app.whenReady().then(() => {
    let options = {
        backgroundColor: '#000000',
        title: 'Grafana'
    }

    if (argv.kiosk) {
        options['alwaysOnTop'] = true
        options['fullscreen'] = true
        options['kiosk'] = true
    }

    const displays = screen.getAllDisplays()

    if (argv.monitor >= displays.length) {
        console.error(`There are only ${displays.length} monitors, display ${argv.monitor} does not exist.`)
        app.exit(1)
        return
    }

    options['x'] = displays[argv.monitor].bounds.x
    options['y'] = displays[argv.monitor].bounds.y
    options['width'] = displays[argv.monitor].bounds.width
    options['height'] = displays[argv.monitor].bounds.height

    let state = {
        "win": createWindow(argv.url, options, argv.crash),
        "crashing": false
    }

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            state.win = createWindow(argv.url, options, argv.crash)
        }
    })
    app.on('render-process-gone', () => {
        console.warn("Renderer crashed, reloading")
        state.crashing = true
        state.win.destroy()
        state.win = createWindow(argv.url, options, argv.crash)
        state.crashing = false
    })
    app.on('gpu-process-gone', () => {
        console.warn("GPU crashed, reloading")
        state.crashing = true
        state.win.destroy()
        state.win = createWindow(argv.url, options, argv.crash)
        state.crashing = false
    })
    app.on('child-process-gone', () => {
        console.warn("Child crashed, reloading")
        state.crashing = true
        state.win.destroy()
        state.win = createWindow(argv.url, options, argv.crash)
        state.crashing = false
    })
    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin' && !state.crashing) app.quit()
    })
});

