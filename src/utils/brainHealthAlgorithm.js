// Coefficients from Rowson-Duma CP Model
const BETA = {
  b0: -10.2,
  b1: 0.0433,        // Linear weighting
  b2: 0.000873,      // Rotational weighting
  b3: -0.00000092    // Interaction term
};

// Regional Vulnerability Weighting Matrix (from Paper)
// Weights how much an impact vector affects a specific lobe
const REGIONAL_WEIGHTS = {
  // Impact Vector: Front
  'Front': { 
    'Frontal': 1.0, 
    'Occipital': 0.8, // Contrecoup
    'Parietal Left': 0.3, 'Parietal Right': 0.3,
    'Temporal Left': 0.2, 'Temporal Right': 0.2, 
    'Cerebellum': 0.2 
  },
  // Impact Vector: Back
  'Back': { 
    'Occipital': 1.0, 
    'Frontal': 0.8, // Contrecoup
    'Parietal Left': 0.3, 'Parietal Right': 0.3,
    'Temporal Left': 0.2, 'Temporal Right': 0.2, 
    'Cerebellum': 1.0 
  },
  // Impact Vector: Side (Left/Right)
  'Side': { 
    'Temporal Left': 1.5, 'Temporal Right': 1.5, // Sphenoid Ridge risk
    'Parietal Left': 0.8, 'Parietal Right': 0.8,
    'Frontal': 0.3, 
    'Occipital': 0.2,
    'Cerebellum': 0.2 
  },
  // Impact Vector: Top (Crown)
  'Top': { 
    'Parietal Left': 1.2, 'Parietal Right': 1.2,
    'Temporal Left': 0.6, 'Temporal Right': 0.6, // Axial loading
    'Frontal': 0.4, 
    'Occipital': 0.4,
    'Cerebellum': 0.2 
  }
};

// Map sensor "Zone" to likely "Impact Vector"
const ZONE_TO_VECTOR = {
  'Frontal': 'Front',
  'Occipital': 'Back',
  'Cerebellum': 'Back',
  'Temporal Left': 'Side',
  'Temporal Right': 'Side',
  'Parietal Left': 'Top',
  'Parietal Right': 'Top'
};

/**
 * Calculates Combined Probability (CP) of injury for a single impact.
 * Formula: 1 / (1 + e^-(b0 + b1*a + b2*alpha + b3*a*alpha))
 * @param {number} linearG - Linear acceleration in Gs
 * @param {number} rotRad - Rotational acceleration in rad/s^2 (Optional, estimated if missing)
 */
const calculateCP = (linearG, rotRad = null) => {
  // Estimate rotation if not provided: ~50 rad/s^2 per G is a common rough heuristic for sporting impacts
  const alpha = rotRad || (linearG * 50); 
  const exponent = -(BETA.b0 + (BETA.b1 * linearG) + (BETA.b2 * alpha) + (BETA.b3 * linearG * alpha));
  return 1 / (1 + Math.exp(exponent));
};

/**
 * Calculates the Time-Decayed Risk Contribution of an impact.
 * Formula: CP * e^(-gamma * daysSinceImpact)
 * @param {number} cp - Combined Probability
 * @param {string} dateStr - Date of impact (YYYY-MM-DD)
 */
const calculateDecayedRisk = (cp, dateStr) => {
  const impactDate = new Date(dateStr);
  const today = new Date();
  const diffTime = Math.abs(today - impactDate);
  const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  // Gamma = 0.15 (Recovery Constant) -> ~30 days for full recovery
  const gamma = 0.15;
  return cp * Math.exp(-gamma * daysPassed);
};

/**
 * Main function to process history and return Brain Health Scores.
 * @param {Array} history - Array of session objects with impactDetails
 */
export const calculateBrainHealth = (history) => {
  let totalLoad = 0;
  
  // Regional Loads
  const regionalLoads = {
    'Frontal': 0,
    'Temporal Left': 0, 'Temporal Right': 0,
    'Parietal Left': 0, 'Parietal Right': 0,
    'Occipital': 0,
    'Cerebellum': 0
  };

  const regionalStats = {
    'Frontal': { impacts: 0, maxForce: 0 },
    'Temporal Left': { impacts: 0, maxForce: 0 },
    'Temporal Right': { impacts: 0, maxForce: 0 },
    'Parietal Left': { impacts: 0, maxForce: 0 },
    'Parietal Right': { impacts: 0, maxForce: 0 },
    'Occipital': { impacts: 0, maxForce: 0 },
    'Cerebellum': { impacts: 0, maxForce: 0 }
  };

  history.forEach(session => {
    session.impactDetails.forEach(impact => {
      // 1. Calculate Base CP
      const cp = calculateCP(impact.gForce);

      // 2. Apply Time Decay
      const decayedRisk = calculateDecayedRisk(cp, session.date);

      // 3. Add to Total Load
      totalLoad += decayedRisk;

      // 4. Distribute to Regions
      const vector = ZONE_TO_VECTOR[impact.zone] || 'Front';
      const weights = REGIONAL_WEIGHTS[vector];

      Object.keys(regionalLoads).forEach(region => {
        // Load Accumulation
        const weight = weights[region] || 0.1;
        regionalLoads[region] += (decayedRisk * weight);
      });

      // 5. Update raw stats for the region (non-decayed, just for max force tracking)
      if (regionalStats[impact.zone]) {
        regionalStats[impact.zone].impacts += 1;
        regionalStats[impact.zone].maxForce = Math.max(regionalStats[impact.zone].maxForce, impact.gForce);
      }
    });
  });

  // Calculate Final Scores (0-100)
  // L_crit = 1.0 (Critical Load Threshold)
  const L_crit = 1.0;
  
  const bhs = Math.max(0, 100 * (1 - (totalLoad / L_crit)));

  const regionalScores = {};
  Object.keys(regionalLoads).forEach(region => {
    const score = Math.max(0, 100 * (1 - (regionalLoads[region] / L_crit)));
    
    // Determine Risk Label
    let riskLabel = 'None';
    if (score < 50) riskLabel = 'High';
    else if (score < 80) riskLabel = 'Med';
    else if (score < 95) riskLabel = 'Low';

    regionalScores[region] = {
      score: Math.round(score),
      risk: riskLabel,
      impacts: regionalStats[region].impacts,
      maxForce: regionalStats[region].maxForce,
      rawLoad: regionalLoads[region] // For heatmap intensity
    };
  });

  return {
    totalScore: Math.round(bhs),
    regionalScores
  };
};
