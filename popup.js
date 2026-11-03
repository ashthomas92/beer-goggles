const api = globalThis.browser ?? chrome;
const box = document.getElementById("on");
const text = document.getElementById("text");
const show = () => text.textContent = box.checked ? "Take off your beer goggles" : "Put on your beer goggles";

api.storage.local.get("on").then(s => { box.checked = !!s.on; show(); });
box.onchange = () => { api.storage.local.set({ on: box.checked }); show(); };
