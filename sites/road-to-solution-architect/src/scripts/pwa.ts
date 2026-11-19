// 註冊 service worker，讓網站可以安裝、離線閱讀（docs/03-system-design.md 第 12 節）。
// 不支援或註冊失敗時，網站照常使用，只是不能離線。
import { withBase } from "../lib/base-url.ts";

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register(withBase("sw.js")).catch(() => {
			// 忽略：例如隱私模式封鎖，網站仍可線上閱讀。
		});
	});
}
