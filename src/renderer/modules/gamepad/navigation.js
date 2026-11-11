import { nextTick } from 'vue';
import { GamepadInput } from '@/modules/gamepad/input';
import { gamepadState, isBigPicture, setInputMode } from '@/modules/gamepad/state';
import { playHoverSound } from '@/modules/hoverDirective';

/*
 * Spatial navigation for the Big Picture UI
 *
 * Hooks:
 * - [data-nav-scope]            Traps navigation inside (popups, drawers)
 * - [data-nav-autofocus]        Preferred element to focus when a page / scope opens
 * - [data-nav-group]            Remembers the last focused child when navigating back into the group
 * - [data-nav-skip]             Never focus this element
 * - [data-nav-tabs]             Container of page tabs
 * - [data-nav-prev-page] / [data-nav-next-page]   Pagination buttons
 * - [data-nav-hint-x]           Label for the X button hint while focused
 */

const FOCUSABLE_SELECTOR = ['a[href]', 'button', 'input:not([type="hidden"])', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])', '[data-nav]'].join(',');
const TEXT_INPUT_TYPES = ['text', 'search', 'email', 'url', 'password', 'tel', 'number', ''];
const EDGE_TOLERANCE = 6;
const SCROLL_SPEED = 22;

function isTextInput(el) {
    if (!el) return false;
    if (el.tagName === 'TEXTAREA') return !el.readOnly && !el.disabled;
    if (el.tagName !== 'INPUT') return false;
    return TEXT_INPUT_TYPES.includes((el.getAttribute('type') || '').toLowerCase()) && !el.readOnly && !el.disabled;
}

function isFocusable(el) {
    if (!el || !el.isConnected) return false;
    if (el.disabled || el.closest('[data-nav-skip]') || el.closest('[inert]')) return false;
    if (el.classList.contains('disabled')) return false;
    if (typeof el.checkVisibility === 'function' && !el.checkVisibility({ checkVisibilityCSS: true })) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

function getScope() {
    const scopes = [...document.querySelectorAll('dialog[open], [data-nav-scope]')].filter((el) => isScopeVisible(el));
    return scopes.length ? scopes[scopes.length - 1] : document.getElementById('app') || document.body;
}

function isScopeVisible(el) {
    // A popup that is animating out is already closed
    if ([...el.classList].some((name) => name.endsWith('-leave-active'))) return false;
    if (typeof el.checkVisibility === 'function') return el.checkVisibility({ checkVisibilityCSS: true });
    return el.getClientRects().length > 0;
}

function belongsToScope(el, scope) {
    if (!scope.contains(el) || !isFocusable(el)) return false;
    // Elements inside a nested scope only count while that scope is the active one
    const ownScope = el.parentElement?.closest('dialog[open], [data-nav-scope]');
    return !ownScope || ownScope === scope || !scope.contains(ownScope) || ownScope.contains(scope);
}

function getFocusables(scope) {
    return [...scope.querySelectorAll(FOCUSABLE_SELECTOR)].filter((el) => belongsToScope(el, scope));
}

function centerOf(rect) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/* Tries to find the best candidate to focus when moving in a direction. Returns null if none is found. */
function score(from, to, direction) {
    const horizontal = direction === 'left' || direction === 'right';
    let primary;
    switch (direction) {
        case 'right':
            primary = to.left - from.right;
            break;
        case 'left':
            primary = from.left - to.right;
            break;
        case 'down':
            primary = to.top - from.bottom;
            break;
        case 'up':
            primary = from.top - to.bottom;
            break;
    }

    let strict = true;
    if (primary < -EDGE_TOLERANCE) {
        // Overlapping elements
        const a = centerOf(from);
        const b = centerOf(to);
        const delta = { right: b.x - a.x, left: a.x - b.x, down: b.y - a.y, up: a.y - b.y }[direction];
        if (delta <= 1) return null;
        primary = delta;
        strict = false;
    }
    primary = Math.max(0, primary);

    // Distance on the other axis (0 when the elements overlap on it)
    const orthogonal = horizontal ? Math.max(0, from.top - to.bottom, to.top - from.bottom) : Math.max(0, from.left - to.right, to.left - from.right);
    const a = centerOf(from);
    const b = centerOf(to);
    const alignment = horizontal ? Math.abs(a.y - b.y) : Math.abs(a.x - b.x);

    return (strict ? 0 : 10000) + primary + orthogonal * (horizontal ? 3 : 2) + alignment * 0.05;
}

export function createNavigation({ router, mitt }) {
    let lastFocused = null;
    const groupMemory = new WeakMap();
    let scopeOpeners = [];

    const input = new GamepadInput(handleAction, handleScroll);

    function rememberFocus(el) {
        lastFocused = el;
        const group = el.closest('[data-nav-group]');
        if (group) groupMemory.set(group, el);
    }

    function focusElement(el, { sound = true } = {}) {
        if (!el) return false;
        el.focus({ preventScroll: true });
        if (document.activeElement !== el && !el.contains(document.activeElement)) return false;
        rememberFocus(el);
        el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        if (sound) playHoverSound();
        updateHints();
        return true;
    }

    function getCurrent() {
        const active = document.activeElement;
        const scope = getScope();
        if (active && active !== document.body && belongsToScope(active, scope)) return active;
        return null;
    }

    function getDefaultTarget(scope, { mainOnly = false } = {}) {
        const focusables = getFocusables(scope);
        const autofocus = focusables.find((el) => el.matches('[data-nav-autofocus], [data-nav-autofocus] *'));
        if (autofocus) return autofocus;

        // Prefer the page content over the top bar
        const main = scope.querySelector('[data-nav-main]');
        const inMain = main ? focusables.filter((el) => main.contains(el)) : [];
        if (mainOnly && main && !inMain.length) return null;
        let candidates = inMain.length ? inMain : focusables;
        const content = candidates.filter((el) => !el.closest('[data-nav-tabs]'));
        if (content.length) candidates = content;

        // The first element that is (at least partially) visible on screen
        const visible = candidates.find((el) => {
            const rect = el.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < window.innerHeight;
        });
        return visible ?? candidates[0] ?? null;
    }

    /*
     * Makes sure something sensible is focused. Returns true if focus had to be (re)placed.
     */
    function ensureFocus({ mainOnly = false } = {}) {
        if (getCurrent()) return false;
        const scope = getScope();
        if (lastFocused && belongsToScope(lastFocused, scope)) {
            focusElement(lastFocused, { sound: false });
            return true;
        }

        const closed = scopeOpeners.filter((entry) => !entry.scope.isConnected || !isScopeVisible(entry.scope));
        scopeOpeners = scopeOpeners.filter((entry) => !closed.includes(entry));

        if (lastFocused?.isConnected && !scope.contains(lastFocused) && !scopeOpeners.some((entry) => entry.scope === scope)) {
            const via = closed.find((entry) => entry.scope.contains(lastFocused));
            scopeOpeners.push({ scope, opener: via ? via.opener : lastFocused });
        }

        const opener = closed.reverse().find((entry) => belongsToScope(entry.opener, scope))?.opener;
        if (opener) {
            focusElement(opener, { sound: false });
            return true;
        }

        const target = getDefaultTarget(scope, { mainOnly });
        if (target) focusElement(target, { sound: false });
        return !!target;
    }

    function move(direction) {
        const current = getCurrent();
        if (!current) {
            ensureFocus();
            return;
        }

        const scope = getScope();
        const from = current.getBoundingClientRect();
        const keepInRow = (direction === 'left' || direction === 'right') && !!current.closest('[data-nav-group]');
        let best = null;
        let bestScore = Infinity;
        for (const candidate of getFocusables(scope)) {
            if (candidate === current || candidate.contains(current) || current.contains(candidate)) continue;
            const rect = candidate.getBoundingClientRect();
            if (keepInRow && (rect.bottom <= from.top || rect.top >= from.bottom)) continue;
            const value = score(from, rect, direction);
            if (value !== null && value < bestScore) {
                bestScore = value;
                best = candidate;
            }
        }
        if (!best) return;

        const group = best.closest('[data-nav-group]');
        if (group && !group.contains(current)) {
            const remembered = groupMemory.get(group);
            if (remembered && remembered.isConnected && isFocusable(remembered)) best = remembered;
        }

        focusElement(best);
    }

    function dispatchInputEvents(el) {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function adjustValue(el, direction) {
        const sign = direction === 'right' || direction === 'up' ? 1 : -1;
        if (el.type === 'range') {
            const min = Number(el.min || 0);
            const max = Number(el.max || 100);
            const step = (max - min) / 20;
            const value = Math.min(max, Math.max(min, Number(el.value) + sign * step));
            el.value = String(Math.round(value * 1000) / 1000);
        } else if (el.type === 'number') {
            el.value = String((Number(el.value) || 0) + sign);
        } else if (el.tagName === 'SELECT') {
            const enabledOptions = [...el.options].filter((option) => !option.disabled);
            const index = enabledOptions.findIndex((option) => option.selected);
            const next = enabledOptions[Math.min(enabledOptions.length - 1, Math.max(0, index + sign))];
            if (!next || next.selected) return;
            el.value = next.value;
        }
        dispatchInputEvents(el);
        playHoverSound();
    }

    async function startTextEditing(el) {
        el.focus();
        if (typeof el.select === 'function' && el.type !== 'number') el.select();
        gamepadState.isEditingText = true;
        updateHints();

        const { platform } = gamepadState;
        if (platform.isLaunchedBySteam || platform.isSteamOS || platform.isGamescope) {
            await window.spshGamepad.openSteamKeyboard();
        }
    }

    function pressEnter(el) {
        for (const type of ['keydown', 'keypress', 'keyup']) {
            el.dispatchEvent(new KeyboardEvent(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        }
    }

    function accept() {
        const el = getCurrent();
        if (!el) {
            ensureFocus();
            return;
        }

        if (el.tagName === 'SELECT') {
            gamepadState.pickerRequest = { select: el };
            return;
        }
        if (isTextInput(el)) {
            if (gamepadState.isEditingText) {
                pressEnter(el);
            } else {
                startTextEditing(el);
            }
            return;
        }
        if (el.type === 'range') return;

        // If the click opens a popup, move the focus into it
        const scopeBefore = getScope();
        el.click();
        setTimeout(() => {
            if (getScope() !== scopeBefore) ensureFocus();
        }, 50);
    }

    function back() {
        if (gamepadState.pickerRequest) {
            gamepadState.pickerRequest = null;
            return;
        }

        const active = document.activeElement;
        if (gamepadState.isEditingText && isTextInput(active)) {
            stopTextEditing();
            return;
        }

        const scope = getScope();
        if (scope.matches('dialog[open], [data-nav-scope]')) {
            const event = new CustomEvent('nav-back', { bubbles: false, cancelable: true });
            const notHandled = scope.dispatchEvent(event);
            if (notHandled && scope.tagName === 'DIALOG') scope.close();
            nextTick(() => restoreFocusAfterScopeChange());
            return;
        }

        if (window.history.state?.back) {
            router.back();
        }
    }

    function stopTextEditing() {
        gamepadState.isEditingText = false;
        const active = document.activeElement;
        if (active) active.dispatchEvent(new Event('change', { bubbles: true }));
        updateHints();
    }

    function restoreFocusAfterScopeChange() {
        setTimeout(() => {
            if (!getCurrent()) ensureFocus();
        }, 50);
    }

    function isPageActive() {
        return !getScope().matches('dialog[open], [data-nav-scope]');
    }

    function cycleTabs(direction) {
        if (!isPageActive()) return;
        const tabs = [...document.querySelectorAll('[data-nav-main] [data-nav-tabs]')].find(isScopeVisible);
        if (!tabs) return;
        const links = [...tabs.querySelectorAll('a[href], button')].filter(isFocusable);
        const index = links.findIndex((link) => link.matches('.router-link-exact-active, .active'));
        const next = links[index + direction];
        if (next) next.click();
    }

    function flipPage(direction) {
        if (!isPageActive()) return;
        const selector = direction < 0 ? '[data-nav-prev-page]' : '[data-nav-next-page]';
        const pager = [...document.querySelectorAll(`[data-nav-main] ${selector}`)].find((el) => isFocusable(el));
        if (pager) pager.click();
    }

    function toggleSidebar(open = !gamepadState.sidebarOpen) {
        gamepadState.sidebarOpen = open;
        if (open) gamepadState.accountOpen = false;
        nextTick(() => restoreFocusAfterScopeChange());
    }

    function secondary() {
        const el = getCurrent();
        if (!el) return;
        el.dispatchEvent(new CustomEvent('nav-secondary', { bubbles: true }));
    }

    /**
     * @param {string} action
     * @param {{ pointer?: boolean }} info `pointer` is set when triggered by clicking a hint in the hint bar
     */
    function handleAction(action, info = {}) {
        if (!isBigPicture.value) return;

        if (!info.pointer) {
            const wasPointer = gamepadState.inputMode !== 'gamepad';
            setInputMode('gamepad');
            if (wasPointer && ensureFocus()) return;
        }

        const current = getCurrent();
        switch (action) {
            case 'up':
            case 'down':
            case 'left':
            case 'right':
                mitt.emit('bp-direction', action);
                if (current && (current.type === 'range' || current.type === 'number' || current.tagName === 'SELECT') && (action === 'left' || action === 'right')) {
                    adjustValue(current, action);
                    return;
                }
                if (gamepadState.isEditingText) gamepadState.isEditingText = false;
                move(action);
                break;
            case 'accept':
                accept();
                break;
            case 'back':
                back();
                break;
            case 'secondary':
                secondary();
                break;
            case 'search':
                gamepadState.sidebarOpen = false;
                gamepadState.accountOpen = false;
                mitt.emit('bp-search-open');
                break;
            case 'prevTab':
                cycleTabs(-1);
                break;
            case 'nextTab':
                cycleTabs(1);
                break;
            case 'prevPage':
                flipPage(-1);
                break;
            case 'nextPage':
                flipPage(1);
                break;
            case 'downloads':
                if (gamepadState.downloadsOpen) {
                    gamepadState.sidebarOpen = false;
                } else {
                    gamepadState.sidebarOpen = true;
                    gamepadState.accountOpen = false;
                    mitt.emit('queue-open');
                }
                nextTick(() => restoreFocusAfterScopeChange());
                break;
            case 'menu':
                toggleSidebar();
                break;
        }
    }

    function handleScroll(dx, dy) {
        if (!isBigPicture.value) return;
        const current = getCurrent();
        let container = current ? current.parentElement : null;
        while (container && container !== document.body) {
            const style = getComputedStyle(container);
            if (/(auto|scroll)/.test(style.overflowY) && container.scrollHeight > container.clientHeight) break;
            container = container.parentElement;
        }
        if (!container || container === document.body) container = document.querySelector('[data-nav-main]');
        container?.scrollBy({ left: dx * SCROLL_SPEED, top: dy * SCROLL_SPEED });
    }

    function updateHints() {
        const el = getCurrent();
        const hintX = el?.closest('[data-nav-hint-x]')?.getAttribute('data-nav-hint-x') || null;
        gamepadState.focusedHints = {
            x: hintX,
            textInput: isTextInput(el),
            adjustable: !!el && (el.type === 'range' || el.type === 'number' || el.tagName === 'SELECT'),
        };
        gamepadState.pageHasPagination = !!document.querySelector('[data-nav-main] [data-nav-next-page], [data-nav-main] [data-nav-prev-page]');
    }

    function handleKeyDown(event) {
        if (!isBigPicture.value || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
        if (!event.isTrusted) return;

        const active = document.activeElement;
        const typing = isTextInput(active);
        let action = null;

        switch (event.key) {
            case 'ArrowUp':
                action = 'up';
                break;
            case 'ArrowDown':
                action = 'down';
                break;
            case 'ArrowLeft':
                if (!typing) action = 'left';
                break;
            case 'ArrowRight':
                if (!typing) action = 'right';
                break;
            case 'Enter':
                if (!typing) action = 'accept';
                break;
            case ' ':
                if (!typing && active?.tagName !== 'SELECT') action = 'accept';
                break;
            case 'Escape':
                action = 'back';
                break;
            case 'Backspace':
                if (!typing) action = 'back';
                break;
            case 'PageUp':
                action = 'prevPage';
                break;
            case 'PageDown':
                action = 'nextPage';
                break;
            case 'q':
            case 'Q':
                if (!typing) action = 'prevTab';
                break;
            case 'e':
            case 'E':
                if (!typing) action = 'nextTab';
                break;
            case 'm':
            case 'M':
            case 'ContextMenu':
                if (!typing) action = 'menu';
                break;
        }
        if (!action) return;

        event.preventDefault();
        event.stopPropagation();
        gamepadState.glyphStyle = 'keyboard';
        gamepadState.lastSource = 'keyboard';
        gamepadState.lastAction = action;
        handleAction(action, { source: 'keyboard', repeat: event.repeat });
    }

    let lastPointer = null;
    function handlePointerMove(event) {
        if (gamepadState.inputMode !== 'gamepad') return;
        if (lastPointer && Math.abs(event.screenX - lastPointer.x) + Math.abs(event.screenY - lastPointer.y) < 6) return;
        if (!lastPointer) {
            lastPointer = { x: event.screenX, y: event.screenY };
            return;
        }
        lastPointer = null;
        setInputMode('pointer');
    }
    function handlePointerDown() {
        lastPointer = null;
        setInputMode('pointer');
        gamepadState.isEditingText = false;
    }

    function handleFocusIn(event) {
        if (!isBigPicture.value) return;
        if (event.target instanceof Element) rememberFocus(event.target);
        updateHints();
    }

    function handleFocusOut() {
        if (!isTextInput(document.activeElement)) gamepadState.isEditingText = false;
        setTimeout(updateHints, 0);
    }

    const routeFocusMemory = new Map();
    router.beforeEach((to, from) => {
        if (!isBigPicture.value) return;
        const main = document.querySelector('[data-nav-main]');
        const current = getCurrent();
        if (main && current && main.contains(current)) {
            const index = getFocusables(main).indexOf(current);
            if (index >= 0) routeFocusMemory.set(from.fullPath, { index, href: current.getAttribute('href') });
        }
    });

    function restoreRouteFocus(path) {
        const memory = routeFocusMemory.get(path);
        if (!memory) return false;
        const main = document.querySelector('[data-nav-main]');
        const focusables = main ? getFocusables(main) : [];
        const target = memory.href ? focusables.find((el) => el.getAttribute('href') === memory.href) : focusables[memory.index];
        if (!target) return false;
        routeFocusMemory.delete(path);
        focusElement(target, { sound: false });
        return true;
    }

    router.afterEach((to) => {
        gamepadState.isEditingText = false;
        gamepadState.pickerRequest = null;
        if (!isBigPicture.value) return;
        lastFocused = null;
        let restored = false;
        let autoPlaced = null;
        for (const delay of [60, 350, 900, 1800]) {
            setTimeout(() => {
                updateHints();
                if (gamepadState.inputMode !== 'gamepad' || restored) return;
                const current = getCurrent();
                if (current && current !== autoPlaced && !current.closest('[data-nav-tabs]')) return;
                restored = restoreRouteFocus(to.fullPath);
                if (restored) return;
                const target = getDefaultTarget(getScope(), { mainOnly: true });
                const better = !current || target?.matches('[data-nav-autofocus], [data-nav-autofocus] *') || current.closest('[data-nav-tabs]');
                if (target && target !== current && better) {
                    focusElement(target, { sound: false });
                    autoPlaced = target;
                }
            }, delay);
        }
    });

    function start() {
        input.start();
        window.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('mousemove', handlePointerMove, true);
        window.addEventListener('pointerdown', handlePointerDown, true);
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);
        updateHints();
    }

    function stop() {
        input.stop();
        window.removeEventListener('keydown', handleKeyDown, true);
        window.removeEventListener('mousemove', handlePointerMove, true);
        window.removeEventListener('pointerdown', handlePointerDown, true);
        document.removeEventListener('focusin', handleFocusIn);
        document.removeEventListener('focusout', handleFocusOut);
    }

    return {
        start,
        stop,
        handleAction,
        toggleSidebar,
        focusElement,
        ensureFocus,
        updateHints,
        getDiagnostics: () => ({ ...input.getDiagnostics(), windowFocused: input.windowFocused }),
    };
}
