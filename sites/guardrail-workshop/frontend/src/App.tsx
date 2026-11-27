import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_API_URL,
  createClient,
  loadApiUrl,
  loadMode,
  saveApiUrl,
  saveMode,
  type Mode,
} from "./api";
import { Dashboard } from "./components/Dashboard";
import { Playground } from "./components/Playground";
import { PageHeader } from "./components/ui";
import { LESSONS } from "./content/lessons";
import { RULES } from "./guard/engine";

const MOBILE_NAV = "(max-width: 900px)";

const LAB_ROUTES = [
  { id: "playground", nav: "互動實驗場" },
  { id: "dashboard", nav: "攔截事件" },
];

const ALL_ROUTES = [...LESSONS.map((l) => l.id), ...LAB_ROUTES.map((l) => l.id)];

function useHashRoute(): [string, (id: string) => void] {
  const read = () => {
    const raw = window.location.hash.replace(/^#\/?/, "");
    return ALL_ROUTES.includes(raw) ? raw : LESSONS[0].id;
  };
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return [route, (id: string) => { window.location.hash = `/${id}`; }];
}

function ModeSwitch({
  mode,
  setMode,
  apiUrl,
  setApiUrl,
  health,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  apiUrl: string;
  setApiUrl: (u: string) => void;
  health: "unknown" | "ok" | "bad";
}) {
  return (
    <div className="mode-bar">
      <div className="mode-switch">
        <span>資料來源</span>
        <div className="mode-group">
          <button className={`pill-btn ${mode === "demo" ? "on" : ""}`} onClick={() => setMode("demo")}>
            Demo（瀏覽器）
          </button>
          <button className={`pill-btn ${mode === "live" ? "on" : ""}`} onClick={() => setMode("live")}>
            Live API（本機後端）
          </button>
        </div>
        {mode === "live" ? (
          <>
            <input
              className="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder={DEFAULT_API_URL}
              aria-label="後端位址"
            />
            <span>
              <span className={`status-dot ${health === "ok" ? "ok" : health === "bad" ? "bad" : ""}`} />
              {health === "ok" ? "已連線" : health === "bad" ? "連不上" : "檢查中"}
            </span>
          </>
        ) : null}
      </div>
      <span>規則版本 v{RULES.version}</span>
    </div>
  );
}

export default function App() {
  const [route, go] = useHashRoute();
  const [mode, setModeState] = useState<Mode>(loadMode);
  const [apiUrl, setApiUrlState] = useState<string>(loadApiUrl);
  const [health, setHealth] = useState<"unknown" | "ok" | "bad">("unknown");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE_NAV).matches);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const content = useRef<HTMLElement>(null);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_NAV);
    const syncLayout = () => {
      if (query.matches && sidebar.current?.contains(document.activeElement)) {
        menuButton.current?.focus({ preventScroll: true });
      }
      setMobile(query.matches);
      setMenuOpen(false);
    };
    query.addEventListener("change", syncLayout);
    return () => query.removeEventListener("change", syncLayout);
  }, []);

  useEffect(() => {
    if (menuOpen) sidebar.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus({ preventScroll: true });
  }, [menuOpen]);

  function closeMenu() {
    menuButton.current?.focus({ preventScroll: true });
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function navigateFromMenu(id: string) {
    if (menuOpen) {
      content.current?.focus({ preventScroll: true });
      setMenuOpen(false);
    }
    go(id);
  }

  const client = useMemo(() => createClient(mode, apiUrl), [mode, apiUrl]);

  useEffect(() => {
    if (mode !== "live") {
      setHealth("unknown");
      return;
    }
    let cancelled = false;
    setHealth("unknown");
    client
      .health()
      .then(() => !cancelled && setHealth("ok"))
      .catch(() => !cancelled && setHealth("bad"));
    return () => {
      cancelled = true;
    };
  }, [client, mode]);

  function setMode(next: Mode) {
    setModeState(next);
    saveMode(next);
  }

  function setApiUrl(next: string) {
    setApiUrlState(next);
    saveApiUrl(next);
  }

  const lessonIndex = LESSONS.findIndex((l) => l.id === route);
  const lesson = lessonIndex >= 0 ? LESSONS[lessonIndex] : null;
  const labRoute = LAB_ROUTES.find((l) => l.id === route);
  const crumb = lesson ? lesson.nav : labRoute ? labRoute.nav : "";

  return (
    <div className="app">
      <nav className={`sidebar${menuOpen ? " open" : ""}`} id="sidebar" aria-label="課程導覽" ref={sidebar} inert={mobile && !menuOpen}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">GW</span>
          <span className="brand-title">Guardrail Workshop</span>
        </div>
        <p className="brand-sub">AI/ML Engineer 學習系列</p>
        <a className="atlas-link" href="https://frobel0520.github.io/learning-atlas/" aria-label="返回 Learning Atlas 學習總入口">
          Learning Atlas <span aria-hidden="true">↗</span>
        </a>

        <div className="nav-group-label">課程</div>
        {LESSONS.map((l, i) => (
          <button
            key={l.id}
            className={`nav-link ${route === l.id ? "active" : ""}`}
            onClick={() => navigateFromMenu(l.id)}
          >
            <span className="nav-num">{String(i + 1).padStart(2, "0")}</span>
            <span>{l.nav}</span>
          </button>
        ))}

        <div className="nav-group-label">動手做</div>
        {LAB_ROUTES.map((l) => (
          <button
            key={l.id}
            className={`nav-link ${route === l.id ? "active" : ""}`}
            onClick={() => navigateFromMenu(l.id)}
          >
            <span className="nav-num">▸</span>
            <span>{l.nav}</span>
          </button>
        ))}
      </nav>

      <button
        type="button"
        className={`menu-scrim${menuOpen ? " open" : ""}`}
        aria-label="關閉選單"
        tabIndex={-1}
        onClick={closeMenu}
      />

      <div className="main-area">
      <header className="topbar">
        <button
          type="button"
          ref={menuButton}
          className="menu-button"
          aria-label="開啟選單"
          aria-expanded={menuOpen}
          aria-controls="sidebar"
          onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}
        >
          ☰
        </button>
        <div className="breadcrumb">
          <span>GUARDRAIL</span>
          <i>/</i>
          <b>{crumb}</b>
        </div>
        <ModeSwitch mode={mode} setMode={setMode} apiUrl={apiUrl} setApiUrl={setApiUrl} health={health} />
      </header>

      <main className="content" ref={content} tabIndex={-1}>
        {lesson ? (
          <>
            <PageHeader
              kicker={`GUARDRAIL / ${String(lessonIndex + 1).padStart(2, "0")}`}
              title={lesson.title}
              subtitle={lesson.subtitle}
            />
            {lesson.render()}
            <div className="pager">
              {lessonIndex > 0 ? (
                <button className="btn ghost" onClick={() => go(LESSONS[lessonIndex - 1].id)}>
                  ← {LESSONS[lessonIndex - 1].nav}
                </button>
              ) : (
                <span />
              )}
              {lessonIndex < LESSONS.length - 1 ? (
                <button className="btn ghost" onClick={() => go(LESSONS[lessonIndex + 1].id)}>
                  {LESSONS[lessonIndex + 1].nav} →
                </button>
              ) : (
                <button className="btn ghost" onClick={() => go("playground")}>
                  互動實驗場 →
                </button>
              )}
            </div>
          </>
        ) : null}

        {route === "playground" ? <Playground client={client} /> : null}
        {route === "dashboard" ? <Dashboard client={client} /> : null}
      </main>
      </div>
    </div>
  );
}
