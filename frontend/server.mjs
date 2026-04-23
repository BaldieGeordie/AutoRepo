import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, "dist");

const USER = process.env.BASIC_AUTH_USER || "";
const PASS = process.env.BASIC_AUTH_PASS || "";
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://127.0.0.1:3000";

function unauthorized(res) {
  res.statusCode = 401;
  res.setHeader("WWW-Authenticate", 'Basic realm="AutoRepo"');
  res.setHeader("Content-Type", "text/plain");
  res.end("Unauthorized");
}

function isAuthorized(req) {
  if (!USER || !PASS) return true;

  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) return false;

  let decoded = "";
  try {
    decoded = Buffer.from(header.slice("Basic ".length).trim(), "base64").toString("utf8");
  } catch {
    return false;
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) return false;

  return decoded.slice(0, separator) === USER && decoded.slice(separator + 1) === PASS;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0] || "/");
  const relative = clean === "/" ? "/index.html" : clean;
  const absolute = path.normalize(path.join(DIST_DIR, relative));
  if (!absolute.startsWith(DIST_DIR)) return null;
  return absolute;
}

const server = http.createServer(async (req, res) => {
  if (!isAuthorized(req)) return unauthorized(res);

  if (req.url && req.url.startsWith("/api/")) {
    try {
      const targetUrl = new URL(req.url, BACKEND_ORIGIN);
      const headers = { ...req.headers };
      delete headers.host;
      delete headers.connection;
      delete headers["content-length"];
      delete headers.authorization;

      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body =
        req.method && !["GET", "HEAD"].includes(req.method)
          ? Buffer.concat(chunks)
          : undefined;

      const upstream = await fetch(targetUrl.toString(), {
        method: req.method,
        headers,
        body,
      });

      res.statusCode = upstream.status;
      upstream.headers.forEach((value, key) => {
        if (key.toLowerCase() === "transfer-encoding") return;
        res.setHeader(key, value);
      });
      return res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch {
      res.statusCode = 502;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.end("Bad gateway");
    }
  }

  const absolute = safePath(req.url || "/");
  if (!absolute) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("Bad request");
  }

  if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) {
    const ext = path.extname(absolute).toLowerCase();
    res.statusCode = 200;
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", absolute.endsWith(`${path.sep}index.html`) ? "no-store" : "public, max-age=31536000, immutable");
    return fs.createReadStream(absolute).pipe(res);
  }

  const indexPath = path.join(DIST_DIR, "index.html");
  if (fs.existsSync(indexPath)) {
    res.statusCode = 200;
    res.setHeader("Content-Type", MIME[".html"]);
    res.setHeader("Cache-Control", "no-store");
    return fs.createReadStream(indexPath).pipe(res);
  }

  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("Not found");
});

const port = Number(process.env.PORT) || 8080;
const host = "0.0.0.0";

server.listen(port, host, () => {
  console.log(`Frontend server listening on http://${host}:${port}`);
});
