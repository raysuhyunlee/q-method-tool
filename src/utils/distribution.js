// Defines the Q-Sort pyramid structure
// Range: -4 to +4 (9 columns)

export const generateDistribution = (totalStatements) => {
  // Ideal symmetrical distribution for typical Q-sets (example for ~30-50 items)
  // Columns: -4, -3, -2, -1, 0, 1, 2, 3, 4

  // We need to fit 'totalStatements' into these 9 bins symmetrically.
  // We'll start with a base curve and adjust.

  // Standard Q distribution weights (approximate normal)
  const weights = [2, 3, 4, 5, 6, 5, 4, 3, 2]; // Sum = 34
  const sumWeights = weights.reduce((a, b) => a + b, 0);

  if (totalStatements === 0) return {};

  // Simple scaling algorithm
  // If count != 34, we distribute the difference.

  let currentSum = sumWeights;
  let distribution = [...weights];

  // If we have more items than slots, add to center moving outwards
  while (currentSum < totalStatements) {
    const center = 4; // Index of 0
    distribution[center]++;
    currentSum++;
    if (currentSum === totalStatements) break;

    // Add to -1, +1
    distribution[center - 1]++;
    currentSum++;
    if (currentSum === totalStatements) break;

    distribution[center + 1]++;
    currentSum++;
    if (currentSum === totalStatements) break;

    // Add to -2, +2
    distribution[center - 2]++;
    currentSum++;
    if (currentSum === totalStatements) break;

    distribution[center + 2]++;
    currentSum++;
    if (currentSum === totalStatements) break;

    // .. and so on. handling strictly simplified.
  }

  // If we have fewer items, remove from center moving outwards (flatten peak)
  while (currentSum > totalStatements) {
    const center = 4;
    if (distribution[center] > 1) {
      distribution[center]--;
      currentSum--;
      if (currentSum === totalStatements) break;
    }

    // Remove from neighbors
    // ... logic simplified, assuming generally we gain items.
    // For a robust tool, this might need better algo, but for now reasonable.
    if (distribution[center - 1] > 1) { distribution[center - 1]--; currentSum--; if (currentSum === totalStatements) break; }
    if (distribution[center + 1] > 1) { distribution[center + 1]--; currentSum--; if (currentSum === totalStatements) break; }
  }

  // Map to score keys
  const structure = {
    '-4': distribution[0],
    '-3': distribution[1],
    '-2': distribution[2],
    '-1': distribution[3],
    '0': distribution[4],
    '1': distribution[5],
    '2': distribution[6],
    '3': distribution[7],
    '4': distribution[8],
  };

  return structure;
};
