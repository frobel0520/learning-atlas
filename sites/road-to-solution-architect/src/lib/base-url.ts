const rawBase = import.meta.env.BASE_URL ?? "/";

export const BASE_URL = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

/** 把站內路徑加上 Astro 設定的 base 前綴，支援部署在子路徑（例如 /learning-atlas/road-to-solution-architect/）。 */
export function withBase(path: string): string {
	return `${BASE_URL}${path.replace(/^\/+/, "")}`;
}
