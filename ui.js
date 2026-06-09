// ui.js

export function initializeUI() {
    document.body.classList.add("app-ready");
}

export function showScreen(screenName) {
    window.gameState.currentScreen = screenName;

    document.querySelectorAll("[data-screen]").forEach(screen => {
        screen.classList.remove("is-active");
    });

    const activeScreen = document.querySelector(`[data-screen="${screenName}"]`);

    if (activeScreen) {
        activeScreen.classList.add("is-active");
    }
}

export function updateHeaderTitle(title) {
    const titleEl = document.querySelector("#header-title");

    if (titleEl) {
        titleEl.textContent = title;
    }
}

export function clearApp() {
    const app = document.getElementById("app");

    if (app) {
        app.innerHTML = "";
    }
}

export function renderButton(label, className = "option-btn") {
    const button = document.createElement("button");
    button.className = className;
    button.textContent = label;

    return button;
}

export function renderRating(value, hidden = false) {
    return hidden ? "?" : value;
}

export function lockButton(button, label = "Lädt...") {
    if (!button) return;

    button.disabled = true;
    button.dataset.oldText = button.textContent;
    button.textContent = label;
}

export function unlockButton(button) {
    if (!button) return;

    button.disabled = false;

    if (button.dataset.oldText) {
        button.textContent = button.dataset.oldText;
        delete button.dataset.oldText;
    }
}

export function openModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.add("is-open");
    }
}

export function closeModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.remove("is-open");
    }
}

export function formatTeamName(team) {
    return `${team.name} ${team.season}`;
}

export function formatPlayerPositions(player) {
    return player.positions.join(" · ");
}
