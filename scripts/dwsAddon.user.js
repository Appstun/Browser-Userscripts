// ==UserScript==
// @name         DWService Addon
// @namespace    https://github.com/Appstun/TamperMonkey-Scripts
// @version      0.5.19
// @description  Adds quality-of-life features to DWService remote desktop and shell pages. (Works as of 08.07.2026)
// @author       Appstun
//
// @match        https://access.dwservice.net/session.dw*
// @run-at       document-idle
// @grant        none
// @homepageURL  https://github.com/Appstun/TamperMonkey-Scripts
// @supportURL   https://github.com/Appstun/TamperMonkey-Scripts/issues
// @downloadURL  https://raw.githubusercontent.com/Appstun/TamperMonkey-Scripts/main/scripts/dwsAddon.user.js
// @updateURL    https://raw.githubusercontent.com/Appstun/TamperMonkey-Scripts/main/scripts/dwsAddon.user.js
// ==/UserScript==

(function () {
  "use strict";

  const pageWindow = typeof unsafeWindow === "undefined" ? window : unsafeWindow;
  const STORAGE_KEY = "dwstk.shortcuts.v1";
  const SETTINGS_KEY = "dwsa.settings.v1";
  const ROOT_ID = "dwstk-root";
  const SHELL_ROOT_ID = "dwsa-shell-root";
  const FILES_ROOT_ID = "dwsa-files-root";
  const CD_PANEL_ID = "dwsa-cd-panel";
  const PANEL_ID = "dwstk-panel";
  const STYLE_ID = "dwstk-style";
  const SHELL_DARK_STYLE_ID = "dwsa-shell-dark-style";
  const LEGACY_NATIVE_BUTTON_NAMES = ["dwsa-native-cd", "dwsa-native-dark"];
  const LOGIN_FALLBACK_URL = "https://access.dwservice.net/login.dw";
  const MATERIAL_ICONS = {
    add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    arrowUpward: "M4 12l1.41 1.41L11 7.83V20h2V7.83l5.59 5.58L20 12 12 4l-8 8z",
    backspace:
      "M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.12c.36.53.9.88 1.59.88h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z",
    check: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    close: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5-1-1h-5l-1 1H5v2h14V4z",
    download: "M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z",
    edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z",
    refresh:
      "M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h8V3z",
    restartAlt:
      "M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6 0 1.01-.25 1.96-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 13c0-4.42-3.58-8-8-8zm-6 8c0-1.01.25-1.96.7-2.8L5.24 8.74A7.93 7.93 0 0 0 4 13c0 4.42 3.58 8 8 8v4l5-5-5-5v4c-3.31 0-6-2.69-6-6z",
    uploadFile: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-1 3 4 4h-3v4h-2v-4H8l4-4z",
  };

  const DEFAULT_SHORTCUTS = [
    { id: "win-r", label: "Win+R", combo: "Win+R", key: "r", ctrl: false, alt: false, shift: false, command: true },
    { id: "taskmgr", label: "Taskmgr", combo: "Ctrl+Shift+Esc", key: "ESCAPE", ctrl: true, alt: false, shift: true, command: false },
  ];
  const DEFAULT_SHORTCUT_IDS = new Set(DEFAULT_SHORTCUTS.map((shortcut) => shortcut.id));

  const KEY_ALIASES = new Map([
    ["ESC", "ESCAPE"],
    ["ESCAPE", "ESCAPE"],
    ["DEL", "DELETE"],
    ["DELETE", "DELETE"],
    ["ENTF", "DELETE"],
    ["SPACE", "SPACE"],
    ["LEER", "SPACE"],
    ["LEERTASTE", "SPACE"],
    ["TAB", "TAB"],
    ["ENTER", "ENTER"],
    ["RETURN", "ENTER"],
    ["EINGABE", "ENTER"],
    ["SELECT", "SELECT"],
    ["LEFT", "LEFT_ARROW"],
    ["LINKS", "LEFT_ARROW"],
    ["ARROWLEFT", "LEFT_ARROW"],
    ["LEFT_ARROW", "LEFT_ARROW"],
    ["RIGHT", "RIGHT_ARROW"],
    ["RECHTS", "RIGHT_ARROW"],
    ["ARROWRIGHT", "RIGHT_ARROW"],
    ["RIGHT_ARROW", "RIGHT_ARROW"],
    ["UP", "UP_ARROW"],
    ["OBEN", "UP_ARROW"],
    ["ARROWUP", "UP_ARROW"],
    ["UP_ARROW", "UP_ARROW"],
    ["DOWN", "DOWN_ARROW"],
    ["UNTEN", "DOWN_ARROW"],
    ["ARROWDOWN", "DOWN_ARROW"],
    ["DOWN_ARROW", "DOWN_ARROW"],
    ["PAGEUP", "PAGE_UP"],
    ["PGUP", "PAGE_UP"],
    ["PAGE_UP", "PAGE_UP"],
    ["BILDHOCH", "PAGE_UP"],
    ["PAGEDOWN", "PAGE_DOWN"],
    ["PGDN", "PAGE_DOWN"],
    ["PAGE_DOWN", "PAGE_DOWN"],
    ["BILDRUNTER", "PAGE_DOWN"],
    ["HOME", "HOME"],
    ["POS1", "HOME"],
    ["END", "END"],
    ["ENDE", "END"],
    ["PLUS", "+"],
    ["MINUS", "-"],
    ["COMMA", ","],
    ["DOT", "."],
    ["PERIOD", "."],
    ["SEMICOLON", ";"],
  ]);

  const MOD_ALIASES = new Map([
    ["CTRL", "ctrl"],
    ["CONTROL", "ctrl"],
    ["STRG", "ctrl"],
    ["ALT", "alt"],
    ["OPTION", "alt"],
    ["SHIFT", "shift"],
    ["UMSCHALT", "shift"],
    ["WIN", "command"],
    ["WINDOWS", "command"],
    ["CMD", "command"],
    ["COMMAND", "command"],
    ["META", "command"],
    ["SUPER", "command"],
    ["SUP", "command"],
  ]);

  const SYMBOL_KEYS = new Set("|@#\\/{}[]_^'\"<>:;,.+-".split(""));
  const COMBO_SEPARATOR_RE = /[+\uFF0B\uFE62]/;
  const INVISIBLE_CHARS_RE = /[\u00a0\u200b-\u200d\ufeff]/g;
  let root = null;
  let shellRoot = null;
  let filesRoot = null;
  let cdPanel = null;
  let panel = null;
  let shortcuts = loadShortcuts();
  let settings = loadSettings();
  let editId = null;
  let statusTimer = null;
  let ensureTimer = null;
  let shellRenderRetryTimer = null;
  let cdPollTimer = null;
  let cdHelperTimer = null;
  let cdIgnoreOutsideUntil = 0;
  let cdState = {
    mode: "auto",
    path: ".",
    resolvedPath: "",
    dirs: [],
    filter: "",
    marker: "",
    loading: false,
    helperOpening: false,
    originalTab: "",
    helperTab: "",
    originalMode: "",
    helperMode: "",
    status: "CD öffnet eine eigene Hilfs-Shell.",
    error: false,
  };

  function loadShortcuts() {
    const fallback = DEFAULT_SHORTCUTS.map(cloneShortcut);
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (!value) return fallback;
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return fallback;
      return parsed.map(normalizeStoredShortcut).filter(Boolean);
    } catch (_) {
      return fallback;
    }
  }

  function saveShortcuts() {
    const value = JSON.stringify(shortcuts);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {}
  }

  function loadSettings() {
    const fallback = { shellDarkMode: true };
    try {
      const value = localStorage.getItem(SETTINGS_KEY);
      if (!value) return fallback;
      const parsed = JSON.parse(value);
      return { ...fallback, ...parsed, shellDarkMode: parsed.shellDarkMode !== false };
    } catch (_) {
      return fallback;
    }
  }

  function saveSettings() {
    const value = JSON.stringify(settings);
    try {
      localStorage.setItem(SETTINGS_KEY, value);
    } catch (_) {}
  }

  function initExpiredSessionHandling() {
    setupExpiredSessionButton();
  }

  function setupExpiredSessionButton() {
    if (!isExpiredSessionPage()) return false;
    const button = findExpiredRefreshButton();
    if (!button || button.dataset.dwsaExpiredHandler === "1") return true;
    button.dataset.dwsaExpiredHandler = "1";
    button.textContent = "Zur Anmeldeseite";
    button.title = "Zur DWService-Loginseite";
    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        location.assign(LOGIN_FALLBACK_URL);
      },
      true,
    );
    return true;
  }

  function isExpiredSessionPage() {
    const text = String((document.body && document.body.innerText) || "");
    return /\bSession expired\.?\b/i.test(text) && /\bRefresh\b/i.test(text);
  }

  function findExpiredRefreshButton() {
    return [...document.querySelectorAll("button,input[type='button'],a")].find((el) =>
      /\bRefresh\b/i.test((el.innerText || el.value || el.textContent || "").trim()),
    );
  }

  function cloneShortcut(shortcut) {
    return { ...shortcut };
  }

  function normalizeStoredShortcut(shortcut) {
    if (!shortcut || (!shortcut.key && shortcut.special !== "CTRLALTCANC")) return null;
    const key = shortcut.key ? normalizeKey(String(shortcut.key)) : "";
    return {
      id: shortcut.id || makeId(),
      key,
      label: String(shortcut.label || shortcut.combo || formatCombo({ ...shortcut, key })).trim() || "Shortcut",
      combo: String(shortcut.combo || formatCombo({ ...shortcut, key })).trim(),
      ctrl: !!shortcut.ctrl,
      alt: !!shortcut.alt,
      shift: !!shortcut.shift,
      command: !!shortcut.command,
      special: shortcut.special === "CTRLALTCANC" ? "CTRLALTCANC" : undefined,
    };
  }

  function makeId() {
    return `sc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function ensureMounted() {
    if (setupExpiredSessionButton()) return;
    ensureDesktopShortcuts();
    ensureShellFeatures();
    ensureFilesFeatures();
  }

  function scheduleEnsureMounted() {
    if (ensureTimer) return;
    ensureTimer = setTimeout(() => {
      ensureTimer = null;
      ensureMounted();
    }, 500);
  }

  function onDomMutations(mutations) {
    setupExpiredSessionButton();
    if (mutations.every(isTerminalOnlyMutation)) {
      if (shellRoot && /ready:false/.test(shellRoot.dataset.dwsaVersion || "")) scheduleShellRenderRetry();
      return;
    }
    scheduleEnsureMounted();
  }

  function isTerminalOnlyMutation(mutation) {
    const target = mutation && mutation.target;
    if (!target || target.nodeType !== 1 || typeof target.closest !== "function") return false;
    return !!target.closest(".xterm-rows, .xterm-screen, .xterm-viewport, .xterm-helper-textarea, #dwsa-shell-dark-style");
  }

  function ensureDesktopShortcuts() {
    const desktop = getActiveDesktop();
    const toolbar = desktop && findDesktopToolbar(desktop);
    if (!toolbar) {
      unmountRoot();
      return;
    }
    root = ensureToolbarHost(root, toolbar, ROOT_ID, onRootClick);
    injectStyle();
    renderRoot();
  }

  function ensureShellFeatures() {
    const shell = getShellComponent();
    const toolbar = findShellToolbar(shell);
    if (!shell && !toolbar) {
      hideShellFeatures();
      return;
    }
    if (shell) cleanupLegacyNativeShellButtons(shell);
    if (!toolbar) {
      if (!isTopAppActive("Shell")) unmountShellRoot();
      applyShellDarkMode();
      return;
    }
    shellRoot = ensureToolbarHost(shellRoot, toolbar, SHELL_ROOT_ID, onShellRootClick);
    injectStyle();
    renderShellRoot();
    if (!hasShellSession()) setTimeout(scheduleEnsureMounted, 700);
    applyShellDarkMode();
  }

  function ensureFilesFeatures() {
    const files = getActiveFiles();
    const toolbar = files && findFilesToolbar(files);
    if (!toolbar) {
      unmountFilesRoot();
      return;
    }
    filesRoot = ensureFilesToolbarHost(filesRoot, toolbar, FILES_ROOT_ID, onFilesRootClick);
    injectStyle();
    renderFilesRoot();
  }

  function ensureToolbarHost(host, toolbar, id, onClick) {
    let node = host;
    if (!node || !node.isConnected) {
      node = document.createElement("div");
      node.id = id;
      node.addEventListener("click", onClick, true);
    }
    if (node.parentElement !== toolbar) toolbar.appendChild(node);
    node.hidden = false;
    node.style.display = "";
    return node;
  }

  function ensureFilesToolbarHost(host, toolbar, id, onClick) {
    let node = host;
    if (!node || !node.isConnected) {
      node = document.createElement("div");
      node.id = id;
      node.addEventListener("click", onClick, true);
    }
    const parent = toolbar && toolbar.parentElement;
    if (parent && node.parentElement !== parent) parent.insertBefore(node, toolbar.nextSibling);
    else if (parent && node.previousElementSibling !== toolbar) parent.insertBefore(node, toolbar.nextSibling);
    node.hidden = false;
    node.style.display = "";
    return node;
  }

  function hideShellFeatures() {
    unmountShellRoot();
    applyShellDarkMode();
  }

  function unmountRoot() {
    closePanel();
    if (root) root.remove();
    root = null;
  }

  function unmountShellRoot() {
    if (!shellRoot) return;
    closeCdPanel();
    clearShellRenderRetry();
    shellRoot.remove();
    shellRoot = null;
  }

  function unmountFilesRoot() {
    if (filesRoot) filesRoot.remove();
    filesRoot = null;
  }

  function getActiveDesktop() {
    const main = getMain();
    const app = main && main._apps && main._apps.desktop;
    const desktop = app && app.component;
    if (main && main._current !== "desktop") return null;
    return desktop && desktop.common && typeof desktop.common.sendKeyboard === "function" ? desktop : null;
  }

  function getShellComponent() {
    const main = getMain();
    const app = main && main._apps && main._apps.shell;
    return (app && app.component) || null;
  }

  function getActiveFiles() {
    const main = getMain();
    const app = main && main._apps && main._apps.filesystem;
    const files = app && app.component;
    if (main && typeof main._current === "string") {
      if (main._current !== "filesystem") return null;
    } else if (!isTopAppActive("Dateien und Ordner")) return null;
    return files || { __dwsaDomOnly: true };
  }

  function getMain() {
    const dws = pageWindow.dws;
    return dws && typeof dws.getGlobalObject === "function" ? dws.getGlobalObject("main") : null;
  }

  function findDesktopToolbar(desktop) {
    const toolbarComponent = desktop.getComponentsByName && desktop.getComponentsByName("toolbar")[0];
    const toolbarElement = getComponentElement(toolbarComponent);
    if (toolbarElement && isVisible(toolbarElement)) return toolbarElement;
    const desktopElement = getComponentElement(desktop);
    const bars = [...document.querySelectorAll('[id$="_toolbar"], [id*="_toolbar"]')].filter(isVisible);
    if (desktopElement) {
      const scoped = bars.find((el) => desktopElement.contains(el) && isDesktopToolbarElement(el));
      if (scoped) return scoped;
    }
    return bars.find(isDesktopToolbarElement) || null;
  }

  function findShellToolbar(shell) {
    const toolbarComponent = shell && shell.getComponentsByName && shell.getComponentsByName("toolbar")[0];
    const toolbarElement = getComponentElement(toolbarComponent);
    if (toolbarElement && isVisible(toolbarElement)) return toolbarElement;
    const shellElement = getComponentElement(shell) || [...document.querySelectorAll('[id$="_shell"], [id*="_shell"]')].find(isVisible);
    const bars = [...document.querySelectorAll('[id$="_toolbar"], [id*="_toolbar"]')].filter(isVisible);
    if (shellElement) {
      const scoped = bars.find((el) => shellElement.contains(el) && isShellToolbarElement(el));
      if (scoped) return scoped;
    }
    return bars.find(isShellToolbarElement) || null;
  }

  function findFilesToolbar(files) {
    const toolbarComponent = files && files.getComponentsByName && files.getComponentsByName("toolbar")[0];
    const toolbarElement = getComponentElement(toolbarComponent);
    if (toolbarElement && isVisible(toolbarElement)) return toolbarElement;
    const filesElement =
      getComponentElement(files) || [...document.querySelectorAll('[id$="_filesystem"], [id*="_filesystem"]')].find(isVisible);
    const bars = [...document.querySelectorAll('[id$="_toolbar"], [id*="_toolbar"]')].filter(isVisible);
    if (filesElement) {
      const scoped = bars.find((el) => filesElement.contains(el) && isFilesToolbarElement(el));
      if (scoped) return scoped;
    }
    return bars.find(isFilesToolbarElement) || null;
  }

  function isTopAppActive(label) {
    return [...document.querySelectorAll("div,span")].some((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.y > 55 || rect.height < 18 || cleanText(el) !== label) return false;
      const style = getComputedStyle(el);
      const weight = parseInt(style.fontWeight, 10) || 400;
      return weight >= 600 || style.backgroundColor === "rgb(36, 60, 95)";
    });
  }

  function cleanupLegacyNativeShellButtons(shell) {
    const toolbar = findShellToolbarComponent(shell);
    if (toolbar) removeNativeToolbarButtons(toolbar, LEGACY_NATIVE_BUTTON_NAMES);
  }

  function findShellToolbarComponent(shell) {
    const named = shell && shell.getComponentsByName && shell.getComponentsByName("toolbar")[0];
    if (isToolbarComponent(named)) return named;
    const toolbarElement = findShellToolbar(shell);
    return findToolbarComponent(shell, toolbarElement) || findToolbarComponent(shell, null);
  }

  function findToolbarComponent(component, toolbarElement, depth = 0) {
    if (!component || depth > 4) return null;
    if (isToolbarComponent(component)) {
      const element = getComponentElement(component);
      if (!toolbarElement || element === toolbarElement || (element && toolbarElement && element.id === toolbarElement.id))
        return component;
    }
    if (typeof component.getComponentCount !== "function" || typeof component.getComponent !== "function") return null;
    for (let index = 0; index < component.getComponentCount(); index += 1) {
      const found = findToolbarComponent(component.getComponent(index), toolbarElement, depth + 1);
      if (found) return found;
    }
    return null;
  }

  function isToolbarComponent(component) {
    return (
      !!component &&
      typeof component.addComponent === "function" &&
      typeof component.removeComponent === "function" &&
      typeof component.getOrientation === "function"
    );
  }

  function removeNativeToolbarButtons(toolbar, names) {
    if (!toolbar || typeof toolbar.getComponentCount !== "function" || typeof toolbar.getComponent !== "function") return;
    const remove = [];
    for (let index = 0; index < toolbar.getComponentCount(); index += 1) {
      const component = toolbar.getComponent(index);
      if (component && component.getName && names.includes(component.getName())) remove.push(component);
    }
    remove.forEach((component) => removeNativeToolbarButton(toolbar, component));
  }

  function removeNativeToolbarButton(toolbar, button) {
    if (!toolbar || !button || typeof toolbar.removeComponent !== "function") return;
    try {
      if (!button.getParent || button.getParent() === toolbar) toolbar.removeComponent(button, true);
    } catch (_) {}
  }

  function isDesktopToolbarElement(el) {
    const rect = el.getBoundingClientRect();
    if (rect.y > 140 || rect.height < 25) return false;
    const inputs = [...el.querySelectorAll("input")].filter(isVisible);
    const buttons = [...el.querySelectorAll('[id$="_button"], [id*="_button"]')].filter(isVisible);
    const iconClasses = [...el.querySelectorAll('[class*="IconsNEW_"]')].map((node) => node.className).join(" ");
    return inputs.length >= 2 && buttons.length >= 5 && /IconsNEW_(19|20|21|23|24|25|27|30|37)/.test(iconClasses);
  }

  function isShellToolbarElement(el) {
    const rect = el.getBoundingClientRect();
    if (rect.y > 140 || rect.height < 25) return false;
    const inputs = [...el.querySelectorAll("input")].filter(isVisible);
    const buttons = [...el.querySelectorAll('[id$="_button"], [id*="_button"]')].filter(isVisible);
    const iconClasses = [...el.querySelectorAll('[class*="IconsNEW_"]')].map((node) => node.className).join(" ");
    return (
      inputs.length === 0 &&
      buttons.length >= 1 &&
      /TAB|CR/.test(el.innerText || el.textContent || "") &&
      /IconsNEW_(19|20|21|22|23|24|26|41|42|43|44|45)/.test(iconClasses)
    );
  }

  function isFilesToolbarElement(el) {
    const rect = el.getBoundingClientRect();
    if (rect.y > 140 || rect.height < 25) return false;
    const inputs = [...el.querySelectorAll("input")].filter(isVisible);
    const buttons = [...el.querySelectorAll('[id$="_button"], [id*="_button"]')].filter(isVisible);
    const iconClasses = [...el.querySelectorAll('[class*="IconsNEW_"]')].map((node) => node.className).join(" ");
    return inputs.length === 0 && buttons.length >= 2 && /IconsNEW_(39|51|19|20|31|33|34|35|36)/.test(iconClasses);
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
  }

  function renderRoot(force) {
    if (!root) return;
    const version = shortcuts.map((item) => `${item.id}:${item.label}:${item.combo}`).join("|");
    if (!force && root.dataset.dwstkVersion === version) return;
    root.dataset.dwstkVersion = version;
    root.innerHTML = "";

    const manageBtn = button({ text: "+", title: "Shortcut-Buttons verwalten", className: "dwstk-icon-btn", action: "open" });
    root.appendChild(manageBtn);

    const list = document.createElement("div");
    list.className = "dwstk-toolbar-list";
    shortcuts.forEach((shortcut) => {
      const btn = button({
        text: shortcut.label,
        title: `Senden: ${shortcut.combo}`,
        className: "dwstk-shortcut-btn",
        action: "send",
        id: shortcut.id,
      });
      list.appendChild(btn);
    });
    root.appendChild(list);
  }

  function renderShellRoot() {
    if (!shellRoot) return;
    const currentTerminal = getCurrentShellTerminal();
    const terminalReady = hasShellSession();
    const currentShellLabel = getShellTerminalLabel(currentTerminal);
    const version = `shell-dark:${settings.shellDarkMode}|current:${currentShellLabel || "-"}|ready:${terminalReady}`;
    if (terminalReady) clearShellRenderRetry();
    else scheduleShellRenderRetry();
    if (shellRoot.dataset.dwsaVersion === version) return;
    shellRoot.dataset.dwsaVersion = version;
    shellRoot.innerHTML = "";
    const cdBtn = button({
      text: "CD",
      title: currentShellLabel ? `Ordner wechseln für ${currentShellLabel}` : "Ordner wechseln",
      className: "dwsa-shell-btn",
      action: "open-cd",
      disabled: !terminalReady,
    });
    shellRoot.appendChild(cdBtn);
    const btn = button({
      text: "Dark",
      title: settings.shellDarkMode ? "Shell Dark Mode ausschalten" : "Shell Dark Mode einschalten",
      className: `dwsa-shell-btn ${settings.shellDarkMode ? "dwsa-active" : ""}`,
      action: "toggle-shell-dark",
    });
    shellRoot.appendChild(btn);
  }

  function scheduleShellRenderRetry() {
    if (shellRenderRetryTimer || !shellRoot || !isTopAppActive("Shell")) return;
    shellRenderRetryTimer = setTimeout(() => {
      shellRenderRetryTimer = null;
      if (!shellRoot || !isTopAppActive("Shell")) return;
      shellRoot.dataset.dwsaVersion = "";
      renderShellRoot();
    }, 350);
  }

  function clearShellRenderRetry() {
    clearTimeout(shellRenderRetryTimer);
    shellRenderRetryTimer = null;
  }

  function hasShellSession() {
    return !!(getCurrentShellTerminal() || getActiveTerminal() || getShellTabs().length);
  }

  function renderFilesRoot() {
    if (!filesRoot) return;
    const path = getCurrentFilesPath();
    filesRoot.hidden = !path;
    const version = `path:${path || "-"}`;
    if (filesRoot.dataset.dwsaVersion === version) return;
    filesRoot.dataset.dwsaVersion = version;
    filesRoot.innerHTML = "";
    if (!path) return;
    filesRoot.appendChild(
      button({ text: "Pfad", title: `Aktuellen Pfad kopieren: ${path}`, className: "dwsa-files-btn", action: "copy-files-path" }),
    );
    filesRoot.appendChild(
      button({ text: "Shell", title: `In Shell öffnen: ${path}`, className: "dwsa-files-btn", action: "open-files-shell" }),
    );
  }

  function button({ text, title, className, action, id, disabled }) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = `dwstk-btn ${className || ""}`.trim();
    el.textContent = text;
    el.title = title || "";
    el.dataset.dwstkAction = action;
    if (id) el.dataset.dwstkId = id;
    if (disabled) el.disabled = true;
    return el;
  }

  function onRootClick(event) {
    const trigger = event.target.closest("[data-dwstk-action]");
    if (!trigger || !root.contains(trigger)) return;
    event.preventDefault();
    event.stopPropagation();
    const action = trigger.dataset.dwstkAction;
    if (action === "open") return togglePanel();
    if (action === "send") return sendById(trigger.dataset.dwstkId);
  }

  function onShellRootClick(event) {
    const trigger = event.target.closest("[data-dwstk-action]");
    if (!trigger || !shellRoot.contains(trigger)) return;
    event.preventDefault();
    event.stopPropagation();
    if (trigger.disabled) return;
    if (trigger.dataset.dwstkAction === "toggle-shell-dark") {
      settings = { ...settings, shellDarkMode: !settings.shellDarkMode };
      saveSettings();
      renderShellRoot();
      applyShellDarkMode();
      return;
    }
    if (trigger.dataset.dwstkAction === "open-cd") return toggleCdPanel();
  }

  function onFilesRootClick(event) {
    const trigger = event.target.closest("[data-dwstk-action]");
    if (!trigger || !filesRoot.contains(trigger)) return;
    event.preventDefault();
    event.stopPropagation();
    if (trigger.disabled) return;
    const action = trigger.dataset.dwstkAction;
    if (action === "copy-files-path") return copyCurrentFilesPath();
    if (action === "open-files-shell") return openCurrentFilesPathInShell();
  }

  function applyShellDarkMode() {
    const existing = document.getElementById(SHELL_DARK_STYLE_ID);
    if (!settings.shellDarkMode) {
      if (existing) removeNode(existing);
      return;
    }
    const css = shellDarkCss();
    if (existing) {
      if (existing.textContent !== css) existing.textContent = css;
      return;
    }
    const style = document.createElement("style");
    style.id = SHELL_DARK_STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function getCurrentFilesPath() {
    const componentPath = getCurrentFilesComponentPath();
    if (componentPath) return normalizeFilesPath(componentPath);
    return normalizeFilesPath(getCurrentFilesDomPath());
  }

  function getCurrentFilesComponentPath() {
    try {
      const files = getActiveFiles();
      const current = files && typeof files.getCurrent === "function" ? files.getCurrent() : null;
      return current && typeof current.getCurrentPath === "function" ? current.getCurrentPath() : "";
    } catch (_) {
      return "";
    }
  }

  function getCurrentFilesDomPath() {
    const files = getActiveFiles();
    const filesElement = getComponentElement(files) || document.querySelector('[id$="_filesystem"], [id*="_filesystem"]');
    const selectorbars = [...document.querySelectorAll('[id$="_selectorbar"], [id*="_selectorbar"]')].filter(isVisible);
    const scoped = filesElement ? selectorbars.filter((el) => filesElement.contains(el)) : selectorbars;
    const bar = scoped
      .map((el) => ({ el, rect: el.getBoundingClientRect(), text: cleanText(el) }))
      .filter((item) => item.rect.y >= 45 && item.rect.y < 95 && item.text && !/^Dateien und Ordner|Shell|Bildschirm$/.test(item.text))
      .sort((a, b) => b.rect.x - a.rect.x)[0];
    return bar ? selectorbarPathText(bar.el) : "";
  }

  function selectorbarPathText(bar) {
    const parts = [...bar.querySelectorAll("div,span")]
      .filter((el) => el.children.length === 0 && isVisible(el))
      .map(cleanText)
      .filter((text) => text && text !== "Quellen" && !/^[×x]$/.test(text));
    const unique = parts.filter((part, index) => parts.indexOf(part) === index);
    if (/^[A-Z]:$/i.test(unique[0] || "")) return unique.join("\\");
    if (unique[0] === "/") return `/${unique.slice(1).join("/")}`.replace(/\/+$/, "") || "/";
    return unique.join("/");
  }

  function normalizeFilesPath(path) {
    const value = String(path || "").trim();
    if (!value || value === "$" || value === "Quellen") return "";
    if (/^[A-Z]:$/i.test(value)) return `${value}\\`;
    return value;
  }

  function copyCurrentFilesPath() {
    const path = getCurrentFilesPath();
    if (!path) return;
    copyText(path);
    flashToolbarButton(filesRoot, "copy-files-path", "Kopiert");
  }

  function copyText(text) {
    try {
      if (navigator.clipboard) void navigator.clipboard.writeText(text).catch(() => {});
    } catch (_) {}
  }

  function openCurrentFilesPathInShell() {
    const path = getCurrentFilesPath();
    if (!path) return;
    openShellAndSendCd(path, Date.now() + 10000);
  }

  function openShellAndSendCd(path, deadline) {
    const main = getMain();
    try {
      if (main && typeof main.loadApp === "function") main.loadApp("shell");
    } catch (_) {}
    scheduleEnsureMounted();
    const terminalText = getTerminalText();
    const terminalReady = !!(getCurrentShellTerminal() || getActiveTerminal());
    const shellReady = isTopAppActive("Shell") && terminalReady && isShellPromptReady(terminalText);
    if (shellReady) {
      const mode = resolveShellCdModeForPath(path, terminalText, false);
      if (!mode && Date.now() <= deadline) return setTimeout(() => openShellAndSendCd(path, deadline), 300);
      if (!mode) {
        flashToolbarButton(filesRoot, "open-files-shell", "Fehler", true);
        return;
      }
      sendTerminalText(buildCdCommand(mode, path));
      flashToolbarButton(filesRoot, "open-files-shell", "Geöffnet");
      return;
    }
    if (Date.now() > deadline) {
      flashToolbarButton(filesRoot, "open-files-shell", "Fehler", true);
      return;
    }
    setTimeout(() => openShellAndSendCd(path, deadline), 300);
  }

  function resolveShellCdModeForPath(path, terminalText, allowFallback) {
    return detectCdMode(terminalText, "") || inferCdModeFromPath(path) || getRemoteDefaultCdMode() || (allowFallback ? "posix" : "");
  }

  function isShellPromptReady(text) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    return lines
      .slice(-60)
      .some(
        (line) =>
          /PS\s+.+>\s*$/i.test(line) || /[A-Z]:\\[^>\r\n]*>\s*$/i.test(line) || (/[^>\r\n]*[$#]\s*$/.test(line) && !/[A-Z]:\\/.test(line)),
      );
  }

  function flashToolbarButton(host, action, text, isError) {
    const btn = host && host.querySelector(`[data-dwstk-action="${action}"]`);
    if (!btn) return;
    const oldText = btn.textContent;
    btn.textContent = text;
    btn.classList.toggle("dwsa-error", !!isError);
    setTimeout(() => {
      if (!btn.isConnected) return;
      btn.textContent = oldText;
      btn.classList.remove("dwsa-error");
    }, 1200);
  }

  function removeNode(node) {
    if (node && typeof node.remove === "function") node.remove();
    else if (node && node.parentNode) node.parentNode.removeChild(node);
  }

  function shellDarkCss() {
    return `
      :is([id$="_shell"], [id*="_shell"]) :is(.terminal, .xterm, .xterm-screen, .xterm-rows, .xterm-viewport, [id$="_terminal"], [id*="_terminal"]) {
        background: #0c0f14 !important;
        background-color: #0c0f14 !important;
      }
      :is([id$="_shell"], [id*="_shell"]) :is(.terminal, .xterm, .xterm-screen, .xterm-rows, [id$="_terminal"], [id*="_terminal"]) {
        color: #d6deeb !important;
      }
      :is([id$="_shell"], [id*="_shell"]) .xterm-rows span:not([class*="xterm-fg-"]) {
        color: #d6deeb !important;
      }
      :is([id$="_shell"], [id*="_shell"]) .xterm-helper-textarea {
        background: transparent !important;
        color: #d6deeb !important;
      }
      :is([id$="_shell"], [id*="_shell"]) .xterm-cursor {
        border-color: #d6deeb !important;
        opacity: 1 !important;
      }
      :is([id$="_shell"], [id*="_shell"]) .terminal.xterm[class*="xterm-dom-renderer-owner-"] .xterm-rows .xterm-cursor.xterm-cursor-block,
      :is([id$="_shell"], [id*="_shell"]) .terminal.xterm[class*="xterm-dom-renderer-owner-"] .xterm-rows .xterm-cursor.xterm-cursor-block:not(.xterm-cursor-blink),
      :is([id$="_shell"], [id*="_shell"]) :is(.xterm.focus, .terminal.focus) .xterm-rows .xterm-cursor.xterm-cursor-block,
      :is([id$="_shell"], [id*="_shell"]) .xterm-rows.xterm-focus .xterm-cursor.xterm-cursor-block {
        background: #d6deeb !important;
        background-color: #d6deeb !important;
        border-color: #d6deeb !important;
        box-shadow: none !important;
        color: #0c0f14 !important;
        opacity: 1 !important;
      }
      :is([id$="_shell"], [id*="_shell"]) .terminal.xterm[class*="xterm-dom-renderer-owner-"] .xterm-rows .xterm-cursor.xterm-cursor-outline,
      :is([id$="_shell"], [id*="_shell"]) .xterm-cursor-layer .xterm-cursor-outline {
        background-color: transparent !important;
        outline: 1px solid #d6deeb !important;
        outline-offset: -1px !important;
        box-shadow: none !important;
      }
      :is([id$="_shell"], [id*="_shell"]) .terminal.xterm[class*="xterm-dom-renderer-owner-"] .xterm-rows .xterm-cursor.xterm-cursor-bar {
        box-shadow: 1px 0 0 #d6deeb inset !important;
      }
      :is([id$="_shell"], [id*="_shell"]) .terminal.xterm[class*="xterm-dom-renderer-owner-"] .xterm-rows .xterm-cursor.xterm-cursor-underline {
        border-bottom-color: #d6deeb !important;
      }
    `;
  }

  function toggleCdPanel() {
    if (cdPanel && cdPanel.isConnected) return closeCdPanel();
    openCdPanel();
  }

  function openCdPanel() {
    closeCdPanel();
    resetCdState();
    cdPanel = document.createElement("div");
    cdPanel.id = CD_PANEL_ID;
    cdPanel.addEventListener("submit", onCdPanelSubmit);
    cdPanel.addEventListener("click", onCdPanelClick);
    cdPanel.addEventListener("change", onCdPanelChange);
    cdPanel.addEventListener("input", onCdPanelInput);
    document.body.appendChild(cdPanel);
    positionCdPanel();
    renderCdPanel();
    document.addEventListener("click", closeCdPanelOnOutside, true);
    document.addEventListener("keydown", closeCdPanelOnEscape, true);
    openHelperConsole();
  }

  function closeCdPanel(options) {
    document.removeEventListener("click", closeCdPanelOnOutside, true);
    document.removeEventListener("keydown", closeCdPanelOnEscape, true);
    clearTimeout(cdPollTimer);
    clearTimeout(cdHelperTimer);
    cdPollTimer = null;
    cdHelperTimer = null;
    if (!options || !options.keepHelper) closeHelperConsole();
    if (cdPanel) cdPanel.remove();
    cdPanel = null;
  }

  function resetCdState() {
    clearTimeout(cdPollTimer);
    clearTimeout(cdHelperTimer);
    cdPollTimer = null;
    cdHelperTimer = null;
    cdState = {
      ...cdState,
      path: ".",
      resolvedPath: "",
      dirs: [],
      filter: "",
      marker: "",
      loading: false,
      helperOpening: false,
      originalTab: "",
      helperTab: "",
      originalMode: "",
      helperMode: "",
      status: "Oeffne Hilfs-Shell...",
      error: false,
    };
  }

  function closeCdPanelOnOutside(event) {
    if (Date.now() < cdIgnoreOutsideUntil) return;
    const anchor = getShellFeatureAnchor();
    if (cdPanel && !cdPanel.contains(event.target) && !(anchor && anchor.contains(event.target))) closeCdPanel();
  }

  function closeCdPanelOnEscape(event) {
    if (event.key === "Escape") closeCdPanel();
  }

  function positionCdPanel() {
    const anchor = getShellFeatureAnchor();
    if (!cdPanel || !anchor) return;
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(520, Math.max(360, window.innerWidth - 16));
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    cdPanel.style.left = `${left}px`;
    cdPanel.style.top = `${Math.min(rect.bottom + 6, window.innerHeight - 120)}px`;
    cdPanel.style.width = `${width}px`;
  }

  function getShellFeatureAnchor() {
    return shellRoot;
  }

  function openHelperConsole() {
    const tabs = getShellTabs();
    const current = getCurrentShellTerminal();
    const currentLabel = getShellTerminalLabel(current);
    const active = tabs.find((tab) => tab.label === currentLabel) || tabs.find((tab) => tab.active) || tabs[0];
    const originalLabel = currentLabel || (active ? active.label : "");
    const before = new Set(tabs.map((tab) => tab.label));
    if (originalLabel) before.add(originalLabel);
    const originalText = getTerminalText();
    const originalMode = detectCdMode(originalText, "");
    const helperMode = cdState.mode === "auto" ? "" : cdState.mode;
    const originalPath = detectCurrentPath(originalText, originalMode);
    const startPath = originalPath || cdState.path || ".";
    cdState = {
      ...cdState,
      path: startPath,
      resolvedPath: originalPath || cdState.resolvedPath,
      originalTab: originalLabel,
      originalMode,
      helperMode,
      helperOpening: true,
      status: "Oeffne Hilfs-Shell...",
      error: false,
    };
    renderCdPanel();
    if (!clickNewShellTab()) {
      cdState = { ...cdState, helperOpening: false, status: "Neuer Shell-Tab konnte nicht geöffnet werden.", error: true };
      renderCdPanel();
      return;
    }
    waitForHelperConsole(before, Date.now() + 8000);
  }

  function waitForHelperConsole(before, deadline) {
    clearTimeout(cdHelperTimer);
    const currentTabs = getShellTabs();
    const currentLabel = getShellTerminalLabel(getCurrentShellTerminal());
    const apiHelper = currentLabel && currentLabel !== cdState.originalTab ? { label: currentLabel } : null;
    const helper =
      apiHelper ||
      currentTabs.find((tab) => !before.has(tab.label)) ||
      currentTabs.find((tab) => tab.active && tab.label !== cdState.originalTab);
    if (helper) {
      selectShellTab(helper.label);
      cdState = { ...cdState, helperTab: helper.label, status: `Hilfs-Shell ${helper.label} startet...`, error: false };
      renderCdPanel();
      waitForHelperTerminal(deadline);
      return;
    }
    if (Date.now() > deadline) {
      cdState = { ...cdState, helperOpening: false, status: "Hilfs-Shell wurde nicht gefunden.", error: true };
      renderCdPanel();
      return;
    }
    cdHelperTimer = setTimeout(() => waitForHelperConsole(before, deadline), 250);
  }

  function waitForHelperTerminal(deadline) {
    clearTimeout(cdHelperTimer);
    if (cdState.helperTab) selectShellTab(cdState.helperTab);
    const terminal = getActiveTerminal();
    if (terminal && terminal.querySelector(".xterm-helper-textarea")) {
      const helperMode = resolveHelperCdMode(false);
      if (!helperMode && Date.now() <= deadline) {
        cdState = { ...cdState, status: `Warte auf Hilfs-Shell ${cdState.helperTab}...`, error: false };
        renderCdPanel();
        cdHelperTimer = setTimeout(() => waitForHelperTerminal(deadline), 300);
        return;
      }
      const mode = helperMode || getCdPathMode() || "posix";
      cdState = {
        ...cdState,
        helperMode: mode,
        helperOpening: false,
        status: `Hilfs-Shell ${cdState.helperTab} bereit (${mode}).`,
        error: false,
      };
      renderCdPanel();
      refreshCdPanel();
      return;
    }
    if (Date.now() > deadline) {
      cdState = { ...cdState, helperOpening: false, status: "Hilfs-Shell-Terminal wurde nicht bereit.", error: true };
      renderCdPanel();
      return;
    }
    cdHelperTimer = setTimeout(() => waitForHelperTerminal(deadline), 300);
  }

  function closeHelperConsole() {
    if (!cdState.helperTab) return;
    closeShellTab(cdState.helperTab);
    cdState = { ...cdState, helperTab: "", helperOpening: false };
  }

  function selectShellTab(label) {
    const target = getShellTerminalByLabel(label);
    if (target && target.tab && typeof target.tab.setSelectedComponent === "function") {
      target.tab.setSelectedComponent(target.component);
      try {
        if (target.component && typeof target.component.focus === "function") target.component.focus();
      } catch (_) {}
      return true;
    }
    const tab = getShellTabs().find((item) => item.label === label);
    if (!tab) return false;
    clickElement(tab.element);
    return true;
  }

  function closeShellTab(label) {
    const target = getShellTerminalByLabel(label);
    if (target && target.shell && typeof target.shell.closeTerminal === "function") {
      target.shell.closeTerminal(target.component);
      return true;
    }
    const tab = getShellTabs().find((item) => item.label === label);
    if (!tab) return false;
    if (tab.close) {
      clickElement(tab.close);
      return true;
    }
    clickElement(tab.element);
    const active = getShellTabs().find((item) => item.label === label);
    if (active && active.close) {
      clickElement(active.close);
      return true;
    }
    return false;
  }

  function clickNewShellTab() {
    const shell = getShellComponent();
    if (shell && typeof shell.openNewTerminal === "function") {
      shell.openNewTerminal();
      return true;
    }
    const icons = [...document.querySelectorAll('[class*="IconsNEW_19"], [class*="IconsNEW_26"]')].filter(isVisible);
    const icon =
      icons.find((item) => {
        const toolbar = item.closest('[id$="_toolbar"], [id*="_toolbar"]');
        return toolbar && isShellToolbarElement(toolbar);
      }) || icons[0];
    if (!icon) return false;
    clickElement(icon);
    return true;
  }

  function getShellTerminalByLabel(label) {
    try {
      const shell = getShellComponent();
      const tab = shell && (shell.cmpTab || (typeof shell.getComponentsByName === "function" && shell.getComponentsByName("shellTab")[0]));
      if (!tab || typeof tab.getComponentCount !== "function" || typeof tab.getComponent !== "function") return null;
      for (let index = 0; index < tab.getComponentCount(); index += 1) {
        const component = tab.getComponent(index);
        if (getShellTerminalLabel(component) === label) return { shell, tab, component };
      }
    } catch (_) {}
    return null;
  }

  function getShellTerminalLabel(component) {
    try {
      if (!component) return "";
      const id = typeof component.getIdShell === "function" ? component.getIdShell() : component.idshell;
      return component.title || (id != null ? `id:${id}` : "");
    } catch (_) {
      return "";
    }
  }

  function getCurrentShellTerminal() {
    try {
      const shell = getShellComponent();
      return shell && typeof shell.getCurrent === "function" ? shell.getCurrent() : null;
    } catch (_) {
      return null;
    }
  }

  function getShellTabs() {
    const activeLabel = getShellTerminalLabel(getCurrentShellTerminal());
    const candidates = [...document.querySelectorAll("div")].filter(isVisible).filter((el) => {
      const text = cleanText(el);
      const rect = el.getBoundingClientRect();
      return /^id:\d+$/.test(text) && rect.width <= 180 && rect.height <= 45;
    });
    const byLabel = new Map();
    candidates.forEach((el) => {
      const label = cleanText(el);
      const current = byLabel.get(label);
      if (!current || area(el) < area(current)) byLabel.set(label, el);
    });
    return [...byLabel.entries()]
      .map(([label, leaf]) => {
        const element = findShellTabContainer(leaf);
        const close = element && [...element.querySelectorAll('[class*="IconsNEW_30"]')].find(isVisible);
        return {
          label,
          element: element || leaf,
          close,
          active: label === activeLabel || !!(element && /\bdws_ui_styleclass_8\b/.test(String(element.className || ""))),
        };
      })
      .sort((a, b) => a.element.getBoundingClientRect().left - b.element.getBoundingClientRect().left);
  }

  function findShellTabContainer(leaf) {
    let node = leaf;
    for (let i = 0; node && i < 4; i += 1, node = node.parentElement) {
      const rect = node.getBoundingClientRect();
      if (rect.width <= 180 && rect.height <= 45 && node.querySelector('[class*="IconsNEW_30"]')) return node;
    }
    return leaf.parentElement || leaf;
  }

  function clickElement(el) {
    cdIgnoreOutsideUntil = Date.now() + 800;
    const rect = el.getBoundingClientRect();
    const base = { bubbles: true, cancelable: true, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
    if (typeof el.click === "function") {
      try {
        el.click();
        return;
      } catch (_) {}
    }
    const view = document.defaultView && document.defaultView.window === document.defaultView ? document.defaultView : null;
    ["mousedown", "mouseup", "click"].forEach((type) => {
      try {
        el.dispatchEvent(new MouseEvent(type, view ? { ...base, view } : base));
      } catch (_) {
        el.dispatchEvent(new MouseEvent(type, base));
      }
    });
  }

  function area(el) {
    const rect = el.getBoundingClientRect();
    return rect.width * rect.height;
  }

  function cleanText(el) {
    return String((el && (el.innerText || el.textContent)) || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function renderCdPanel() {
    if (!cdPanel) return;
    const helperReady = !!cdState.helperTab && !cdState.helperOpening;
    const canApply = helperReady && !!cdState.originalTab && !cdState.loading;
    const filter = String(cdState.filter || "").trim();
    const filterNeedle = filter.toLocaleLowerCase();
    const visibleDirs = filterNeedle ? cdState.dirs.filter((dir) => dir.toLocaleLowerCase().includes(filterNeedle)) : cdState.dirs;
    const emptyText = cdState.loading ? "Laden..." : cdState.dirs.length && filterNeedle ? "Keine Treffer." : "Keine Ordner gefunden.";
    const dirs = visibleDirs.length
      ? visibleDirs
          .map(
            (dir) => `
          <button type="button" class="dwsa-cd-row" data-cd-action="enter" data-name="${escapeAttr(dir)}" title="${escapeAttr(dir)}">
            <span>${escapeHtml(dir)}</span>
          </button>
        `,
          )
          .join("")
      : `<div class="dwsa-cd-empty">${emptyText}</div>`;
    cdPanel.innerHTML = `
      <div class="dwsa-cd-head">
        <strong>Ordner wechseln</strong>
        ${iconButtonHtml({ cls: "dwsa-cd-close dwsa-icon-only", actionAttr: "data-cd-action", action: "close", title: "Schließen", icon: "close" })}
      </div>
      <form class="dwsa-cd-form">
        <label>Pfad<input name="path" autocomplete="off" value="${escapeAttr(cdState.resolvedPath || cdState.path || ".")}"></label>
        <label>Modus
          <select name="mode">
            ${renderModeOption("auto", "Auto")}
            ${renderModeOption("cmd", "Windows CMD")}
            ${renderModeOption("powershell", "PowerShell")}
            ${renderModeOption("posix", "Linux/macOS")}
          </select>
        </label>
        <div class="dwsa-cd-actions">
          ${iconButtonHtml({ actionAttr: "data-cd-action", action: "up", title: "Eine Ebene hoch", icon: "arrowUpward", text: "", disabled: !helperReady || cdState.loading })}
          ${iconButtonHtml({ type: "submit", title: "Ordner neu laden", icon: "refresh", text: "", disabled: !helperReady || cdState.loading })}
          ${iconButtonHtml({ actionAttr: "data-cd-action", action: "apply", title: cdState.originalTab ? "Pfad in Original-Shell übernehmen" : "Keine Original-Shell gefunden", icon: "check", text: "Übernehmen", disabled: !canApply })}
        </div>
      </form>
      <div class="dwsa-cd-summary">
        <div class="dwsa-cd-summary-text">
          <div class="dwsa-cd-meta">Original: ${escapeHtml(cdState.originalTab || "-")} / Hilfs-Shell: ${escapeHtml(cdState.helperTab || (cdState.helperOpening ? "öffnet..." : "-"))}</div>
          <div class="dwsa-cd-status ${cdState.error ? "dwsa-error" : ""}">${escapeHtml(cdState.status || "")}</div>
        </div>
        <input class="dwsa-cd-filter" name="filter" autocomplete="off" placeholder="Suche" value="${escapeAttr(cdState.filter || "")}">
      </div>
      <div class="dwsa-cd-list">${dirs}</div>
    `;
  }

  function renderModeOption(value, label) {
    return `<option value="${value}" ${cdState.mode === value ? "selected" : ""}>${label}</option>`;
  }

  function onCdPanelSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const mode = form.elements.mode.value;
    cdState = { ...cdState, path: form.elements.path.value.trim() || ".", mode, helperMode: mode === "auto" ? "" : mode };
    refreshCdPanel();
  }

  function onCdPanelChange(event) {
    if (!event.target.matches('select[name="mode"]')) return;
    cdState = { ...cdState, mode: event.target.value, helperMode: event.target.value === "auto" ? "" : event.target.value };
  }

  function onCdPanelInput(event) {
    if (!event.target.matches('input[name="filter"]')) return;
    const value = event.target.value;
    const form = cdPanel && cdPanel.querySelector("form");
    cdState = {
      ...cdState,
      filter: value,
      path: form && form.elements.path ? form.elements.path.value.trim() || "." : cdState.path,
      mode: form && form.elements.mode ? form.elements.mode.value : cdState.mode,
    };
    renderCdPanel();
    const input = cdPanel && cdPanel.querySelector('input[name="filter"]');
    if (input) {
      input.focus();
      try {
        input.setSelectionRange(value.length, value.length);
      } catch (_) {}
    }
  }

  function onCdPanelClick(event) {
    const trigger = event.target.closest("[data-cd-action]");
    if (!trigger || !cdPanel.contains(trigger)) return;
    event.preventDefault();
    event.stopPropagation();
    const action = trigger.dataset.cdAction;
    const form = cdPanel.querySelector("form");
    if (form) {
      const mode = form.elements.mode.value;
      cdState = { ...cdState, path: form.elements.path.value.trim() || ".", mode, helperMode: mode === "auto" ? cdState.helperMode : mode };
    }
    if (action === "close") return closeCdPanel();
    if (action === "up") {
      const path = parentPath(cdState.resolvedPath || cdState.path);
      cdState = { ...cdState, path, resolvedPath: path, dirs: [], status: "Lade Parent...", error: false };
      renderCdPanel();
      refreshCdPanel();
      return;
    }
    if (action === "enter") {
      const path = joinPath(cdState.resolvedPath || cdState.path, trigger.dataset.name || "");
      cdState = { ...cdState, path, resolvedPath: path, dirs: [], status: "Lade Ordner...", error: false };
      renderCdPanel();
      refreshCdPanel();
      return;
    }
    if (action === "apply") return applyCdPath();
  }

  function refreshCdPanel() {
    if (!cdState.helperTab) {
      cdState = { ...cdState, loading: false, status: "Hilfs-Shell ist noch nicht bereit.", error: true };
      renderCdPanel();
      return;
    }
    if (!selectShellTab(cdState.helperTab)) {
      cdState = { ...cdState, loading: false, status: "Hilfs-Shell wurde nicht gefunden.", error: true };
      renderCdPanel();
      return;
    }
    if (!getActiveTerminal()) {
      cdState = { ...cdState, loading: false, status: "Hilfs-Shell hat noch kein Terminal.", error: true };
      renderCdPanel();
      return;
    }
    const path = getCdPanelPath();
    cdState = { ...cdState, path };
    const mode = resolveHelperCdMode(path);
    const marker = `__DWSA_CD_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}__`;
    const command = buildListCommand(mode, path, marker);
    cdState = { ...cdState, path, helperMode: mode, loading: true, marker, dirs: [], status: `Lese Ordner (${mode})...`, error: false };
    renderCdPanel();
    try {
      sendTerminalText(command);
      pollCdResult(marker, Date.now() + 8000);
    } catch (error) {
      cdState = { ...cdState, loading: false, status: error.message || String(error), error: true };
      renderCdPanel();
    }
  }

  function pollCdResult(marker, deadline) {
    clearTimeout(cdPollTimer);
    const parsed = parseCdOutput(marker);
    if (parsed.done || Date.now() > deadline) {
      cdState = {
        ...cdState,
        loading: false,
        marker: "",
        resolvedPath: parsed.path || cdState.path,
        dirs: parsed.dirs,
        status: parsed.done ? `${parsed.dirs.length} Ordner gefunden.` : "Timeout beim Lesen der Shell-Ausgabe.",
        error: !parsed.done,
      };
      renderCdPanel();
      return;
    }
    cdPollTimer = setTimeout(() => pollCdResult(marker, deadline), 350);
  }

  function parseCdOutput(marker) {
    const text = getTerminalText();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const start = lines.findIndex((line) => line.startsWith(`${marker}:BEGIN`));
    const after = lines.slice(start + 1);
    const end = after.findIndex((line) => line.startsWith(`${marker}:END`));
    const block = start >= 0 ? (end >= 0 ? after.slice(0, end) : after) : lines;
    const dirs = [];
    let path = "";
    block.forEach((line) => {
      if (line.startsWith(`${marker}:PWD:`)) path = line.slice(marker.length + 5).trim();
      if (line.startsWith(`${marker}:DIR:`)) {
        const dir = line.slice(marker.length + 5).trim();
        if (dir && dir !== "%D") dirs.push(dir);
      }
    });
    return { done: lines.some((line) => line.startsWith(`${marker}:END`)), path, dirs: uniqueSorted(dirs) };
  }

  function applyCdPath() {
    const path = getCdPanelPath();
    const originalTab = cdState.originalTab;
    if (!originalTab) {
      cdState = { ...cdState, path, resolvedPath: path, status: "Keine Original-Shell gefunden.", error: true };
      renderCdPanel();
      return;
    }
    cdState = { ...cdState, path, resolvedPath: path, status: "Schliesse Hilfs-Shell und sende cd...", error: false };
    renderCdPanel();
    closeHelperConsole();
    setTimeout(() => {
      try {
        if (originalTab && !selectShellTab(originalTab)) throw new Error("Original-Shell wurde nicht gefunden.");
        const mode = resolveOriginalCdMode();
        cdState = { ...cdState, originalMode: mode, status: `Sende cd (${mode})...`, error: false };
        renderCdPanel();
        sendTerminalText(buildCdCommand(mode, path));
        closeCdPanel({ keepHelper: true });
      } catch (error) {
        cdState = { ...cdState, status: error.message || String(error), error: true };
        renderCdPanel();
      }
    }, 650);
  }

  function getActiveTerminal() {
    const terminals = [...document.querySelectorAll(".terminal.xterm, .terminal, .xterm")].filter(isVisible);
    return terminals.find((el) => /\bfocus\b/.test(String(el.className || ""))) || terminals[terminals.length - 1] || null;
  }

  function sendTerminalText(text) {
    if (sendTerminalTextViaDwservice(text)) return;

    const terminal = getActiveTerminal();
    if (!terminal) throw new Error("Keine aktive Shell gefunden.");
    const textarea = terminal.querySelector(".xterm-helper-textarea") || document.querySelector(".xterm-helper-textarea");
    if (!textarea) throw new Error("Shell-Eingabe nicht gefunden.");
    clickElement(terminal.querySelector(".xterm-screen") || terminal);
    if (typeof textarea.focus === "function") textarea.focus();

    if (dispatchTerminalPaste(textarea, text)) return;
    dispatchTerminalInput(textarea, text);
  }

  function sendTerminalTextViaDwservice(text) {
    try {
      const shell = getShellComponent();
      const current = getCurrentShellTerminal();
      if (!shell || !current) return false;
      if (typeof current.sendInput === "function") {
        current.sendInput(text);
        flushShellInput(shell);
        return true;
      }
      const id = typeof current.getIdShell === "function" ? current.getIdShell() : current.idshell;
      if (id != null && typeof shell.sendInput === "function") {
        shell.sendInput(id, text);
        flushShellInput(shell);
        return true;
      }
    } catch (_) {}
    return false;
  }

  function flushShellInput(shell) {
    try {
      if (shell && typeof shell.send === "function") shell.send(true);
    } catch (_) {}
  }

  function dispatchTerminalPaste(textarea, text) {
    try {
      const ClipboardEventCtor = pageWindow.ClipboardEvent || ClipboardEvent;
      const DataTransferCtor = pageWindow.DataTransfer || DataTransfer;
      if (typeof ClipboardEventCtor !== "function" || typeof DataTransferCtor !== "function") return false;
      const data = new DataTransferCtor();
      data.setData("text/plain", text);
      textarea.dispatchEvent(new ClipboardEventCtor("paste", { bubbles: true, cancelable: true, composed: true, clipboardData: data }));
      return true;
    } catch (_) {
      return false;
    }
  }

  function dispatchTerminalInput(textarea, text) {
    try {
      textarea.value = text;
      const InputEventCtor = pageWindow.InputEvent || InputEvent;
      const EventCtor = pageWindow.Event || Event;
      const event =
        typeof InputEventCtor === "function"
          ? new InputEventCtor("input", { bubbles: true, composed: true, inputType: "insertText", data: text })
          : new EventCtor("input", { bubbles: true, composed: true });
      textarea.dispatchEvent(event);
      return true;
    } catch (_) {
      return false;
    }
  }

  function getTerminalText() {
    const bufferText = getTerminalBufferText();
    if (bufferText) return bufferText;
    const terminal = getActiveTerminal();
    const rows = terminal ? terminal.querySelector(".xterm-rows") : document.querySelector(".xterm-rows");
    if (!rows) return "";
    const lineNodes = [...rows.querySelectorAll(":scope > div")];
    if (lineNodes.length) return lineNodes.map((row) => row.textContent || "").join("\n");
    return rows.textContent || "";
  }

  function getTerminalBufferText() {
    try {
      const current = getCurrentShellTerminal();
      const buffer = current && current._xterm && current._xterm.buffer && current._xterm.buffer.active;
      if (!buffer || typeof buffer.getLine !== "function") return "";
      const length = Number(buffer.length) || 0;
      const lines = [];
      const start = Math.max(0, length - 1000);
      for (let index = start; index < length; index += 1) {
        const line = buffer.getLine(index);
        if (line && typeof line.translateToString === "function") lines.push(line.translateToString(true));
      }
      return lines.join("\n");
    } catch (_) {
      return "";
    }
  }

  function getCdPanelPath() {
    const input = cdPanel && cdPanel.querySelector('input[name="path"]');
    return (input && input.value.trim()) || cdState.resolvedPath || cdState.path || ".";
  }

  function getCdPathMode(path = getCdPanelPath()) {
    return (
      inferCdModeFromPath(path) ||
      inferCdModeFromPath(cdState.resolvedPath) ||
      inferCdModeFromPath(cdState.path) ||
      getRemoteDefaultCdMode()
    );
  }

  function resolveHelperCdMode(pathOrAllowFallback, maybeAllowFallback) {
    const path = typeof pathOrAllowFallback === "string" ? pathOrAllowFallback : getCdPanelPath();
    const allowFallback = typeof pathOrAllowFallback === "boolean" ? pathOrAllowFallback : maybeAllowFallback !== false;
    if (cdState.mode && cdState.mode !== "auto") return cdState.mode;
    const hinted = getCdPathMode(path);
    if (hinted) return hinted;
    const detected = detectCdMode(getTerminalText(), "");
    if (detected) return detected;
    return allowFallback ? cdState.helperMode || "posix" : cdState.helperMode || "";
  }

  function resolveOriginalCdMode() {
    const detected = detectCdMode(getTerminalText(), "");
    return detected || cdState.originalMode || getCdPathMode() || "posix";
  }

  function inferCdModeFromPath(path) {
    const value = String(path || "").trim();
    if (/^[A-Z]:(?:[\\/]|$)/i.test(value) || /^\\\\/.test(value)) return "cmd";
    if (value.startsWith("/")) return "posix";
    return "";
  }

  function getRemoteDefaultCdMode() {
    try {
      const dws = pageWindow.dws;
      const os = dws && typeof dws.getGlobalObject === "function" ? String(dws.getGlobalObject("ostype") || "") : "";
      if (/win/i.test(os)) return "cmd";
      if (/linux|mac|darwin|unix|bsd|posix/i.test(os)) return "posix";
    } catch (_) {}
    return "";
  }

  function detectCdMode(text, fallback = "posix") {
    const source = String(text || "");
    const lines = source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const start = Math.max(0, lines.length - 60);
    for (let index = lines.length - 1; index >= start; index -= 1) {
      const line = lines[index];
      if (/^PS\s+.+>\s*$/i.test(line)) return "powershell";
      if (/^[A-Z]:\\[^>\r\n]*>\s*$/i.test(line)) return "cmd";
      if (/^[^>\r\n]*[$#]\s*$/.test(line) && !/[A-Z]:\\/.test(line)) return "posix";
    }
    if (/(^|\n)\s*PS\s+[^>\r\n]+>/i.test(source) || /Windows PowerShell|PowerShell/i.test(source)) return "powershell";
    if (/[A-Z]:\\[^>\n]*>\s*$/i.test(source) || /(^|\n)\s*[A-Z]:\\[^>\n]*>/i.test(source) || /Microsoft Windows|cmd\.exe/i.test(source))
      return "cmd";
    if (/(^|\n).*[#$]\s*$/m || /Linux|Darwin|\/bin\/(?:ba)?sh|busybox/i.test(source)) return "posix";
    return fallback;
  }

  function detectCurrentPath(text, mode) {
    const source = String(text || "");
    const matches = [];
    const collect = (re) => {
      let match;
      while ((match = re.exec(source))) matches.push({ index: match.index, value: match[1].trim() });
    };
    if (!mode || mode === "powershell") collect(/(?:^|\n)\s*PS\s+([^>\r\n]+)>/gi);
    if (!mode || mode === "cmd") collect(/(?:^|\n)\s*([A-Z]:\\[^>\r\n]*)>/gi);
    matches.sort((a, b) => a.index - b.index);
    return matches.length ? matches[matches.length - 1].value : "";
  }

  function buildListCommand(mode, path, marker) {
    if (mode === "powershell") {
      const p = psQuote(path || ".");
      const m = psQuote(marker);
      return `$target=(Resolve-Path -LiteralPath ${p} -ErrorAction SilentlyContinue).ProviderPath; Write-Output (${m}+':BEGIN'); if($target){Set-Location -LiteralPath $target; Write-Output (${m}+':PWD:'+(Get-Location).ProviderPath); Get-ChildItem -LiteralPath . -Directory -Force -ErrorAction SilentlyContinue | ForEach-Object { Write-Output (${m}+':DIR:'+$_.Name) }}; Write-Output (${m}+':END')\r`;
    }
    if (mode === "cmd") {
      const p = cmdQuote(path || ".");
      return `echo ${marker}:BEGIN\rcd /d ${p} 2>nul\rfor %I in (.) do @echo ${marker}:PWD:%~fI\rfor /f "delims=" %D in ('dir /b /ad 2^>nul') do @echo ${marker}:DIR:%D\recho ${marker}:END\r`;
    }
    const p = shQuote(path || ".");
    const m = shQuote(marker);
    return `m=${m}; p=${p}; printf '%s\\n' "$m:BEGIN"; cd -- "$p" 2>/dev/null && printf '%s\\n' "$m:PWD:$(pwd -P)" && find . -maxdepth 1 -mindepth 1 -type d -exec basename {} \\; 2>/dev/null | sed "s/^/$m:DIR:/"; printf '%s\\n' "$m:END"\r`;
  }

  function buildCdCommand(mode, path) {
    if (mode === "powershell") return `Set-Location -LiteralPath ${psQuote(path || ".")}\r`;
    if (mode === "cmd") return `cd /d ${cmdQuote(path || ".")}\r`;
    return `cd -- ${shQuote(path || ".")}\r`;
  }

  function psQuote(value) {
    return `'${String(value).replace(/'/g, "''")}'`;
  }

  function shQuote(value) {
    return `'${String(value).replace(/'/g, "'\\''")}'`;
  }

  function cmdQuote(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
  }

  function joinPath(base, name) {
    if (!name) return base || ".";
    const b = base || ".";
    if (/^[A-Z]:\\?$/i.test(b)) return `${b.replace(/\\?$/, "\\")}${name}`;
    if (b === "/" || b.endsWith("/")) return `${b}${name}`;
    if (b.endsWith("\\") || b.endsWith(":")) return `${b}${name}`;
    return b.includes("\\") ? `${b}\\${name}` : `${b}/${name}`;
  }

  function parentPath(path) {
    const value = String(path || ".").replace(/[\\/]+$/, "");
    if (!value || value === "." || value === "/" || /^[A-Z]:$/i.test(value)) return value || ".";
    const sep = value.includes("\\") ? "\\" : "/";
    const index = value.lastIndexOf(sep);
    if (index <= 0) return sep === "\\" ? value : "/";
    if (sep === "\\" && /^[A-Z]:\\?$/i.test(value.slice(0, index + 1))) return value.slice(0, index + 1);
    return value.slice(0, index) || ".";
  }

  function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  function sendById(id) {
    const shortcut = shortcuts.find((item) => item.id === id);
    if (!shortcut) return;
    try {
      sendShortcut(shortcut);
      setStatus(`Gesendet: ${shortcut.combo}`);
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  }

  function sendShortcut(shortcut) {
    const desktop = getActiveDesktop();
    const common = desktop && desktop.common;
    if (!common || typeof common.sendKeyboard !== "function") throw new Error("DWService-Desktop ist noch nicht bereit.");
    if (typeof common.isConnect === "function" && !common.isConnect()) throw new Error("DWService ist nicht verbunden.");

    if (shortcut.special === "CTRLALTCANC") common.sendKeyboard("CTRLALTCANC", "", false, false, false, false);
    else if (!shortcut.ctrl && !shortcut.alt && !shortcut.shift && !shortcut.command && shortcut.key.length === 1)
      common.sendKeyboard("CHAR", shortcut.key.charCodeAt(0), false, false, false, false);
    else common.sendKeyboard("KEY", shortcut.key, !!shortcut.ctrl, !!shortcut.alt, !!shortcut.shift, !!shortcut.command);

    try {
      if (desktop.cmpDraw && typeof desktop.cmpDraw.focus === "function") desktop.cmpDraw.focus();
    } catch (_) {}
  }

  function getComponentElement(component) {
    if (!component) return null;
    const candidates = [
      component.domNode,
      component._layout && component._layout.getElement && component._layout.getElement(),
      component._layout && component._layout.domNode,
      component._layout && component._layout._element,
      component._layout && component._layout.element,
      component._element,
      component.element,
    ];
    return candidates.find((el) => el && el.nodeType === 1) || null;
  }

  function togglePanel() {
    if (panel && panel.isConnected) return closePanel();
    openPanel();
  }

  function openPanel() {
    closePanel();
    panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.addEventListener("submit", onPanelSubmit);
    panel.addEventListener("click", onPanelClick);
    panel.addEventListener("change", onPanelChange);
    document.body.appendChild(panel);
    positionPanel();
    renderPanel();
    document.addEventListener("click", closePanelOnOutside, true);
    document.addEventListener("keydown", closePanelOnEscape, true);
  }

  function closePanel() {
    document.removeEventListener("click", closePanelOnOutside, true);
    document.removeEventListener("keydown", closePanelOnEscape, true);
    if (panel) panel.remove();
    panel = null;
    editId = null;
  }

  function closePanelOnOutside(event) {
    if (panel && !panel.contains(event.target) && root && !root.contains(event.target)) closePanel();
  }

  function closePanelOnEscape(event) {
    if (event.key === "Escape") closePanel();
  }

  function positionPanel() {
    if (!panel || !root) return;
    const rect = root.getBoundingClientRect();
    const width = Math.min(390, Math.max(320, window.innerWidth - 16));
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    panel.style.left = `${left}px`;
    panel.style.top = `${Math.min(rect.bottom + 6, window.innerHeight - 80)}px`;
    panel.style.width = `${width}px`;
  }

  function renderPanel() {
    if (!panel) return;
    const editing = shortcuts.find((item) => item.id === editId);
    panel.innerHTML = `
      <div class="dwstk-panel-head">
        <strong>Shortcut-Buttons</strong>
        ${iconButtonHtml({ cls: "dwstk-panel-close dwsa-icon-only", actionAttr: "data-panel-action", action: "close", title: "Schließen", icon: "close" })}
      </div>
      <div class="dwstk-status" data-dwstk-status></div>
      <div class="dwstk-list">${shortcuts.map(renderShortcutRow).join("")}</div>
      <form class="dwstk-form">
        <input type="hidden" name="id" value="${escapeAttr(editing ? editing.id : "")}">
        <label>Label<input name="label" autocomplete="off" placeholder="z.B. Win+R" value="${escapeAttr(editing ? editing.label : "")}"></label>
        <label>Kombination<input name="combo" autocomplete="off" required placeholder="z.B. Ctrl+Shift+Esc" value="${escapeAttr(editing ? editing.combo : "")}"></label>
        <div class="dwstk-help">Beispiele: Win+R, Ctrl+Alt+Del, Alt+Tab, F5, Space, a</div>
        <div class="dwstk-actions">
          <div class="dwstk-action-group dwstk-transfer-actions">
            ${iconButtonHtml({ actionAttr: "data-panel-action", action: "export", title: "Custom-Shortcuts als JSON exportieren", icon: "download", text: "" })}
            ${iconButtonHtml({ actionAttr: "data-panel-action", action: "import", title: "Custom-Shortcuts aus JSON importieren", icon: "uploadFile", text: "" })}
            <input type="file" accept="application/json,.json" data-dwstk-import hidden>
          </div>
          <div class="dwstk-action-group">
            ${iconButtonHtml({ type: "submit", cls: "dwstk-save", title: editing ? "Shortcut aktualisieren" : "Shortcut hinzufügen", icon: editing ? "check" : "add", text: editing ? "Speichern" : "Hinzufügen" })}
            ${iconButtonHtml({ actionAttr: "data-panel-action", action: "cancel", title: editing ? "Bearbeitung abbrechen" : "Formular leeren", icon: editing ? "close" : "backspace", text: "" })}
            ${iconButtonHtml({ actionAttr: "data-panel-action", action: "reset", title: "Defaults wiederherstellen", icon: "restartAlt", text: "" })}
          </div>
        </div>
      </form>
    `;
  }

  function renderShortcutRow(shortcut) {
    return `
      <div class="dwstk-row" data-id="${escapeAttr(shortcut.id)}">
        <button type="button" class="dwstk-row-main" data-panel-action="send" data-id="${escapeAttr(shortcut.id)}" title="Jetzt senden">
          <span>${escapeHtml(shortcut.label)}</span>
          <small>${escapeHtml(shortcut.combo)}</small>
        </button>
        ${iconButtonHtml({ cls: "dwstk-row-icon dwsa-icon-only", actionAttr: "data-panel-action", action: "edit", id: shortcut.id, title: "Bearbeiten", icon: "edit" })}
        ${iconButtonHtml({ cls: "dwstk-row-icon dwsa-icon-only", actionAttr: "data-panel-action", action: "delete", id: shortcut.id, title: "Löschen", icon: "delete" })}
      </div>
    `;
  }

  function onPanelSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const comboInput = form.elements.combo.value.trim();
    const labelInput = form.elements.label.value.trim();
    try {
      const parsed = parseCombo(comboInput);
      const id = form.elements.id.value || makeId();
      const shortcut = { id, label: labelInput || parsed.combo, ...parsed };
      const index = shortcuts.findIndex((item) => item.id === id);
      if (index >= 0) shortcuts[index] = shortcut;
      else shortcuts.push(shortcut);
      editId = null;
      saveShortcuts();
      renderRoot(true);
      renderPanel();
      setStatus("Gespeichert.");
    } catch (error) {
      setStatus(error.message || String(error), true);
    }
  }

  function onPanelClick(event) {
    const trigger = event.target.closest("[data-panel-action]");
    if (!trigger || !panel.contains(trigger)) return;
    event.preventDefault();
    event.stopPropagation();
    const action = trigger.dataset.panelAction;
    const id = trigger.dataset.id;
    if (action === "close") return closePanel();
    if (action === "cancel") {
      editId = null;
      renderPanel();
      return;
    }
    if (action === "reset") {
      shortcuts = DEFAULT_SHORTCUTS.map(cloneShortcut);
      editId = null;
      saveShortcuts();
      renderRoot(true);
      renderPanel();
      setStatus("Defaults wiederhergestellt.");
      return;
    }
    if (action === "edit") {
      editId = id;
      renderPanel();
      return;
    }
    if (action === "delete") {
      shortcuts = shortcuts.filter((item) => item.id !== id);
      if (editId === id) editId = null;
      saveShortcuts();
      renderRoot(true);
      renderPanel();
      setStatus("Gelöscht.");
      return;
    }
    if (action === "export") {
      exportShortcuts();
      return;
    }
    if (action === "import") {
      const input = panel.querySelector("[data-dwstk-import]");
      if (input) input.click();
      return;
    }
    if (action === "send") sendById(id);
  }

  function onPanelChange(event) {
    if (!event.target.matches("[data-dwstk-import]")) return;
    importShortcuts(event.target.files && event.target.files[0]);
    event.target.value = "";
  }

  function exportShortcuts() {
    const customShortcuts = shortcuts.filter((shortcut) => !DEFAULT_SHORTCUT_IDS.has(shortcut.id)).map(toExportShortcut);
    const payload = { version: 1, exportedAt: new Date().toISOString(), shortcuts: customShortcuts };
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dwservice-shortcuts-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(`Exportiert: ${customShortcuts.length} Custom-Shortcut${customShortcuts.length === 1 ? "" : "s"}.`);
  }

  function importShortcuts(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseImportPayload(String(reader.result || ""));
        const byId = new Map(shortcuts.map((shortcut) => [shortcut.id, shortcut]));
        imported.forEach((shortcut) => byId.set(shortcut.id, shortcut));
        shortcuts = [...byId.values()];
        editId = null;
        saveShortcuts();
        renderRoot(true);
        renderPanel();
        setStatus(`Importiert: ${imported.length} Custom-Shortcut${imported.length === 1 ? "" : "s"}.`);
      } catch (error) {
        setStatus(error.message || String(error), true);
      }
    };
    reader.onerror = () => setStatus("Import fehlgeschlagen: Datei konnte nicht gelesen werden.", true);
    reader.readAsText(file);
  }

  function parseImportPayload(text) {
    const payload = JSON.parse(text);
    const source = Array.isArray(payload) ? payload : payload && payload.shortcuts;
    if (!Array.isArray(source)) throw new Error("Import erwartet JSON mit shortcuts-Array.");
    const imported = source
      .map(normalizeStoredShortcut)
      .filter(Boolean)
      .filter((shortcut) => !DEFAULT_SHORTCUT_IDS.has(shortcut.id));
    if (!imported.length) throw new Error("Keine Custom-Shortcuts im JSON gefunden.");
    return imported;
  }

  function toExportShortcut(shortcut) {
    const exported = {
      id: shortcut.id,
      label: shortcut.label,
      combo: shortcut.combo,
      key: shortcut.key,
      ctrl: !!shortcut.ctrl,
      alt: !!shortcut.alt,
      shift: !!shortcut.shift,
      command: !!shortcut.command,
    };
    if (shortcut.special) exported.special = shortcut.special;
    return exported;
  }

  function parseCombo(input) {
    const parts = input.split(COMBO_SEPARATOR_RE).map(normalizeToken).filter(Boolean);
    if (!parts.length) throw new Error("Bitte eine Kombination eingeben.");

    const shortcut = { key: "", ctrl: false, alt: false, shift: false, command: false };
    const keyParts = [];
    const modifierParts = [];
    for (const part of parts) {
      const upper = tokenKey(part);
      const mod = MOD_ALIASES.get(upper);
      if (mod) {
        shortcut[mod] = true;
        modifierParts.push(part);
      } else keyParts.push(part);
    }
    if (keyParts.length !== 1) {
      const found = parts.join(", ");
      const keys = keyParts.length ? keyParts.join(", ") : "keine";
      const mods = modifierParts.length ? modifierParts.join(", ") : "keine";
      throw new Error(`Bitte genau eine Taste verwenden. Erkannt: ${found}. Modifier: ${mods}. Tasten: ${keys}.`);
    }

    shortcut.key = normalizeKey(keyParts[0]);
    if (shortcut.ctrl && shortcut.alt && shortcut.key === "DELETE") shortcut.special = "CTRLALTCANC";
    shortcut.combo = formatCombo(shortcut);
    return shortcut;
  }

  function normalizeKey(key) {
    const raw = normalizeToken(key);
    if (!raw) throw new Error("Taste fehlt.");
    const upper = tokenKey(raw);
    if (/^F([1-9]|1[0-2])$/.test(upper)) return upper;
    if (/^[A-Z]$/.test(upper)) return upper.toLowerCase();
    if (/^[0-9]$/.test(upper)) return upper;
    if (KEY_ALIASES.has(upper)) return KEY_ALIASES.get(upper);
    if (raw.length === 1 && SYMBOL_KEYS.has(raw)) return raw;
    throw new Error(`Nicht unterstützte Taste: ${raw}`);
  }

  function normalizeToken(value) {
    return String(value || "")
      .replace(INVISIBLE_CHARS_RE, "")
      .trim();
  }

  function tokenKey(value) {
    return normalizeToken(value).toUpperCase().replace(/\s+/g, "");
  }

  function formatCombo(shortcut) {
    if (shortcut.special === "CTRLALTCANC") return "Ctrl+Alt+Del";
    const parts = [];
    if (shortcut.command) parts.push("Win");
    if (shortcut.ctrl) parts.push("Ctrl");
    if (shortcut.alt) parts.push("Alt");
    if (shortcut.shift) parts.push("Shift");
    parts.push(displayKey(shortcut.key));
    return parts.join("+");
  }

  function displayKey(key) {
    const display = {
      ESCAPE: "Esc",
      DELETE: "Del",
      SPACE: "Space",
      TAB: "Tab",
      ENTER: "Enter",
      LEFT_ARROW: "Left",
      RIGHT_ARROW: "Right",
      UP_ARROW: "Up",
      DOWN_ARROW: "Down",
      PAGE_UP: "PageUp",
      PAGE_DOWN: "PageDown",
      HOME: "Home",
      END: "End",
    };
    if (/^[a-z]$/.test(key)) return key.toUpperCase();
    return display[key] || key;
  }

  function setStatus(message, isError) {
    if (panel) {
      const status = panel.querySelector("[data-dwstk-status]");
      if (status) {
        status.textContent = message;
        status.classList.toggle("dwstk-error", !!isError);
      }
    }
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      if (!panel) return;
      const status = panel.querySelector("[data-dwstk-status]");
      if (status) {
        status.textContent = "";
        status.classList.remove("dwstk-error");
      }
    }, 2500);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function iconButtonHtml({
    type = "button",
    cls = "",
    actionAttr = "",
    action = "",
    id = "",
    title = "",
    icon = "",
    text = "",
    disabled = false,
  }) {
    const attrs = [
      `type="${escapeAttr(type)}"`,
      `class="dwsa-icon-button ${escapeAttr(cls)}"`,
      `title="${escapeAttr(title)}"`,
      `aria-label="${escapeAttr(title || text)}"`,
    ];
    if (actionAttr && action) attrs.push(`${actionAttr}="${escapeAttr(action)}"`);
    if (id) attrs.push(`data-id="${escapeAttr(id)}"`);
    if (disabled) attrs.push("disabled");
    return `<button ${attrs.join(" ")}>${materialIconHtml(icon, text)}</button>`;
  }

  function materialIconHtml(name, text = "") {
    const path = MATERIAL_ICONS[name];
    const label = text ? `<span>${escapeHtml(text)}</span>` : "";
    return `${path ? `<svg class="dwsa-mi" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${path}"></path></svg>` : ""}${label}`;
  }

  function injectStyle() {
    const existing = document.getElementById(STYLE_ID);
    const css = `
      #${ROOT_ID} {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 34px;
        margin-left: 4px;
        min-width: 0;
        font-family: Montserrat, Arial, sans-serif;
        pointer-events: auto;
      }
      #${ROOT_ID} .dwstk-toolbar-list {
        display: flex;
        align-items: center;
        gap: 4px;
        max-width: min(520px, 36vw);
        overflow-x: auto;
        scrollbar-width: thin;
      }
      #${ROOT_ID} .dwstk-btn,
      #${FILES_ROOT_ID} .dwstk-btn,
      #${PANEL_ID} button,
      #${CD_PANEL_ID} button {
        border: 1px solid #b9c3d8;
        border-radius: 3px;
        background: #ffffff;
        color: #152238;
        cursor: pointer;
        font: 600 12px/1 Montserrat, Arial, sans-serif;
        white-space: nowrap;
      }
      #${ROOT_ID} .dwstk-btn {
        height: 28px;
        padding: 0 8px;
      }
      #${SHELL_ROOT_ID} {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 34px;
        margin-left: 4px;
        min-width: 0;
        font-family: Montserrat, Arial, sans-serif;
        pointer-events: auto;
      }
      #${FILES_ROOT_ID} {
        display: flex;
        align-items: center;
        flex: 0 0 auto;
        gap: 4px;
        height: 41px;
        margin-left: 4px;
        padding-right: 4px;
        background: #f2f2f2;
        font-family: Montserrat, Arial, sans-serif;
        pointer-events: auto;
      }
      #${SHELL_ROOT_ID}[hidden],
      #${FILES_ROOT_ID}[hidden] {
        display: none !important;
      }
      #${FILES_ROOT_ID} .dwstk-btn,
      #${SHELL_ROOT_ID} .dwstk-btn {
        height: 28px;
        padding: 0 9px;
        border: 1px solid #b9c3d8;
        border-radius: 3px;
        background: #ffffff;
        color: #152238;
        cursor: pointer;
        font: 600 12px/1 Montserrat, Arial, sans-serif;
        white-space: nowrap;
      }
      #${SHELL_ROOT_ID} .dwstk-btn.dwsa-active {
        background: #243c5f;
        border-color: #243c5f;
        color: #ffffff;
      }
      #${FILES_ROOT_ID} .dwstk-btn.dwsa-error {
        background: #a12d2d;
        border-color: #a12d2d;
        color: #ffffff;
      }
      #${FILES_ROOT_ID} .dwsa-files-btn {
        flex: 0 0 auto;
        min-width: 46px;
        max-width: 68px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${ROOT_ID} .dwstk-icon-btn {
        min-width: 28px;
        padding: 0;
        font-size: 18px;
        line-height: 24px;
      }
      #${ROOT_ID} .dwstk-shortcut-btn {
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${ROOT_ID} .dwstk-btn:not(:disabled):hover,
      #${SHELL_ROOT_ID} .dwstk-btn:not(:disabled):hover,
      #${FILES_ROOT_ID} .dwstk-btn:not(:disabled):hover,
      #${PANEL_ID} button:not(:disabled):hover,
      #${CD_PANEL_ID} button:not(:disabled):hover {
        background: #eef3fb;
        border-color: #7d91bc;
      }
      #${SHELL_ROOT_ID} .dwstk-btn.dwsa-active:not(:disabled):hover {
        background: #31517d;
        border-color: #31517d;
        color: #ffffff;
      }
      #${FILES_ROOT_ID} .dwstk-btn.dwsa-error:not(:disabled):hover {
        background: #872424;
        border-color: #872424;
        color: #ffffff;
      }
      #${ROOT_ID} .dwstk-btn:disabled,
      #${SHELL_ROOT_ID} .dwstk-btn:disabled,
      #${FILES_ROOT_ID} .dwstk-btn:disabled,
      #${PANEL_ID} button:disabled,
      #${CD_PANEL_ID} button:disabled {
        background: #f1f3f7;
        border-color: #d2d8e5;
        color: #8792a6;
        cursor: not-allowed;
        opacity: .78;
      }
      #${PANEL_ID} .dwsa-icon-button,
      #${CD_PANEL_ID} .dwsa-icon-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        line-height: 1;
      }
      #${PANEL_ID} .dwsa-mi,
      #${CD_PANEL_ID} .dwsa-mi {
        width: 16px;
        height: 16px;
        flex: 0 0 16px;
        fill: currentColor;
        pointer-events: none;
      }
      #${PANEL_ID} .dwsa-icon-only,
      #${CD_PANEL_ID} .dwsa-icon-only {
        width: 32px;
        min-width: 32px;
        padding: 0 !important;
      }
      #${PANEL_ID} {
        position: fixed;
        z-index: 100010;
        box-sizing: border-box;
        border: 1px solid #8d9bb8;
        border-radius: 4px;
        background: #ffffff;
        color: #172033;
        box-shadow: 0 10px 28px rgba(20, 30, 45, .28);
        font: 13px/1.35 Montserrat, Arial, sans-serif;
      }
      #${PANEL_ID} * {
        box-sizing: border-box;
      }
      #${PANEL_ID} .dwstk-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 36px;
        padding: 8px 10px;
        border-bottom: 1px solid #d7deeb;
        background: #f7f9fc;
      }
      #${PANEL_ID} .dwstk-panel-close {
        width: 24px;
        min-width: 24px;
        height: 24px;
        padding: 0;
      }
      #${PANEL_ID} .dwstk-status {
        min-height: 20px;
        padding: 4px 10px 0;
        color: #2d5f3c;
        font-size: 12px;
      }
      #${PANEL_ID} .dwstk-status.dwstk-error {
        color: #a12d2d;
      }
      #${PANEL_ID} .dwstk-list {
        max-height: 210px;
        overflow: auto;
        padding: 6px 8px;
      }
      #${PANEL_ID} .dwstk-row {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 6px;
        align-items: center;
        padding: 3px 0;
      }
      #${PANEL_ID} .dwstk-row-main {
        display: flex;
        min-width: 0;
        height: 32px;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 0 8px;
        text-align: left;
      }
      #${PANEL_ID} .dwstk-row-main span,
      #${PANEL_ID} .dwstk-row-main small {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${PANEL_ID} .dwstk-row-main small {
        color: #66728a;
        font-weight: 500;
      }
      #${PANEL_ID} .dwstk-row > button:not(.dwstk-row-main) {
        height: 32px;
        padding: 0 8px;
      }
      #${PANEL_ID} .dwstk-form {
        display: grid;
        gap: 8px;
        padding: 10px;
        border-top: 1px solid #d7deeb;
        background: #fbfcfe;
      }
      #${PANEL_ID} label {
        display: grid;
        gap: 3px;
        color: #39445b;
        font-size: 12px;
        font-weight: 600;
      }
      #${PANEL_ID} input {
        width: 100%;
        height: 32px;
        border: 1px solid #b9c3d8;
        border-radius: 3px;
        padding: 0 8px;
        color: #111827;
        font: 13px Montserrat, Arial, sans-serif;
      }
      #${PANEL_ID} .dwstk-help {
        color: #5d6b84;
        font-size: 12px;
      }
      #${PANEL_ID} .dwstk-actions {
        display: flex;
        flex-wrap: nowrap;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
      }
      #${PANEL_ID} .dwstk-action-group {
        display: flex;
        flex-wrap: nowrap;
        gap: 8px;
        align-items: center;
      }
      #${PANEL_ID} .dwstk-actions button {
        height: 32px;
        padding: 0 10px;
      }
      #${PANEL_ID} .dwstk-save {
        background: #415c96;
        border-color: #415c96;
        color: #ffffff;
      }
      #${PANEL_ID} button.dwstk-save:not(:disabled):hover {
        background: #526fac;
        border-color: #526fac;
        color: #ffffff;
      }
      #${CD_PANEL_ID} {
        position: fixed;
        z-index: 100012;
        box-sizing: border-box;
        border: 1px solid #8d9bb8;
        border-radius: 4px;
        background: #ffffff;
        color: #172033;
        box-shadow: 0 10px 28px rgba(20, 30, 45, .28);
        font: 13px/1.35 Montserrat, Arial, sans-serif;
      }
      #${CD_PANEL_ID} * {
        box-sizing: border-box;
      }
      #${CD_PANEL_ID} .dwsa-cd-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 36px;
        padding: 8px 10px;
        border-bottom: 1px solid #d7deeb;
        background: #f7f9fc;
      }
      #${CD_PANEL_ID} .dwsa-cd-close {
        width: 24px;
        min-width: 24px;
        height: 24px;
        padding: 0;
      }
      #${CD_PANEL_ID} .dwsa-cd-form {
        display: grid;
        grid-template-columns: 1fr 140px;
        gap: 8px;
        padding: 10px;
        border-bottom: 1px solid #d7deeb;
        background: #fbfcfe;
      }
      #${CD_PANEL_ID} label {
        display: grid;
        gap: 3px;
        color: #39445b;
        font-size: 12px;
        font-weight: 600;
      }
      #${CD_PANEL_ID} input,
      #${CD_PANEL_ID} select {
        width: 100%;
        height: 32px;
        border: 1px solid #b9c3d8;
        border-radius: 3px;
        padding: 0 8px;
        color: #111827;
        background: #ffffff;
        font: 13px Montserrat, Arial, sans-serif;
      }
      #${CD_PANEL_ID} .dwsa-cd-actions {
        grid-column: 1 / -1;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      #${CD_PANEL_ID} .dwsa-cd-actions button {
        height: 32px;
        padding: 0 10px;
      }
      #${CD_PANEL_ID} .dwsa-cd-status {
        color: #2d5f3c;
        font-size: 12px;
      }
      #${CD_PANEL_ID} .dwsa-cd-meta {
        color: #5d6b84;
        font-size: 12px;
      }
      #${CD_PANEL_ID} .dwsa-cd-status.dwsa-error {
        color: #a12d2d;
      }
      #${CD_PANEL_ID} .dwsa-cd-summary {
        display: grid;
        grid-template-columns: 1fr minmax(150px, 230px);
        gap: 12px;
        align-items: center;
        padding: 6px 10px 0;
      }
      #${CD_PANEL_ID} .dwsa-cd-summary-text {
        min-width: 0;
      }
      #${CD_PANEL_ID} .dwsa-cd-filter {
        align-self: center;
      }
      #${CD_PANEL_ID} .dwsa-cd-list {
        display: grid;
        gap: 4px;
        max-height: 300px;
        overflow: auto;
        padding: 8px 10px 10px;
      }
      #${CD_PANEL_ID} .dwsa-cd-row {
        display: flex;
        width: 100%;
        height: 30px;
        align-items: center;
        justify-content: flex-start;
        padding: 0 8px;
        text-align: left;
      }
      #${CD_PANEL_ID} .dwsa-cd-row span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${CD_PANEL_ID} .dwsa-cd-empty {
        color: #5d6b84;
        padding: 10px 2px;
      }
    `;
    if (existing) {
      if (existing.textContent !== css) existing.textContent = css;
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  initExpiredSessionHandling();
  ensureMounted();
  const observer = new MutationObserver(onDomMutations);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("resize", positionPanel);
  window.addEventListener("resize", positionCdPanel);
  window.addEventListener("resize", scheduleEnsureMounted);
  setInterval(scheduleEnsureMounted, 2500);
})();
