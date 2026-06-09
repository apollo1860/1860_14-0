// app.js

import { initializeUI } from "./ui.js";
import { initializeDraft } from "./draft.js";
import { initializeSimulation } from "./simulation.js";

export const gameState = {
    formation: "4-3-3",
    difficulty: "normal",
    ratingsVisible: true,
    draftMode: "squadFirst",
    ratingMode: "season",

    pickedPlayers: [],
    usedTeams: [],

    currentTeam: null,
    leagueTeams: [],

    currentScreen: "draft"
};

window.gameState = gameState;

document.addEventListener("DOMContentLoaded", () => {
    initializeUI();
    initializeSimulation();
    initializeDraft();
});
