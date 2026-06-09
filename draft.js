import { TEAM_POOL } from "./teams.js";
import {
  getFormationSlots,
  getAvailableSlotsForPlayer
} from "./formation.js";

export const draftState = {
  formation: "4-3-3",
  difficulty: "normal",
  ratingsVisible: true,
  draftMode: "squadFirst",
  ratingMode: "season",

  currentTeam: null,
  usedTeamIds: [],
  pickedPlayers: [],
  jokerCount: 1,
  isRolling: false
};

export function initializeDraft() {
    renderSetupScreen();
}

function renderSetupScreen() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="setup-screen">
            <h1 class="setup-title">34<span>-</span>0</h1>

            <div class="setup-group">
                <h3 class="section-title">Formation</h3>
                <div class="setup-options">
                    ${["4-3-3", "4-4-2", "4-2-3-1", "4-1-2-1-2", "3-5-2"].map(f => `
                        <button class="option-btn setup-formation ${draftState.formation === f ? "active" : ""}" data-value="${f}">
                            ${f}
                        </button>
                    `).join("")}
                </div>
            </div>

            <div class="setup-group">
                <h3 class="section-title">Ratings anzeigen</h3>
                <div class="setup-options">
                    <button class="option-btn setup-ratings active" data-value="true">An</button>
                    <button class="option-btn setup-ratings" data-value="false">Aus</button>
                </div>
            </div>

            <div class="setup-group">
                <h3 class="section-title">Joker</h3>
                <div class="setup-options">
                    ${[0, 1, 2, 3].map(j => `
                        <button class="option-btn setup-joker ${draftState.jokerCount === j ? "active" : ""}" data-value="${j}">
                            ${j} Joker
                        </button>
                    `).join("")}
                </div>
            </div>

            <button id="start-draft-button" class="start-button">Draft starten</button>
        </div>
    `;

    document.querySelectorAll(".setup-formation").forEach(btn => {
        btn.addEventListener("click", () => {
            draftState.formation = btn.dataset.value;
            renderSetupScreen();
        });
    });

    document.querySelectorAll(".setup-ratings").forEach(btn => {
        btn.addEventListener("click", () => {
            draftState.ratingsVisible = btn.dataset.value === "true";
            renderSetupScreen();
        });
    });

    document.querySelectorAll(".setup-joker").forEach(btn => {
        btn.addEventListener("click", () => {
            draftState.jokerCount = Number(btn.dataset.value);
            renderSetupScreen();
        });
    });

    document.getElementById("start-draft-button").addEventListener("click", () => {
        renderDraftScreen();
        bindDraftEvents();
    });
}

function renderDraftScreen() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <header class="topbar">
      <button id="back-button" class="ghost-button">← Menü</button>
      <div class="game-title">TSV 1860 DREAM XI</div>
      <div class="formation-pill">${draftState.formation}</div>
      <div class="draft-progress">
        <strong id="draft-count">0/11</strong>
        <div class="progress-track">
          <div id="progress-fill" class="progress-fill"></div>
        </div>
        <span id="joker-display">${draftState.jokerCount} Joker</span>
      </div>
    </header>

    <main class="draft-layout">
      <section>
        <div id="pitch" class="pitch"></div>

        <div class="team-stats">
          <div>
            <span>OVERALL</span>
            <strong id="overall-rating">—</strong>
          </div>
          <div>
            <span>DEF</span>
            <strong id="def-rating">—</strong>
          </div>
          <div>
            <span>MID</span>
            <strong id="mid-rating">—</strong>
          </div>
          <div>
            <span>ATT</span>
            <strong id="att-rating">—</strong>
          </div>
        </div>
      </section>

      <aside class="sidebar">
        <div class="team-card slot-card">
          <div id="rolled-season" class="team-season">—</div>
          <div id="rolled-club" class="team-name">Bereit zum Drehen</div>
          <div id="rolled-count" class="team-count">—</div>
        </div>

        <button id="roll-button" class="start-button">Drehen</button>

        <div class="joker-row">
          <button id="joker-button" class="ghost-button">Joker einsetzen</button>
        </div>

        <h3 class="sidebar-title">Spieler wählen</h3>
        <div id="player-list" class="player-list"></div>
      </aside>
    </main>

    <div id="position-modal" class="modal">
      <div class="modal-content">
        <h2>Position wählen</h2>
        <p id="position-modal-title"></p>
        <div id="position-options" class="position-options"></div>
        <button id="close-position-modal" class="ghost-button">Abbrechen</button>
      </div>
    </div>
  `;

  renderPitch();
}

function bindDraftEvents() {
  document
    .getElementById("roll-button")
    .addEventListener("click", rollTeamSlotMachine);

  document
    .getElementById("joker-button")
    .addEventListener("click", useJoker);

  document
    .getElementById("close-position-modal")
    .addEventListener("click", closePositionModal);
}

function rollTeamSlotMachine() {
  if (draftState.isRolling) return;

  const availableTeams = TEAM_POOL.filter(team => {
    return !draftState.usedTeamIds.includes(team.id);
  });

  if (availableTeams.length === 0) {
    alert("Keine Teams mehr verfügbar.");
    return;
  }

  draftState.isRolling = true;

  const rollButton = document.getElementById("roll-button");
  const seasonEl = document.getElementById("rolled-season");
  const clubEl = document.getElementById("rolled-club");
  const countEl = document.getElementById("rolled-count");
  const playerList = document.getElementById("player-list");

  rollButton.disabled = true;
  rollButton.textContent = "Dreht...";
  playerList.innerHTML = "";

  const finalTeam =
    availableTeams[Math.floor(Math.random() * availableTeams.length)];

  let ticks = 0;
  const maxTicks = 34;

  function tick() {
    const randomTeam =
      availableTeams[Math.floor(Math.random() * availableTeams.length)];

    const shownTeam = ticks >= maxTicks - 1 ? finalTeam : randomTeam;

    seasonEl.textContent = shownTeam.season;
    clubEl.textContent = shownTeam.name;
    countEl.textContent = `${shownTeam.players.length} Spieler`;

    seasonEl.classList.remove("slot-pop");
    clubEl.classList.remove("slot-pop");

    void seasonEl.offsetWidth;

    seasonEl.classList.add("slot-pop");
    clubEl.classList.add("slot-pop");

    ticks++;

    if (ticks < maxTicks) {
      const delay = 35 + ticks * 6;
      setTimeout(tick, delay);
    } else {
      draftState.currentTeam = finalTeam;
      draftState.usedTeamIds.push(finalTeam.id);
      draftState.isRolling = false;

      renderRolledTeam(finalTeam);

      rollButton.disabled = false;
      rollButton.textContent = "Nächste Mannschaft";
    }
  }

  tick();
}

function renderRolledTeam(team) {
  document.getElementById("rolled-season").textContent = team.season;
  document.getElementById("rolled-club").textContent = team.name;
  document.getElementById("rolled-count").textContent =
    `${team.players.length} Spieler`;

  const list = document.getElementById("player-list");
  list.innerHTML = "";

  const sortedPlayers = [...team.players].sort((a, b) => {
    return getDisplayedRating(b) - getDisplayedRating(a);
  });

  sortedPlayers.forEach(player => {
    const alreadyPicked = draftState.pickedPlayers.some(
      picked => picked.name === player.name
    );

    const availableSlots = getAvailableSlotsForPlayer(
      draftState.formation,
      draftState.pickedPlayers,
      player
    );

    const disabled = alreadyPicked || availableSlots.length === 0;

    const button = document.createElement("button");
    button.className = "player-card";
    button.disabled = disabled;

    button.innerHTML = `
      <span class="player-rating">
        ${draftState.ratingsVisible ? getDisplayedRating(player) : "?"}
      </span>

      <span class="player-info">
        <strong>${player.name}</strong>
        <small>${player.positions.join(" · ")}</small>
      </span>
    `;

    button.addEventListener("click", () => {
      openPositionModal(player);
    });

    list.appendChild(button);
  });
}

function openPositionModal(player) {
  const modal = document.getElementById("position-modal");
  const title = document.getElementById("position-modal-title");
  const options = document.getElementById("position-options");

  const availableSlots = getAvailableSlotsForPlayer(
    draftState.formation,
    draftState.pickedPlayers,
    player
  );

  if (availableSlots.length === 0) return;

  title.innerHTML = `Wo soll <strong>${player.name}</strong> spielen?`;
  options.innerHTML = "";

  availableSlots.forEach(slot => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = slot.label;

    btn.addEventListener("click", () => {
      pickPlayer(player, slot);
      closePositionModal();
    });

    options.appendChild(btn);
  });

  modal.classList.add("is-open");
}

function closePositionModal() {
  document.getElementById("position-modal").classList.remove("is-open");
}

function pickPlayer(player, slot) {
  const pickedPlayer = {
    ...player,
    slotId: slot.id,
    selectedPosition: slot.position,
    x: slot.x,
    y: slot.y,
    sourceTeamId: draftState.currentTeam.id,
    sourceSeason: draftState.currentTeam.season
  };

  draftState.pickedPlayers.push(pickedPlayer);

  renderPitch();
  renderDraftProgress();
  renderTeamStats();

  if (draftState.currentTeam) {
    renderRolledTeam(draftState.currentTeam);
  }

  if (draftState.pickedPlayers.length === 11) {
    finishDraft();
  }
}

function renderPitch() {
  const pitch = document.getElementById("pitch");
  const slots = getFormationSlots(draftState.formation);

  pitch.innerHTML = "";

  slots.forEach(slot => {
    const picked = draftState.pickedPlayers.find(
      player => player.slotId === slot.id
    );

    const div = document.createElement("div");
    div.className = "position-slot";
    div.dataset.slot = slot.id;
    div.style.left = `${slot.x}%`;
    div.style.top = `${slot.y}%`;

    if (picked) {
      div.classList.add("filled");
      div.innerHTML = `
        <strong>${picked.shortName || picked.name}</strong>
        <span>${draftState.ratingsVisible ? getDisplayedRating(picked) : ""}</span>
      `;
    } else {
      div.textContent = slot.label;
    }

    pitch.appendChild(div);
  });
}

function renderDraftProgress() {
  const count = draftState.pickedPlayers.length;

  document.getElementById("draft-count").textContent = `${count}/11`;
  document.getElementById("progress-fill").style.width =
    `${(count / 11) * 100}%`;
}

function renderTeamStats() {
  if (draftState.pickedPlayers.length === 0) return;

  const overall = averageRating(draftState.pickedPlayers);

  const def = averageRating(
    draftState.pickedPlayers.filter(p =>
      ["TW", "LV", "IV", "RV", "ZDM"].includes(p.selectedPosition)
    )
  );

  const mid = averageRating(
    draftState.pickedPlayers.filter(p =>
      ["ZDM", "ZM", "ZOM", "LM", "RM"].includes(p.selectedPosition)
    )
  );

  const att = averageRating(
    draftState.pickedPlayers.filter(p =>
      ["LF", "RF", "ST"].includes(p.selectedPosition)
    )
  );

  document.getElementById("overall-rating").textContent = overall || "—";
  document.getElementById("def-rating").textContent = def || "—";
  document.getElementById("mid-rating").textContent = mid || "—";
  document.getElementById("att-rating").textContent = att || "—";
}

function averageRating(players) {
  if (!players.length) return null;

  const sum = players.reduce((total, player) => {
    return total + getDisplayedRating(player);
  }, 0);

  return Math.round(sum / players.length);
}

function getDisplayedRating(player) {
  if (draftState.ratingMode === "prime" && player.primeRating) {
    return player.primeRating;
  }

  return player.rating;
}

function useJoker() {
  if (draftState.jokerCount <= 0) return;
  if (draftState.isRolling) return;

  draftState.jokerCount--;

  document.getElementById("joker-display").textContent =
    `${draftState.jokerCount} Joker`;

  if (draftState.currentTeam) {
    const index = draftState.usedTeamIds.indexOf(draftState.currentTeam.id);

    if (index !== -1) {
      draftState.usedTeamIds.splice(index, 1);
    }
  }

  draftState.currentTeam = null;
  document.getElementById("player-list").innerHTML = "";
  document.getElementById("rolled-season").textContent = "—";
  document.getElementById("rolled-club").textContent = "Joker eingesetzt";
  document.getElementById("rolled-count").textContent = "Neu drehen";
}

function finishDraft() {
  const event = new CustomEvent("draftCompleted", {
    detail: {
      formation: draftState.formation,
      players: draftState.pickedPlayers,
      usedTeamIds: draftState.usedTeamIds,
      ratingMode: draftState.ratingMode,
      difficulty: draftState.difficulty
    }
  });

  window.dispatchEvent(event);
}
