# OS-Style Portfolio — Build Plan

**Owner:** James Travis McHorse — Senior AI/ML & Full-Stack Engineer (12+ yrs)
**Concept:** A browser-based portfolio that boots like a real operating system. Visitors pick macOS or Arch Linux at boot; each OS is a fully navigable environment surfacing the same portfolio content (projects, skills, resume, contact) in its native paradigm. A shared "Switch OS" app triggers a restart animation and returns to the boot selector.

---

## 1. Guiding Principles

- **Authenticity over novelty.** Match real OS timings, fonts, cursor behavior, sound cues (optional), and window chrome. A half-right macOS window breaks immersion; a perfect one sells the whole site.
- **One content source, two renderers.** Projects, skills, and resume data live in `/content` as typed data. macOS renders them as Finder folders + app windows; Arch renders them as `cat`-able files + commands. Never duplicate copy.
- **Desktop-only, mobile gets a graceful "not supported" screen.** Full OS experience at ≥1024px. Below that: a simple centered screen that says "Best viewed on desktop" with links to email / GitHub / resume download. No condensed portfolio view — per scope decision.
- **Performance budgets matter.** Boot → first interactive ≤ 3s on cable. Lazy-load everything not on the boot path (windows, PDF viewer, terminal engine).
- **Accessibility floor.** Keyboard nav through macOS windows, focus management in terminal, skip-to-content for screen readers. This is a portfolio for an engineer — people will audit it.

---

## 2. Recommended Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Matches your resume stack; gives route-level code splitting for per-OS bundles |
| Styling | **Tailwind CSS + CSS variables** | Fast theming; CSS vars let you swap OS palettes without re-render |
| State | **Zustand** | Lightweight for window manager state (open apps, z-index, focus, minimized) |
| Window dragging/resizing | **react-rnd** or hand-rolled with `framer-motion` + pointer events | react-rnd is the pragmatic choice; drop to custom only if perf issues |
| Animations | **Framer Motion** | Boot/shutdown sequences, window open/close, dock magnify |
| Terminal | **xterm.js** + custom command parser | Industry standard; handles ANSI colors, cursor, resize |
| PDF viewer | **react-pdf** (pdf.js) | Render your actual resume PDF inline in a macOS Preview-style window |
| Icons | **Lucide** + custom SVG for OS-specific chrome | Keep bundle small; hand-draw the Apple logo and Arch "A" |
| Fonts | **SF Pro** (macOS side, via woff2), **Hack / JetBrains Mono** (Arch side) | Licensed self-hosting; fallback to system-ui |
| Deploy | **Vercel** at `os.leftcoaststack.com` subdomain | Edge caching, preview deploys; AWS Amplify is a fine alternative given your AWS fluency |
| Analytics | **Plausible** or self-hosted Umami | Privacy-friendly; track which OS visitors pick |

Skip Redux — overkill here. Skip a CMS — content volume is small and static.

---

## 3. Information Architecture

Content that must appear in **both** OSes, mapped to native metaphors:

| Content | macOS representation | Arch Linux representation |
|---|---|---|
| About me | "About This Mac" dialog | `whoami`, `os --about` |
| Resume (PDF) | `Resume.pdf` on Desktop → opens in Preview-style window | `cat resume.txt` or `resume --open` (opens PDF overlay) |
| Projects / past work | `~/Projects` folder with subfolders per project (AMS, SheltonAI, Wire Pulse, Smartsheet, etc.) | `projects --list`, `projects --open ams` |
| Skills | `Skills.app` with categorized tabs (AI, Cloud, Frontend, Backend) | `skills` command, grouped output with colored tags |
| Contact | `Contact.app` (mail compose-style UI) | `contact` command (mailto link + copy) |
| Social / GitHub | Dock shortcuts | `links` command |
| AI chatbot (placeholder only — **not** wired to a model) | `Assistant.app` (coming-soon window with feature preview) | `chat` command — prints "Coming soon. LLM-powered assistant in development." |
| OS switcher | `Switch OS.app` in dock and Applications | `os --switch` or `reboot --select-os` |

**Projects to feature** (pulled from your resume — rank by recency + prestige):

1. Atlanta Media Services — AI event platform, 80% deploy-time cut
2. SheltonAI — NLP pipelines, private markets intelligence
3. Smartsheet — 6+ year enterprise tenure
4. Wire Pulse — telemetry dashboards, zero-downtime migration
5. Tryon Creek / American Logistics — 9-step form engine
6. Lilt — 40% page-load improvement, Strapi → Contentful migration
7. iService / DealerBuilt — React Native, WebSockets, 20+ person team
8. Veteran Crowd — MFA, WCAG, rewards platform
9. Athlete to Athlete — onboarding modernization

Each project gets: screenshot(s), problem statement, your contribution, tech stack chips, outcome metrics, optional live link.

---

## 4. Phased Task List

### Phase 0 — Foundation (0.5 – 1 day)

- [ ] Initialize Next.js 15 + TypeScript + Tailwind project in `/Users/jmchorse.tech/projects/os-portfolio`
- [ ] Configure ESLint, Prettier, Husky pre-commit, path aliases (`@/` → `src/`)
- [ ] Set up `content/` directory with typed data files: `projects.ts`, `skills.ts`, `about.ts`
- [ ] Drop resume PDF into `public/` and reference from content layer
- [ ] Scaffold folder structure: `src/{boot, macos, arch, shared, content, lib, hooks, store}`
- [ ] Install core deps: `framer-motion`, `zustand`, `xterm`, `react-pdf`, `react-rnd`, `lucide-react`
- [ ] Configure self-hosted SF Pro + JetBrains Mono; verify license terms
- [ ] Set up basic Vercel deploy pipeline with preview URLs

### Phase 1 — Shared Infrastructure (1 – 2 days)

- [ ] **Global OS state** (Zustand): `currentOS`, `bootState`, `isSwitching`
- [ ] **Persistence:** save chosen OS in `localStorage` so repeat visitors skip the selector (with "boot fresh" option)
- [ ] **Content layer:** typed project/skill/experience data consumed by both OSes
- [ ] **Boot selection screen:**
  - Dark background, centered two tiles (Apple logo + Arch "A")
  - Hover reveals OS name + "Press Enter or click"
  - Keyboard: ← → to focus, Enter to boot
  - Subtle ambient animation (particle field or gradient drift)
- [ ] **Restart transition engine:** shared Framer Motion sequence that (1) fades current OS, (2) shows OS-specific shutdown animation, (3) shows target OS boot, (4) lands on target desktop/shell
- [ ] **Sound system** (optional, default off, toggle in both OSes): boot chime, click, error buzz. Respect `prefers-reduced-motion`.
- [ ] Mobile "not supported" screen (viewport < 1024px): centered card with name, tagline, email, GitHub link, resume download — no OS experience below desktop breakpoint

### Phase 2 — macOS Experience (3 – 5 days)

**Boot & chrome:**
- [ ] Apple logo boot with grey progress bar → fade to desktop (1.5–2s)
- [ ] Desktop wallpaper (use Sonoma/Sequoia-style gradient or original artwork — not Apple's licensed images)
- [ ] Menu bar: Apple menu, active app name, right-side status (clock, battery stub, wifi stub, control center icon)
- [ ] Dynamic clock (1-second tick, formatted like `Wed Apr 15  2:47 PM`)
- [ ] Apple menu dropdown with: About This Mac, System Settings (stub), Sleep (stub), **Restart…**, Shut Down (stub)

**Window manager:**
- [ ] Window component: traffic lights (close/minimize/zoom), title bar with drag, resize handles, rounded corners, drop shadow, subtle vibrancy
- [ ] Z-index stacking on focus; blur title bar on unfocused windows
- [ ] Minimize → genie animation to dock (approximate with scale+skew)
- [ ] Double-click title bar to zoom; shake window on invalid close
- [ ] Global window state in Zustand: `openWindows[]`, `focusedId`, `minimizedIds[]`

**Desktop:**
- [ ] Desktop icons (Resume.pdf, Projects folder, Skills, Contact, Switch OS, optional About.md)
- [ ] Single-click selects, double-click opens
- [ ] Right-click context menu (Open, Get Info stub, Move to Trash stub)
- [ ] Drag icons to reposition (persist in localStorage)

**Dock:**
- [ ] Bottom-centered, glass-blur, magnify-on-hover
- [ ] Pinned apps: Finder, Projects, Skills, Mail (Contact), PDF Preview, Switch OS, optional Terminal-in-macOS (inception shortcut that boots Arch)
- [ ] Running-app indicator dots
- [ ] Click minimized window in dock to restore

**Apps:**
- [ ] **Finder**: sidebar (Favorites, Recents), grid/list view toggle, breadcrumb; navigates the Projects tree
- [ ] **Project detail window**: hero screenshot, problem/contribution/outcome sections, tech chips, external links
- [ ] **Preview (PDF viewer)**: renders resume PDF with zoom, page nav, download
- [ ] **Skills app**: categorized tabs with animated skill bars or tag cloud
- [ ] **Contact app**: Mail-compose-styled form (to/subject/body), opens `mailto:` on send; copy email button
- [ ] **About This Mac**: styled dialog with your photo, tagline, stats (years exp, projects shipped, coffee consumed)
- [ ] **Switch OS app**: simple window — "Switch to Arch Linux?" confirm → triggers restart transition
- [ ] **Assistant (coming soon)**: placeholder window with waitlist input (hook up later)

**Restart flow:**
- [ ] Apple menu → Restart… → close-all animation (windows fly off or fade) → grey screen → Apple logo with spinner → back to OS selector

**Polish:**
- [ ] Spotlight stub (Cmd+Space opens a search overlay that actually searches projects/skills)
- [ ] Keyboard shortcuts: Cmd+W (close window), Cmd+M (minimize), Cmd+Tab (cycle apps)
- [ ] Subtle pointer-follow on dock magnification

### Phase 3 — Arch Linux Experience (2 – 3 days)

**Boot & chrome:**
- [ ] Black terminal screen, white monospace text
- [ ] Authentic-feeling boot log: `[  OK  ] Started systemd...` lines streaming at realistic speed, ending with login prompt
- [ ] Auto-login as `jmchorse@arch`, drop to shell with MOTD: ASCII Arch "A" logo, welcome message, suggestion to run `os --help`

**Terminal engine:**
- [ ] xterm.js in a full-screen container, with authentic prompt: `[jmchorse@arch ~]$`
- [ ] Command parser: tokenize input, dispatch to handlers, support piping? (skip pipes for v1, just plain commands)
- [ ] Command history (↑/↓), tab completion for known commands, Ctrl+C to cancel, Ctrl+L to clear
- [ ] Backspace / cursor movement handled by xterm

**Commands (v1):**
- [ ] `os --help` — lists all available commands with descriptions
- [ ] `os --about` — bio paragraph
- [ ] `os --switch` / `reboot` — triggers shutdown sequence → OS selector
- [ ] `whoami` — `jmchorse — Senior AI/ML & Full-Stack Engineer`
- [ ] `pwd`, `ls`, `cd`, `cat` — operate against a fake in-memory filesystem rooted at `~` containing `projects/`, `skills.txt`, `resume.pdf`, `contact.txt`, `about.md`
- [ ] `projects` — `projects --list`, `projects --open <slug>` (opens a styled text-card of the project with ANSI colors)
- [ ] `skills` — grouped, colored output (green=expert, yellow=strong, blue=proficient)
- [ ] `resume` — prints a text-formatted resume; `resume --pdf` opens the PDF in an overlay viewer
- [ ] `contact` — prints email + socials, offers to copy to clipboard
- [ ] `chat` — "Coming soon. An LLM-powered assistant is in development." (phase 4 hookup)
- [ ] `clear` — clears screen
- [ ] `neofetch` — ASCII Arch logo + system "specs" themed as your stack (CPU: TypeScript, GPU: React, RAM: 12 years of experience, etc.) — high-ROI for screenshot shareability
- [ ] `date`, `uptime`, `echo` — cheap wins
- [ ] `sudo <anything>` — joke response: `[sudo] password for jmchorse: ...Nice try.`
- [ ] Unknown command → `bash: <cmd>: command not found` matching real Arch formatting

**Shutdown / restart:**
- [ ] `reboot` or `os --switch` → shutdown log streams (`[  OK  ] Stopped Session...`) → black → OS selector

### Phase 4 — Content & Polish (1 – 2 days)

- [ ] Write final copy for every project (problem / contribution / outcome, keep tight)
- [ ] **Project screenshots:** ship v1 with placeholder art (branded gradient + project name + logo). Later pass: programmatically capture screenshots from the live company sites listed in the resume (AMS, Athlete to Athlete, Veteran Crowd, Wire Pulse, SheltonAI, American Logistics, Lilt, DealerBuilt, JMFA, Surefront, Embrace, Riviera Partners, Smartsheet) using Playwright/Puppeteer. Store in `public/project-screenshots/`. Note: some sites may block headless browsers or not exist anymore — fall back to Wayback Machine or manual capture.
- [ ] Author `neofetch` and MOTD ASCII art
- [ ] Record (or skip) boot chime and UI sounds
- [ ] SEO: `<title>`, OG tags, favicon that shifts based on chosen OS, `robots.txt`, sitemap
- [ ] Lighthouse pass — target 95+ on desktop
- [ ] Cross-browser check: Safari, Chrome, Firefox, Arc
- [ ] Analytics wired up; track boot-OS selection, most-opened project, time spent

### Phase 5 — Stretch (optional, post-launch)

- [ ] **AI chatbot (deferred — not in v1):** wire `chat` command and `Assistant.app` to an OpenAI/Claude endpoint with a resume-aware system prompt. RAG over project content. v1 ships the UI + "coming soon" copy only.
- [ ] **Persist window positions** across sessions
- [ ] **Multi-desktop (Mission Control) gesture** on macOS side
- [ ] **Package manager joke:** `pacman -S <anything>` returns fake install progress
- [ ] **Hidden Easter eggs:** konami code, `sudo rm -rf /` with dramatic-but-fake output, typing your name launches a fireworks animation
- [ ] **Konami** / `vim resume.md` opens a vim-keybinding-supporting editor (read-only) — nerd credibility
- [ ] **Share "OS state" URL** — e.g. `/?os=arch&cmd=projects+--open+ams` deep-links into a command result

---

## 5. File/Folder Layout (proposed)

```
os-portfolio/
├── public/
│   ├── resume.pdf
│   ├── wallpapers/
│   ├── project-screenshots/
│   └── fonts/
├── src/
│   ├── app/                    # Next.js app router; single route that mounts the boot manager
│   ├── boot/                   # OS selector, transitions
│   ├── macos/
│   │   ├── chrome/             # menu bar, dock, desktop
│   │   ├── window/             # window manager, draggable/resizable
│   │   ├── apps/               # Finder, Preview, Skills, Contact, SwitchOS, etc.
│   │   └── index.tsx
│   ├── arch/
│   │   ├── terminal/           # xterm host + input loop
│   │   ├── commands/           # one file per command
│   │   ├── fs/                 # in-memory filesystem
│   │   └── index.tsx
│   ├── shared/
│   │   ├── RestartTransition.tsx
│   │   ├── PDFViewer.tsx
│   │   └── MobileFallback.tsx
│   ├── content/
│   │   ├── projects.ts
│   │   ├── skills.ts
│   │   ├── about.ts
│   │   └── experience.ts
│   ├── store/                  # zustand slices: os, windows, bootState
│   ├── hooks/
│   └── lib/
├── PLAN.md
└── README.md
```

---

## 6. Risk / Decision Log

- **Apple IP:** don't ship the literal Apple logo or official wallpapers. Use a stylized apple silhouette and original gradients. Same for the Arch logo — their trademark guidelines generally permit fan/homage use but credit it in the footer.
- **Bundle size:** PDF viewer + xterm + framer motion can blow past 500KB. Route-split so macOS visitors never download xterm and vice versa.
- **SSR:** window manager is client-only. Mark OS shells as `'use client'`; SSR the boot selector shell for fast first paint.
- **Time estimate:** 8–13 focused days for v1 (Phases 0–4). Stretch phase is open-ended.
- **What to cut if short on time:** sound effects, Spotlight, vim-mode, desktop icon drag-persist. Keep the core: boot selection, two OSes, windows, terminal commands, restart loop.

---

## 7. Decisions (locked in)

1. **Domain:** `os.leftcoaststack.com` (subdomain; root stays on main site).
2. **Chatbot:** UI + "coming soon" copy only in v1. No model wired up. Real implementation deferred to Phase 5.
3. **Screenshots:** placeholder art for v1; programmatic capture from company websites in a later polish pass (Phase 4).
4. **Mobile:** no OS experience below 1024px. Simple "Best viewed on desktop" screen with name, email, GitHub, resume download.

## 8. Still Open

- **Sound:** ship boot chime + UI clicks (default-off toggle), or fully silent? Low-cost either way — your call.

Ready to kick off Phase 0 when you give the go.
