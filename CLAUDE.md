# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Beer Goggles": a Manifest V3 browser extension (Chrome and Firefox) that blurs all imagery on every page behind one popup switch. Plain JS/CSS, no build step, no dependencies, no tests.

## Running it

- Chrome: `chrome://extensions` → Developer mode → Load unpacked → this folder.
- Firefox: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `manifest.json`.
- After editing `content.js`/`blur.css`, reload the extension and refresh the target tab.

## How it fits together

- **State** is a single `on` boolean in `storage.local`. `popup.js` writes it; `content.js` reads it on load and reacts via `storage.onChanged`. There is no background script.
- **Cross-browser**: both scripts use `globalThis.browser ?? chrome`. Shadow-root access uses `chrome.dom.openOrClosedShadowRoot` (Chrome) or `el.openOrClosedShadowRoot` (Firefox).
- **Two-layer blur**:
  1. `blur.css` is injected at `document_start` and blurs common media tags when `<html data-beergoggles>` is set, so nothing flashes before JS runs.
  2. `content.js` does the thorough pass: it detects imagery (media tags, `input[type=image]`, `data:`/`blob:` iframes, and any element whose own or `::before`/`::after` computed style has a `url(` in background/border/mask/content) and sets an inline `filter: blur(20px) !important`. Inline styles beat page CSS and reach inside shadow DOM, where `blur.css` can't.
- `content.js` keeps a `blurred` Map of element → original inline filter, so switching off restores pages exactly. Anything that blurs elements must go through `blur()` so it can be undone.
- Coverage comes from a MutationObserver (attached to the document and each shadow root found), plus a rescan on `load` and every 2s while on, to catch late stylesheets, hover/JS style changes and late shadow roots.
- The content script runs in all frames, including `about:blank`.
