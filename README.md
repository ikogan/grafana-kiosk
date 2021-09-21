# Simple Kiosk for Grafana Dashboards

Very dump and simple electron app primarily designed to
display Grafana dashboards in Kiosk mode and reload the tab
when it crashes.

## Why?

Grafana 7.x introduced a new Time Series chart that had
a few memory leaks, causing the browser tab to crash. These
were eventually fixed but then the Grafana Zabbix plugin
_also_ introduced a tab crashing memory issue.

Chrome can be used to display Grafana in Kiosk mode but it's
crash handling can be challenging. In addition, positioning
a Chrome window on a specific display, while possible, can
be fun.

The point of this little electron app is to load a URL in
a renderer on a display and reload it whenever the renderer
process dies for any reason.

## Usage

```
grafana-kiosk [args]

Options:
      --version  Show version number                                   [boolean]
  -m, --monitor  Monitor number to display on.                      [default: 0]
  -k, --kiosk    Kiosk mode and fullscreen.            [boolean] [default: true]
  -h, --help     Show help                                             [boolean]
  -u, --url      URL to the dashboard to load. Don't forget the kiosk option.
                                                                      [required]

Boolean options can be turned off with --no-{option}
```

## Building

Dependencies:

- `mono-runtime`
- `rpm`
