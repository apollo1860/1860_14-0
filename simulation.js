// simulation.js

import { TEAM_POOL } from "./teams.js";

let simulationState = {
    initialized: false,
    fixtures: [],
    table: [],
    scorers: [],
    matchdayIndex: 0,
    interval: null
};

export function initializeSimulation() {
    simulationState.initialized = true;

    window.addEventListener("draftCompleted", event => {
        startSimulation(event.detail);
    });
}

function startSimulation(draftData) {
    const userTeam = createUserTeam(draftData);
    const opponents = createOpponentTeams(draftData.usedTeamIds);

    const leagueTeams = [userTeam, ...opponents];

    window.gameState.leagueTeams = leagueTeams;

    simulationState.fixtures = createFixtures(leagueTeams);
    simulationState.table = createEmptyTable(leagueTeams);
    simulationState.scorers = [];
    simulationState.matchdayIndex = 0;

    renderSimulationScreen();
    renderTable();
    renderScorers();

    simulationState.interval = setInterval(() => {
        simulateNextMatchday();
    }, 1000);
}

function createUserTeam(draftData) {
    return {
        id: "user_team",
        name: "Deine 1860 XI",
        season: "Draft",
        players: draftData.players,
        strength: calculateTeamStrength(draftData.players),
        isUser: true
    };
}

function createOpponentTeams(usedTeamIds) {
    return TEAM_POOL
        .filter(team => !usedTeamIds.includes(team.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 7)
        .map(team => ({
            id: team.id,
            name: team.name,
            season: team.season,
            players: team.players,
            strength: calculateTeamStrength(team.players),
            isUser: false
        }));
}

function calculateTeamStrength(players) {
    const bestEleven = [...players]
        .sort((a, b) => getEffectiveRating(b) - getEffectiveRating(a))
        .slice(0, 11);

    const total = bestEleven.reduce((sum, player) => {
        return sum + getEffectiveRating(player);
    }, 0);

    return Math.round((total / bestEleven.length) * 10) / 10;
}

function getEffectiveRating(player) {
    const rating = player.rating || 60;
    const potential = player.potential || rating;
    const consistency = player.consistency || 70;

    return rating * 0.75 + potential * 0.15 + consistency * 0.10;
}

function createFixtures(teams) {
    const firstLeg = [];
    const rotatingTeams = [...teams];

    for (let round = 0; round < teams.length - 1; round++) {
        const matchday = [];

        for (let i = 0; i < teams.length / 2; i++) {
            const home = rotatingTeams[i];
            const away = rotatingTeams[teams.length - 1 - i];

            matchday.push({
                home,
                away
            });
        }

        firstLeg.push(matchday);

        const fixed = rotatingTeams[0];
        const rest = rotatingTeams.slice(1);
        rest.unshift(rest.pop());

        rotatingTeams.splice(0, rotatingTeams.length, fixed, ...rest);
    }

    const secondLeg = firstLeg.map(matchday => {
        return matchday.map(match => ({
            home: match.away,
            away: match.home
        }));
    });

    return [...firstLeg, ...secondLeg];
}

function createEmptyTable(teams) {
    return teams.map(team => ({
        team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        previousPosition: null
    }));
}

function simulateNextMatchday() {
    const matchday = simulationState.fixtures[simulationState.matchdayIndex];

    if (!matchday) {
        finishSimulation();
        return;
    }

    const results = matchday.map(match => simulateMatch(match));

    updateTable(results);
    updateScorers(results);

    renderMatchdayResults(results);
    renderTable();
    renderScorers();

    simulationState.matchdayIndex++;

    if (simulationState.matchdayIndex >= simulationState.fixtures.length) {
        finishSimulation();
    }
}

function simulateMatch(match) {
    const homeAdvantage = 2.5;

    const homePower = match.home.strength + homeAdvantage;
    const awayPower = match.away.strength;

    const diff = homePower - awayPower;

    const homeExpectedGoals = clamp(1.35 + diff * 0.045, 0.2, 4.5);
    const awayExpectedGoals = clamp(1.10 - diff * 0.035, 0.2, 4.0);

    const homeGoals = poisson(homeExpectedGoals);
    const awayGoals = poisson(awayExpectedGoals);

    return {
        home: match.home,
        away: match.away,
        homeGoals,
        awayGoals,
        scorers: [
            ...assignScorers(match.home, homeGoals),
            ...assignScorers(match.away, awayGoals)
        ]
    };
}

function assignScorers(team, goals) {
    const scorers = [];

    for (let i = 0; i < goals; i++) {
        const scorer = pickScorer(team);

        if (scorer) {
            scorers.push({
                team,
                player: scorer
            });
        }
    }

    return scorers;
}

function pickScorer(team) {
    const weightedPlayers = team.players.map(player => {
        return {
            player,
            weight: getScoringWeight(player)
        };
    });

    const totalWeight = weightedPlayers.reduce((sum, item) => {
        return sum + item.weight;
    }, 0);

    let random = Math.random() * totalWeight;

    for (const item of weightedPlayers) {
        random -= item.weight;

        if (random <= 0) {
            return item.player;
        }
    }

    return weightedPlayers[0]?.player || null;
}

function getScoringWeight(player) {
    const position = player.selectedPosition || player.positions[0];

    const positionWeights = {
        TW: 0,
        LV: 0.08,
        RV: 0.08,
        IV: 0.10,
        ZDM: 0.14,
        ZM: 0.25,
        ZOM: 0.45,
        LM: 0.45,
        RM: 0.45,
        LF: 0.70,
        RF: 0.70,
        ST: 1.00
    };

    const positionWeight = positionWeights[position] ?? 0.2;
    const ratingWeight = (player.rating || 60) / 75;

    return positionWeight * ratingWeight;
}

function updateTable(results) {
    simulationState.table.forEach((row, index) => {
        row.previousPosition = index + 1;
    });

    results.forEach(result => {
        const homeRow = simulationState.table.find(row => row.team.id === result.home.id);
        const awayRow = simulationState.table.find(row => row.team.id === result.away.id);

        homeRow.played++;
        awayRow.played++;

        homeRow.goalsFor += result.homeGoals;
        homeRow.goalsAgainst += result.awayGoals;

        awayRow.goalsFor += result.awayGoals;
        awayRow.goalsAgainst += result.homeGoals;

        homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst;
        awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst;

        if (result.homeGoals > result.awayGoals) {
            homeRow.wins++;
            awayRow.losses++;
            homeRow.points += 3;
        } else if (result.homeGoals < result.awayGoals) {
            awayRow.wins++;
            homeRow.losses++;
            awayRow.points += 3;
        } else {
            homeRow.draws++;
            awayRow.draws++;
            homeRow.points++;
            awayRow.points++;
        }
    });

    simulationState.table.sort((a, b) => {
        return (
            b.points - a.points ||
            b.goalDifference - a.goalDifference ||
            b.goalsFor - a.goalsFor ||
            a.team.name.localeCompare(b.team.name)
        );
    });
}

function updateScorers(results) {
    results.forEach(result => {
        result.scorers.forEach(goal => {
            const existing = simulationState.scorers.find(item => {
                return (
                    item.player.name === goal.player.name &&
                    item.team.id === goal.team.id
                );
            });

            if (existing) {
                existing.goals++;
            } else {
                simulationState.scorers.push({
                    player: goal.player,
                    team: goal.team,
                    goals: 1
                });
            }
        });
    });

    simulationState.scorers.sort((a, b) => {
        return b.goals - a.goals;
    });
}

function renderSimulationScreen() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <header class="topbar">
            <div class="game-title">TSV 1860 HISTORISCHE LIGA</div>
            <div class="formation-pill">8 Teams · 14 Spieltage</div>
        </header>

        <main class="simulation-layout">
            <section class="simulation-main">
                <h2 id="matchday-title">Saison startet...</h2>
                <div id="matchday-results"></div>
            </section>

            <aside class="sidebar">
                <h3 class="sidebar-title">Tabelle</h3>
                <div id="league-table"></div>

                <h3 class="sidebar-title">Torschützen</h3>
                <div id="scorer-table"></div>
            </aside>
        </main>

        <div id="final-result"></div>
    `;
}

function renderMatchdayResults(results) {
    const title = document.getElementById("matchday-title");
    const list = document.getElementById("matchday-results");

    title.textContent =
        `Spieltag ${simulationState.matchdayIndex + 1} / ${simulationState.fixtures.length}`;

    list.innerHTML = results.map(result => {
        return `
            <div class="result-row">
                <span>${result.home.name} ${result.home.season}</span>
                <strong>${result.homeGoals}:${result.awayGoals}</strong>
                <span>${result.away.name} ${result.away.season}</span>
            </div>
        `;
    }).join("");
}

function renderTable() {
    const tableEl = document.getElementById("league-table");

    if (!tableEl) return;

    tableEl.innerHTML = simulationState.table.map((row, index) => {
        const position = index + 1;
        const zone = getTableZone(position);
        const movement = getTableMovement(row, position);

        return `
            <div class="table-row ${zone} ${row.team.isUser ? "user-team" : ""}">
                <span>${position}</span>
                <strong>${row.team.name} ${row.team.season}</strong>
                <span>${row.wins}-${row.draws}-${row.losses}</span>
                <span>${row.goalDifference > 0 ? "+" : ""}${row.goalDifference}</span>
                <b>${row.points}</b>
                <small>${movement}</small>
            </div>
        `;
    }).join("");
}

function getTableZone(position) {
    if (position === 1) return "meister";
    if (position === 2) return "vize";
    if (position >= 7) return "abstieg";
    return "mittelfeld";
}

function getTableMovement(row, currentPosition) {
    if (!row.previousPosition) return "–";

    if (row.previousPosition > currentPosition) {
        return "▲";
    }

    if (row.previousPosition < currentPosition) {
        return "▼";
    }

    return "–";
}

function renderScorers() {
    const scorerEl = document.getElementById("scorer-table");

    if (!scorerEl) return;

    const topScorers = simulationState.scorers.slice(0, 8);

    if (topScorers.length === 0) {
        scorerEl.innerHTML = `<p class="muted">Noch keine Tore.</p>`;
        return;
    }

    scorerEl.innerHTML = topScorers.map((item, index) => {
        return `
            <div class="scorer-row">
                <span>${index + 1}</span>
                <strong>${item.player.name}</strong>
                <small>${item.team.season}</small>
                <b>${item.goals}</b>
            </div>
        `;
    }).join("");
}

function finishSimulation() {
    clearInterval(simulationState.interval);
    simulationState.interval = null;

    const champion = simulationState.table[0];
    const runnerUp = simulationState.table[1];
    const relegated = simulationState.table.slice(6, 8);
    const userPosition =
        simulationState.table.findIndex(row => row.team.id === "user_team") + 1;

    const topScorer = simulationState.scorers[0];

    const finalEl = document.getElementById("final-result");

    finalEl.innerHTML = `
        <div class="final-card">
            <h2>Saison beendet</h2>

            <p><strong>Meister:</strong> ${champion.team.name} ${champion.team.season}</p>
            <p><strong>Vizemeister:</strong> ${runnerUp.team.name} ${runnerUp.team.season}</p>
            <p><strong>Deine Platzierung:</strong> Platz ${userPosition}</p>

            <p>
                <strong>Absteiger:</strong>
                ${relegated.map(row => `${row.team.name} ${row.team.season}`).join(", ")}
            </p>

            <p>
                <strong>Torschützenkönig:</strong>
                ${topScorer ? `${topScorer.player.name} (${topScorer.goals} Tore)` : "—"}
            </p>
        </div>
    `;
}

function poisson(lambda) {
    let l = Math.exp(-lambda);
    let k = 0;
    let p = 1;

    do {
        k++;
        p *= Math.random();
    } while (p > l);

    return k - 1;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
