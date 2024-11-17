const scramjet = new ScramjetController({
  prefix: "/service/scramjet/",
  files: {
    wasm: "/scramjet/scramjet.wasm.js",
    worker: "/scramjet/scramjet.worker.js",
    client: "/scramjet/scramjet.client.js",
    shared: "/scramjet/scramjet.shared.js",
    sync: "/scramjet/scramjet.sync.js",
  },
});

scramjet.init("./sw.js");

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
      await connection.setTransport("/libcurl/index.mjs", [{ wisp: wispUrl }]);
      break;
    default:
      await connection.setTransport("/bareasmodule/index.mjs", [bareUrl]);
      break;
  }
}
function search(input) {
  let template = "https://www.google.com/search?q=%s";
  try {
    // input is a valid URL:
    return new URL(input).toString();
  } catch (err) {}

  try {
    let url = new URL(`http://${input}`);
    if (url.hostname.includes(".")) return url.toString();
  } catch (err) {}

  return template.replace("%s", encodeURIComponent(input));
}

setTransport("epoxy");

document.getElementById("idk").addEventListener("submit", async (event) => {
  event.preventDefault();
  let fixedurl = search(document.getElementById("url").value);
  let url;
  if (document.getElementById("proxysel").value === "uv") {
    url = __uv$config.prefix + __uv$config.encodeUrl(fixedurl);
  } else url = scramjet.encodeUrl(fixedurl);
  document.getElementById("iframe").src = url;
});
