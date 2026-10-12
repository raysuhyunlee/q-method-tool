// Placements map slot ids (`slot-<score>-<index>`) to card ids.
export const slotId = (score, index) => `slot-${score}-${index}`;

export const toScores = (placements) => {
  const scores = {};
  Object.entries(placements).forEach(([slot, cardId]) => {
    const match = slot.match(/^slot-(-?\d+)-\d+$/);
    if (match) scores[cardId] = parseInt(match[1], 10);
  });
  return scores;
};
