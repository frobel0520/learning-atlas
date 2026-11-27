// E2E 用的靜態伺服器：模擬 GitHub Pages，只送檔案、不加安全標頭；CSP 來自每頁的 meta，測試以此抓 CSP 違規。
// 用法：node tests/e2e/static-server.mjs <目錄> <port>
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, join, relative, resolve, sep } from "node:path";

const root = resolve(process.argv[2] ?? "dist-fixture");
const port = Number(process.argv[3] ?? 4321);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".json": "application/json" };

createServer((request, response) => {
	let path;
	try {
		const rawPath = (request.url ?? "/").split("?")[0].split("#")[0];
		path = decodeURIComponent(rawPath);
	} catch {
		response.writeHead(400).end();
		return;
	}
	if (!path.startsWith("/") || path.includes("\0") || path.includes("\\")) {
		response.writeHead(400).end();
		return;
	}
	let file = resolve(root, `.${path}`);
	const rel = relative(root, file);
	if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
		response.writeHead(400).end();
		return;
	}
	if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
	let status = 200;
	if (!existsSync(file)) {
		status = 404;
		file = join(root, "404.html");
	}
	const headers = { "Content-Type": types[extname(file)] ?? "application/octet-stream" };
	response.writeHead(status, headers);
	createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
