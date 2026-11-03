# Beer Goggles

A browser extension that blurs all images and videos on every page, with one on/off switch.

![Beer Goggles icon](icons/icon-128.png)

Some professions require spending time in the armpits of the internet, where you are in danger of unintentionally coming across content that you don't want to see. Beer Goggles provides a guard against this - simply toggle on the beer goggles and all images/video will be blurred.

## What it blurs

- Images, videos, SVGs, canvases and embedded media
- Background images, including ones added with `::before` and `::after`
- Content inside web components (shadow DOM), so it works on sites like Reddit
- Images and videos that load later, such as in infinite-scroll feeds

Switching it off puts every page back exactly as it was. The toolbar icon shows whether the goggles are on or off.

## Install from an extension store

Coming soon! Beer Goggles is on its way to the Chrome, Firefox and Edge Web Stores. Links will appear here once it's published.

## Install from source

**Chrome**

1. Go to `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and choose this folder.

**Microsoft Edge**

1. Go to `edge://extensions`.
2. Turn on **Developer mode** in the left-hand menu.
3. Click **Load unpacked** and choose this folder.

**Firefox**

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on** and choose `manifest.json`.

Firefox removes a temporary add-on when it closes.

## Privacy

Beer Goggles collects no data. It stores only whether the switch is on or off, and only in your browser.

## How it works

There's no build step and there are no dependencies.

- `blur.css` blurs common media tags as soon as the page starts loading, so nothing shows unblurred.
- `content.js` finds everything else and blurs it with an inline style. It watches the page for changes and rescans every 2 seconds.
- `popup.html` / `popup.js` is the on/off switch.
- `background.js` swaps the toolbar icon to match the switch.
