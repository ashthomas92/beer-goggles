const api = globalThis.browser ?? chrome;
const root = document.documentElement;
const TAGS = new Set(["img", "picture", "svg", "image", "video", "canvas", "embed", "object", "content-video-player", "video-card"]);
const CLASSES = ".video-wrapper, .video";
const URL_PROPS = ["backgroundImage", "borderImageSource", "maskImage", "content"];
const OPTS = { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class", "src"] };
const blurred = new Map(); // element -> its original inline filter, restored when switched off
let on = false;

const hasUrl = style => URL_PROPS.some(p => style[p]?.includes("url("));

const isImagery = el =>
  TAGS.has(el.localName) ||
  el.matches(CLASSES) ||
  (el.localName === "input" && el.type === "image") ||
  (el.localName === "iframe" && /^(data|blob):/.test(el.src)) || // frames extensions can't run in
  [null, "::before", "::after"].some(p => hasUrl(getComputedStyle(el, p))); // pseudo images blur their host

// Inline !important beats any page CSS, and reaches inside shadow DOM where blur.css can't.
const blur = el => {
  blurred.set(el, [el.style.getPropertyValue("filter"), el.style.getPropertyPriority("filter")]);
  el.style.setProperty("filter", "blur(20px)", "important");
};

const unblurAll = () => {
  for (const [el, [value, priority]] of blurred) value ? el.style.setProperty("filter", value, priority) : el.style.removeProperty("filter");
  blurred.clear();
};

const check = el => {
  if (el.nodeType !== 1) return;
  // Check the style, not the map: frameworks rewrite style attributes and wipe our blur.
  if (el.style?.getPropertyValue("filter") !== "blur(20px)" && isImagery(el)) blur(el);
  if (!(el instanceof HTMLElement)) return; // only HTML can host shadow roots; Chrome's API throws on SVG and halts the scan
  const shadow = api.dom?.openOrClosedShadowRoot(el) ?? el.openOrClosedShadowRoot; // Chrome / Firefox; both see closed roots
  if (shadow) { observer.observe(shadow, OPTS); scan(shadow); }
};
const scan = node => { check(node); node.querySelectorAll?.("*").forEach(check); };

const observer = new MutationObserver(muts => {
  if (!on) return;
  for (const m of muts) m.type === "childList" ? m.addedNodes.forEach(scan) : check(m.target);
});
observer.observe(root, OPTS);

const apply = value => {
  on = !!value;
  root.toggleAttribute("data-beergoggles", on);
  on ? scan(root) : unblurAll();
};

// Catch what mutations miss: late stylesheets, hover/JS-driven style changes, late shadow roots.
// ponytail: full rescan every 2s while on; lengthen or drop if big pages feel sluggish
addEventListener("load", () => on && scan(root));
setInterval(() => {
  if (!on) return;
  for (const el of blurred.keys()) if (!el.isConnected) blurred.delete(el);
  scan(root);
}, 2000);

api.storage.local.get("on").then(s => apply(s.on));
api.storage.onChanged.addListener(c => { if (c.on) apply(c.on.newValue); });
