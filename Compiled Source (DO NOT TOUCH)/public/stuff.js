const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({

	files: {
		wasm: "/scram/scramjet.wasm.wasm",
		all: "/scram/scramjet.all.js",
		sync: "/scram/scramjet.sync.js",
	},

});

try {
  if (navigator.serviceWorker) {
    scramjet.init();
    navigator.serviceWorker.register("./sw.js");
  } else {
    console.warn("Service workers not supported");
  }
} catch (e) {
  console.error("Failed to initialize Scramjet:", e);
}

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
const wispUrl =
  (location.protocol === "https:" ? "wss" : "ws") +
  "://" +
  location.host +
  "/wisp/";

async function setTransport(transportsel) {
  switch (transportsel) {
    case "epoxy":
      await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
      break;
    case "libcurl":
      await connection.setTransport("/libcurl/index.mjs", [{ websocket: wispUrl }]);
      break;
    default:
      await connection.setTransport("/bareasmodule/index.mjs", [bareUrl]);
      break;
  }
}
function search(input) {
  let template = "https://www.google.com/search?q=%s";
  try {
    return new URL(input).toString();
  } catch (err) {}

  try {
    let url = new URL(`http://${input}`);
    if (url.hostname.includes(".")) return url.toString();
  } catch (err) {}

  return template.replace("%s", encodeURIComponent(input));
}

setTransport("epoxy");

window.addEventListener("DOMContentLoaded", async () => {
  await scramjet.init();

  // Create button
  const button = document.createElement("button");
  button.textContent = "Launch Clash";
  button.style.position = "absolute";
  button.style.top = "50%";
  button.style.left = "50%";
  button.style.transform = "translate(-50%, -50%)";
  button.style.padding = "12px 24px";
  button.style.fontSize = "18px";
  button.style.background = "white";
  button.style.color = "black";
  button.style.border = "2px solid black";
  button.style.cursor = "pointer";

  document.body.appendChild(button);

  // On click → remove button, create iframe
  button.addEventListener("click", () => {
    button.remove();

    const iframe = document.createElement("iframe");
    
    iframe.id = "iframe";
    iframe.style.width = "100%";
    iframe.style.height = "100vh";
    iframe.style.border = "none";
    
    document.body.appendChild(iframe);

    // Replace with Clash’s URL
    let fixedurl = search("https://web.cloudmoonapp.com/");
    let url = scramjet.encodeUrl(fixedurl);
    iframe.src = url;
  });
});