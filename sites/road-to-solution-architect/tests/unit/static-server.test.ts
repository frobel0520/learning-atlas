import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function rawGet(port: number, rawPath: string): Promise<{ status: number; body: string }> {
	return new Promise((resolvePromise, reject) => {
		const req = request(
			{ host: "127.0.0.1", port, method: "GET", path: rawPath },
			(res) => {
				let body = "";
				res.setEncoding("utf8");
				res.on("data", (chunk) => {
					body += chunk;
				});
				res.on("end", () => resolvePromise({ status: res.statusCode ?? 0, body }));
			},
		);
		req.on("error", reject);
		req.end();
	});
}

describe("static-server path containment and URI decoding", () => {
	it("serves files inside root and rejects malformed percent-encoding and sibling traversal with 400", async () => {
		const base = mkdtempSync(join(tmpdir(), "rtsa-static-"));
		const distDir = join(base, "dist");
		const siblingDir = join(base, "dist-fixture");
		mkdirSync(distDir);
		mkdirSync(siblingDir);
		writeFileSync(join(distDir, "index.html"), "<h1>dist</h1>");
		writeFileSync(join(distDir, "404.html"), "<h1>404</h1>");
		writeFileSync(join(siblingDir, "secret.txt"), "sibling-secret");

		const port = 43987;
		const child = spawn(process.execPath, ["tests/e2e/static-server.mjs", distDir, String(port)], {
			cwd: process.cwd(),
			stdio: ["ignore", "pipe", "pipe"],
		});

		try {
			await new Promise<void>((resolveReady, rejectReady) => {
				child.stdout.on("data", (chunk: Buffer) => {
					if (chunk.toString("utf8").includes("serving")) resolveReady();
				});
				child.once("exit", (code) => rejectReady(new Error(`server exited early: ${code}`)));
			});

			const ok = await rawGet(port, "/");
			expect(ok.status).toBe(200);
			expect(ok.body).toContain("<h1>dist</h1>");

			const malformed = await rawGet(port, "/%E0%A4%A");
			expect(malformed.status).toBe(400);

			const encodedSibling = await rawGet(port, "/%2e%2e/dist-fixture/secret.txt");
			expect(encodedSibling.status).toBe(400);
			expect(encodedSibling.body).not.toContain("sibling-secret");

			const rawSibling = await rawGet(port, "/../dist-fixture/secret.txt");
			expect(rawSibling.status).toBe(400);
			expect(rawSibling.body).not.toContain("sibling-secret");
		} finally {
			child.kill();
			rmSync(base, { recursive: true, force: true });
		}
	});
});
