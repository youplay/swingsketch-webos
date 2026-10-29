# SwingSketch for webOS

[繁體中文](README.md)

A small offline drawing board for LG webOS, available as separate Traditional Chinese and English apps.

Youplay proposed the requirements and product direction. **OpenAI Codex assisted with the main application code, interface, revisions, checks and IPK packaging.** This is an independent project, not an official LG or OpenAI product.

## Features

- Eight colors, three pen widths, eraser, undo, redo and clear confirmation.
- A local draft stored in the app's localStorage. No account, ads, analytics or cloud service.
- Responsive layout with a 16:9 canvas.
- Both language editions can coexist. Drafts are separate; there is no in-app language switching or synchronization.

## Install

Download an IPK from [Releases](https://github.com/youplay/swingsketch-webos/releases). Enable LG Developer Mode, pair your supported device using [webOS Dev Manager](https://github.com/webosbrew/dev-manager-desktop), then choose Apps → Install. Do not unpack the IPK. Renew Developer Mode before it expires.

Traditional Chinese: `org.youplay.swingsketch`. English: `org.youplay.swingsketch.en`, displayed as **SwingSketch EN**.

Draw using a supported touchscreen or mouse. Remote keys select tools. Installing the app does not add touch support to a non-touch TV.

## Limitations and testing

Drafts are not backups. Uninstalling the app, clearing its storage or losing Developer Mode may delete them. There is no image export, layers, pen pressure, palm rejection, simultaneous multi-user drawing, USB/NAS storage or cloud sync.

The Chinese edition has an installation record on LG 32U889SA. Browser checks include drawing and simulated touch. The English edition passed browser checks for drawing, undo/redo, clear/undo-clear and draft reload, plus packaging checks; it has not been tested on LG hardware. Native touch, rotation and long-term draft persistence have not been fully verified. Compatibility with every webOS model is not guaranteed.

## Build

With Node.js 20+ and npm:

```sh
npm ci
npm run build
```

IPKs are generated in `dist/`. Readable sources are in `app/zh-Hant` and `app/en`. The initial release uses the previously checked IPKs. Packaging minifies JavaScript and may produce different archive hashes on rebuild. Release SHA-256 values identify the supplied downloads, not a byte-for-byte reproducible build.

## License

[MIT](LICENSE) for project material we have the right to license. See [third-party notices](THIRD_PARTY_NOTICES.md). LG and webOS names describe compatibility only. AI assistance does not imply exclusive copyright over all generated content or override third-party rights.
