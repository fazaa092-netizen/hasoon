import {
  Activity,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleDot,
  Code2,
  Copy,
  Eye,
  File,
  Folder,
  GitBranch,
  GitFork,
  GitPullRequest,
  History,
  LayoutGrid,
  LineChart,
  Link as LinkIcon,
  Menu,
  MoreHorizontal,
  PlayCircle,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import "./Home.css";

const REPOSITORY_URL = "https://github.com/fazaa092-netizen/hasoon";
const CLONE_URL = "https://github.com/fazaa092-netizen/hasoon.git";

const topNav = [
  { label: "Platform", menu: ["AI-powered developer platform", "Developer tools", "Marketplace"] },
  { label: "Solutions", menu: ["By company size", "By industry", "By use case"] },
  { label: "Resources", menu: ["Topics", "Explore", "Learning pathways"] },
  { label: "Open Source", menu: ["GitHub Sponsors", "The ReadME Project", "Repositories"] },
  { label: "Enterprise", menu: ["Enterprise platform", "Available add-ons", "Premium support"] },
];

const tabs = [
  { label: "Code", icon: Code2, active: true, href: REPOSITORY_URL },
  { label: "Issues", icon: CircleDot, href: `${REPOSITORY_URL}/issues` },
  { label: "Pull requests", icon: GitPullRequest, href: `${REPOSITORY_URL}/pulls` },
  { label: "Actions", icon: PlayCircle, href: `${REPOSITORY_URL}/actions` },
  { label: "Projects", icon: LayoutGrid, href: `${REPOSITORY_URL}/projects` },
  { label: "Security and quality", icon: Shield, href: `${REPOSITORY_URL}/security` },
  { label: "Insights", icon: LineChart, href: `${REPOSITORY_URL}/pulse` },
];

type RepoEntry = {
  name: string;
  type: "folder" | "file";
  message: string;
  age: string;
};

const entries: RepoEntry[] = [
  { name: ".base44", type: "folder", message: "Add Base44 environment configuration and Docker setup", age: "last week" },
  { name: "client", type: "folder", message: "Secure admin dashboard with server sessions", age: "last week" },
  { name: "drizzle", type: "folder", message: "رفع ملفات الموقع كاملة", age: "2 weeks ago" },
  { name: "patches", type: "folder", message: "Add files via upload", age: "2 weeks ago" },
  { name: "scripts", type: "folder", message: "Add Fazaa campaign studio slider", age: "last week" },
  { name: "server", type: "folder", message: "Resolve stability and configuration errors", age: "last week" },
  { name: "shared", type: "folder", message: "رفع ملفات الموقع كاملة", age: "2 weeks ago" },
  { name: ".env.base44-defaults", type: "file", message: "Suppress Vite analytics warnings by setting defaults", age: "last week" },
  { name: ".gitignore", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: ".gitkeep", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: ".prettierignore", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: ".prettierrc", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: "AGENTS.md", type: "file", message: "Add Base44 environment configuration and Docker setup", age: "last week" },
  { name: "README.md1", type: "file", message: "Create README.md", age: "2 weeks ago" },
  { name: "brand-spec.md", type: "file", message: "Add bank partnership image to forms", age: "last week" },
  { name: "components.json", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: "design-audit.md", type: "file", message: "Secure admin dashboard with server sessions", age: "last week" },
  { name: "docker-compose.base44.yml", type: "file", message: "Add Base44 environment configuration and Docker setup", age: "last week" },
  { name: "drizzle.config.ts", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: "ideas.md", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: "package.json", type: "file", message: "Resolve stability and configuration errors", age: "last week" },
  { name: "pnpm-lock.yaml", type: "file", message: "Resolve stability and configuration errors", age: "last week" },
  { name: "template.json", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: "todo.md", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: "tsconfig.json", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: "tsconfig.node.json", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: "vercel.json", type: "file", message: "Update vercel.json", age: "2 weeks ago" },
  { name: "vite.config.ts", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: "vite.config.ts.bak", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
  { name: "vitest.config.ts", type: "file", message: "رفع ملفات موقع فرعة", age: "2 weeks ago" },
];

const branches = ["main", "base44/setup-22dae8e1", "base44/setup-478d5c0d", "base44/setup-6f1021c0"];

function CountButton({
  icon: Icon,
  label,
  count,
  onClick,
  pressed,
}: {
  icon: typeof Star;
  label: string;
  count?: number;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button className={`gh-action-button${pressed ? " is-pressed" : ""}`} onClick={onClick} aria-pressed={pressed}>
      <Icon aria-hidden="true" />
      <span>{label}</span>
      {typeof count === "number" && <span className="gh-count">{count}</span>}
    </button>
  );
}

function Home() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [starred, setStarred] = useState(false);
  const [branch, setBranch] = useState("main");
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const previousTitle = document.title;
    const previousLang = root.lang;
    const previousDir = root.dir;
    const applyPageMetadata = () => {
      root.lang = "en";
      root.dir = "ltr";
      document.title = "fazaa092-netizen/hasoon · GitHub";
    };
    applyPageMetadata();
    const metadataFrame = window.requestAnimationFrame(applyPageMetadata);

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (event.key === "/" && !isEditing) {
        event.preventDefault();
        setOpenMenu(null);
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".gh-dropdown-wrap, .gh-nav-group")) setOpenMenu(null);
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.cancelAnimationFrame(metadataFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.title = previousTitle;
      root.lang = previousLang;
      root.dir = previousDir;
    };
  }, []);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? entries.filter((entry) => entry.name.toLowerCase().includes(normalized)) : entries;
  }, [query]);

  const copyCloneUrl = async () => {
    try {
      await navigator.clipboard.writeText(CLONE_URL);
      toast.success("Clone URL copied");
    } catch {
      toast.error("Copy failed — select the URL manually");
    }
  };

  const openFile = (entry: RepoEntry) => {
    const target = entry.type === "folder" ? "tree" : "blob";
    window.open(`${REPOSITORY_URL}/${target}/main/${encodeURIComponent(entry.name)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="github-replica" dir="ltr">
      <a className="gh-skip-link" href="#repository-content">Skip to content</a>

      <header className="gh-global-header">
        <div className="gh-global-inner">
          <a className="gh-logo" href="https://github.com" aria-label="GitHub home">
            <img src="/assets/github-invertocat-white.svg" alt="GitHub" />
          </a>

          <button
            className="gh-mobile-menu-button"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>

          <nav className={`gh-primary-nav${mobileOpen ? " is-open" : ""}`} aria-label="GitHub primary navigation">
            {topNav.map((item) => (
              <div className="gh-nav-group" key={item.label}>
                <button
                  className="gh-nav-link"
                  type="button"
                  aria-expanded={openMenu === item.label}
                  onClick={() => setOpenMenu((current) => (current === item.label ? null : item.label))}
                >
                  {item.label}
                  <ChevronDown />
                </button>
                {openMenu === item.label && (
                  <div className="gh-nav-dropdown">
                    {item.menu.map((label) => (
                      <a key={label} href="https://github.com" onClick={() => setOpenMenu(null)}>
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a className="gh-nav-pricing" href="https://github.com/pricing">Pricing</a>
          </nav>

          <div className="gh-global-actions">
            <button className="gh-search-trigger" type="button" onClick={() => { setOpenMenu(null); setSearchOpen(true); }} aria-label="Search GitHub">
              <Search />
              <span>Type <kbd>/</kbd> to search</span>
            </button>
            <a href="https://github.com/login" className="gh-sign-in">Sign in</a>
            <a href="https://github.com/signup" className="gh-sign-up">Sign up</a>
            <button className="gh-settings-button" type="button" aria-label="Appearance settings" onClick={() => toast("Appearance follows your system setting") }>
              <SlidersHorizontal />
            </button>
          </div>
        </div>
      </header>

      <section className="gh-repo-header" aria-labelledby="repository-title">
        <div className="gh-shell gh-repo-title-row">
          <h1 id="repository-title">
            <BookOpen aria-hidden="true" />
            <a href="https://github.com/fazaa092-netizen">fazaa092-netizen</a>
            <span>/</span>
            <a className="gh-repo-name" href={REPOSITORY_URL}>hasoon</a>
            <span className="gh-visibility">Public</span>
          </h1>
          <div className="gh-repo-actions">
            <CountButton icon={Bell} label="Notifications" onClick={() => toast.success("Notifications set to participating and @mentions") } />
            <CountButton icon={GitFork} label="Fork" count={0} onClick={() => toast("Sign in to fork this repository") } />
            <CountButton icon={Star} label={starred ? "Starred" : "Star"} count={starred ? 1 : 0} pressed={starred} onClick={() => setStarred((value) => !value)} />
          </div>
        </div>

        <nav className="gh-repo-tabs" aria-label="Repository">
          <div className="gh-shell gh-tabs-scroll">
            {tabs.map(({ label, icon: Icon, active, href }) => (
              <a key={label} className={`gh-repo-tab${active ? " is-active" : ""}`} href={href} aria-current={active ? "page" : undefined}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </nav>
      </section>

      <main className="gh-shell gh-repository-layout" id="repository-content">
        <section className="gh-main-column" aria-label="Repository files">
          <div className="gh-file-toolbar">
            <div className="gh-toolbar-left">
              <div className="gh-dropdown-wrap">
                <button
                  className="gh-control-button gh-branch-button"
                  type="button"
                  aria-expanded={openMenu === "branches"}
                  onClick={() => setOpenMenu((current) => (current === "branches" ? null : "branches"))}
                >
                  <GitBranch />
                  <span>{branch}</span>
                  <ChevronDown />
                </button>
                {openMenu === "branches" && (
                  <div className="gh-popover gh-branch-popover">
                    <strong>Switch branches/tags</strong>
                    {branches.map((item) => (
                      <button key={item} type="button" onClick={() => { setBranch(item); setOpenMenu(null); }}>
                        <Check className={branch === item ? "is-visible" : ""} />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <a className="gh-inline-stat" href={`${REPOSITORY_URL}/branches`}><GitBranch /><strong>4</strong> Branches</a>
              <a className="gh-inline-stat" href={`${REPOSITORY_URL}/tags`}><Tag /><strong>0</strong> Tags</a>
            </div>

            <div className="gh-toolbar-right">
              <button className="gh-go-to-file" type="button" onClick={() => { setOpenMenu(null); setSearchOpen(true); }}>
                <Search />
                <span>Go to file</span>
              </button>
              <div className="gh-dropdown-wrap">
                <button
                  className="gh-code-button"
                  type="button"
                  aria-expanded={openMenu === "code"}
                  onClick={() => setOpenMenu((current) => (current === "code" ? null : "code"))}
                >
                  <Code2 />
                  <span>Code</span>
                  <ChevronDown />
                </button>
                {openMenu === "code" && (
                  <div className="gh-popover gh-code-popover">
                    <strong>Clone</strong>
                    <div className="gh-clone-field">
                      <input aria-label="Clone URL" readOnly value={CLONE_URL} />
                      <button type="button" onClick={copyCloneUrl} aria-label="Copy clone URL"><Copy /></button>
                    </div>
                    <a href={`${REPOSITORY_URL}/archive/refs/heads/main.zip`}><Folder />Download ZIP</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="gh-file-browser">
            <div className="gh-commit-row">
              <a className="gh-commit-author" href="https://github.com/fazaa092-netizen">
                <img src="/assets/fazaa092-netizen-avatar.png" alt="" />
                <strong>fazaa092-netizen</strong>
              </a>
              <a className="gh-latest-message" href={`${REPOSITORY_URL}/commit/e93233f`}>Merge pull request <span>#1</span> from fazaa092-…</a>
              <button type="button" className="gh-more-button" aria-label="More commit details" onClick={() => toast("Latest commit: e93233f") }><MoreHorizontal /></button>
              <Check className="gh-status-check" aria-label="Checks passing" />
              <a className="gh-commit-hash" href={`${REPOSITORY_URL}/commit/e93233f`}>e93233f</a>
              <span className="gh-last-week">· last week</span>
              <a className="gh-commit-count" href={`${REPOSITORY_URL}/commits/main/`}><History /><span>19 Commits</span></a>
            </div>

            <div className="gh-file-rows" role="table" aria-label="Files and folders">
              {entries.map((entry) => {
                const EntryIcon = entry.type === "folder" ? Folder : File;
                return (
                  <button className="gh-file-row" type="button" role="row" key={entry.name} onClick={() => openFile(entry)}>
                    <span className={`gh-entry-name ${entry.type}`} role="cell"><EntryIcon /><span>{entry.name}</span></span>
                    <span className="gh-entry-message" role="cell">{entry.message}</span>
                    <span className="gh-entry-age" role="cell">{entry.age}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <section className="gh-readme-panel" aria-labelledby="readme-title">
            <div className="gh-readme-header"><h2 id="readme-title">README</h2></div>
            <div className="gh-readme-empty" aria-label="This repository has no README content" />
          </section>
        </section>

        <aside className="gh-sidebar" aria-label="Repository information">
          <section className="gh-sidebar-section gh-about-section">
            <h2>About</h2>
            <p>An integrated online platform for applying for UAE Fazaa card membership.</p>
            <a className="gh-about-link" href="https://hasoon.vercel.app" target="_blank" rel="noreferrer"><LinkIcon />hasoon.vercel.app</a>
            <a className="gh-meta-link" href="#readme-title"><BookOpen />Readme</a>
            <a className="gh-meta-link" href={`${REPOSITORY_URL}/activity`}><Activity />Activity</a>
            <div className="gh-meta-link"><Star />0 stars</div>
            <div className="gh-meta-link"><Eye />0 watching</div>
            <div className="gh-meta-link"><GitFork />0 forks</div>
            <a className="gh-report-link" href={`${REPOSITORY_URL}/report`}>Report repository</a>
          </section>

          <section className="gh-sidebar-section">
            <h2>Releases</h2>
            <p className="gh-muted-copy">No releases published</p>
          </section>

          <section className="gh-sidebar-section">
            <h2>Contributors <span className="gh-count">2</span></h2>
            <a className="gh-contributor" href="https://github.com/fazaa092-netizen">
              <img src="/assets/fazaa092-netizen-avatar.png" alt="" />
              <strong>fazaa092-netizen</strong>
            </a>
            <a className="gh-contributor" href="https://github.com/apps/base44-builder">
              <img src="/assets/base44-builder-avatar.png" alt="" />
              <strong>base44-builder[bot]</strong>
            </a>
          </section>

          <section className="gh-sidebar-section gh-languages">
            <h2>Languages</h2>
            <div className="gh-language-bar" aria-label="TypeScript 89.7%, CSS 6.4%, JavaScript 3.7%, Other 0.2%">
              <span className="typescript" /><span className="css" /><span className="javascript" /><span className="other" />
            </div>
            <ul>
              <li><i className="typescript" /><strong>TypeScript</strong> 89.7%</li>
              <li><i className="css" /><strong>CSS</strong> 6.4%</li>
              <li><i className="javascript" /><strong>JavaScript</strong> 3.7%</li>
              <li><i className="other" /><strong>Other</strong> 0.2%</li>
            </ul>
          </section>
        </aside>
      </main>

      {searchOpen && (
        <div className="gh-search-backdrop" role="presentation" onMouseDown={() => setSearchOpen(false)}>
          <section className="gh-search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="gh-search-input-wrap">
              <Search />
              <input
                ref={searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                id="search-title"
                placeholder="Search files in this repository"
                aria-label="Search repository files"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X /></button>
            </div>
            <div className="gh-search-results">
              {filteredEntries.length > 0 ? filteredEntries.slice(0, 8).map((entry) => (
                <button type="button" key={entry.name} onClick={() => openFile(entry)}>
                  {entry.type === "folder" ? <Folder /> : <File />}
                  <span>{entry.name}</span>
                </button>
              )) : <p>No files found</p>}
            </div>
            <footer><span><kbd>↵</kbd> to open</span><span><kbd>esc</kbd> to close</span></footer>
          </section>
        </div>
      )}
    </div>
  );
}

export default Home;
