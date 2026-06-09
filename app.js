// app.js

import { initializeUI } from "./ui.js";
import { initializeDraft } from "./draft.js";
import { initializeSimulation } from "./simulation.js";

export const gameState = {
    formation: null,
    difficulty: null,
    ratingsVisible: true,

    pickedPlayers: [],
    usedTeams: [],

    currentTeam: null,
    leagueTeams: []
};

window.gameState = gameState;

document.addEventListener("DOMContentLoaded", () => {

    initializeUI();
    initializeDraft();
    initializeSimulation();

});
