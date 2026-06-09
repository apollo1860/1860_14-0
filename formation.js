// formations.js
// TSV 1860 Draft Edition

export const FORMATIONS = {

  "4-3-3": [
    { id:"tw",  position:"TW",  label:"TW",  x:50, y:88 },

    { id:"lv",  position:"LV",  label:"LV",  x:18, y:72 },
    { id:"iv1", position:"IV",  label:"IV",  x:36, y:72 },
    { id:"iv2", position:"IV",  label:"IV",  x:64, y:72 },
    { id:"rv",  position:"RV",  label:"RV",  x:82, y:72 },

    { id:"zm1", position:"ZM",  label:"ZM",  x:30, y:50 },
    { id:"zm2", position:"ZM",  label:"ZM",  x:50, y:50 },
    { id:"zm3", position:"ZM",  label:"ZM",  x:70, y:50 },

    { id:"lf",  position:"LF",  label:"LF",  x:20, y:27 },
    { id:"st",  position:"ST",  label:"ST",  x:50, y:22 },
    { id:"rf",  position:"RF",  label:"RF",  x:80, y:27 }
  ],

  "4-4-2": [
    { id:"tw",  position:"TW",  label:"TW",  x:50, y:88 },

    { id:"lv",  position:"LV",  label:"LV",  x:18, y:72 },
    { id:"iv1", position:"IV",  label:"IV",  x:36, y:72 },
    { id:"iv2", position:"IV",  label:"IV",  x:64, y:72 },
    { id:"rv",  position:"RV",  label:"RV",  x:82, y:72 },

    { id:"lm",  position:"LM",  label:"LM",  x:15, y:48 },
    { id:"zm1", position:"ZM",  label:"ZM",  x:40, y:50 },
    { id:"zm2", position:"ZM",  label:"ZM",  x:60, y:50 },
    { id:"rm",  position:"RM",  label:"RM",  x:85, y:48 },

    { id:"st1", position:"ST",  label:"ST",  x:38, y:22 },
    { id:"st2", position:"ST",  label:"ST",  x:62, y:22 }
  ],

  "4-2-3-1": [
    { id:"tw",  position:"TW",  label:"TW",  x:50, y:88 },

    { id:"lv",  position:"LV",  label:"LV",  x:18, y:72 },
    { id:"iv1", position:"IV",  label:"IV",  x:36, y:72 },
    { id:"iv2", position:"IV",  label:"IV",  x:64, y:72 },
    { id:"rv",  position:"RV",  label:"RV",  x:82, y:72 },

    { id:"zdm1", position:"ZDM", label:"ZDM", x:40, y:56 },
    { id:"zdm2", position:"ZDM", label:"ZDM", x:60, y:56 },

    { id:"lam", position:"LM",  label:"LM",  x:20, y:38 },
    { id:"zam", position:"ZOM", label:"ZOM", x:50, y:36 },
    { id:"ram", position:"RM",  label:"RM",  x:80, y:38 },

    { id:"st",  position:"ST",  label:"ST",  x:50, y:18 }
  ],

  "4-1-2-1-2": [
    { id:"tw",  position:"TW",  label:"TW",  x:50, y:88 },

    { id:"lv",  position:"LV",  label:"LV",  x:18, y:72 },
    { id:"iv1", position:"IV",  label:"IV",  x:36, y:72 },
    { id:"iv2", position:"IV",  label:"IV",  x:64, y:72 },
    { id:"rv",  position:"RV",  label:"RV",  x:82, y:72 },

    { id:"zdm", position:"ZDM", label:"ZDM", x:50, y:60 },

    { id:"zm1", position:"ZM",  label:"ZM",  x:32, y:48 },
    { id:"zm2", position:"ZM",  label:"ZM",  x:68, y:48 },

    { id:"zom", position:"ZOM", label:"ZOM", x:50, y:34 },

    { id:"st1", position:"ST",  label:"ST",  x:38, y:18 },
    { id:"st2", position:"ST",  label:"ST",  x:62, y:18 }
  ],

  "3-5-2": [
    { id:"tw",  position:"TW",  label:"TW",  x:50, y:88 },

    { id:"iv1", position:"IV",  label:"IV",  x:25, y:72 },
    { id:"iv2", position:"IV",  label:"IV",  x:50, y:72 },
    { id:"iv3", position:"IV",  label:"IV",  x:75, y:72 },

    { id:"lm",  position:"LM",  label:"LM",  x:10, y:50 },
    { id:"zm1", position:"ZM",  label:"ZM",  x:35, y:50 },
    { id:"zdm", position:"ZDM", label:"ZDM", x:50, y:56 },
    { id:"zm2", position:"ZM",  label:"ZM",  x:65, y:50 },
    { id:"rm",  position:"RM",  label:"RM",  x:90, y:50 },

    { id:"st1", position:"ST",  label:"ST",  x:38, y:22 },
    { id:"st2", position:"ST",  label:"ST",  x:62, y:22 }
  ]
};

export function getFormation(name) {
  return FORMATIONS[name];
}

export function getFormationNames() {
  return Object.keys(FORMATIONS);
}

export function getFormationSlots(name) {
  return FORMATIONS[name] || [];
}

export function getEmptyLineup(name) {

  const formation = getFormation(name);

  return formation.map(slot => ({
    slotId: slot.id,
    position: slot.position,
    player: null
  }));
}

export function getPositionCounts(name) {

  const formation = getFormation(name);

  const counts = {};

  formation.forEach(slot => {

    if (!counts[slot.position]) {
      counts[slot.position] = 0;
    }

    counts[slot.position]++;
  });

  return counts;
}

export function isPositionCompatible(player, slot) {

  if (!player) return false;
  if (!slot) return false;

  return player.positions.includes(slot.position);
}

export function getAvailableSlotsForPlayer(
  formationName,
  pickedPlayers,
  player
) {

  const formation = getFormation(formationName);

  return formation.filter(slot => {

    const alreadyUsed = pickedPlayers.some(
      picked => picked.slotId === slot.id
    );

    if (alreadyUsed) {
      return false;
    }

    return player.positions.includes(slot.position);
  });
}
