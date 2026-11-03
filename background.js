// Toolbar icon follows the switch. Chrome uses service_worker, Firefox uses scripts.
const api = globalThis.browser ?? chrome;

const setIcon = on => {
  const s = on ? "" : "-off";
  api.action.setIcon({ path: { 16: `icons/icon${s}-16.png`, 32: `icons/icon${s}-32.png` } });
};
const sync = () => api.storage.local.get("on").then(s => setIcon(s.on));

api.runtime.onStartup.addListener(sync); // setIcon doesn't survive a browser restart
api.runtime.onInstalled.addListener(sync);
api.storage.onChanged.addListener(c => { if (c.on) setIcon(c.on.newValue); });
