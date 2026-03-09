/**
 * MRL (Maximum Residue Limits) Calculator
 * Based on EU Regulation (EC) No 470/2009 and FDA standards
 * MRL values are in μg/kg (micrograms per kilogram)
 */

export interface MRLData {
  drugName: string;
  animalTypes: {
    [key: string]: {
      limitValue: number; // in μg/kg
      unit: string;
      withdrawalPeriod: number; // in days
    };
  };
}

// Industry-standard MRL limits based on EU and FDA regulations
export const INDUSTRY_STANDARD_MRLS: Record<string, MRLData> = {
  'Amoxicillin': {
    drugName: 'Amoxicillin',
    animalTypes: {
      'Cattle': { limitValue: 50, unit: 'μg/kg', withdrawalPeriod: 7 },
      'Pigs': { limitValue: 50, unit: 'μg/kg', withdrawalPeriod: 7 },
      'Poultry': { limitValue: 20, unit: 'μg/kg', withdrawalPeriod: 3 },
      'Sheep': { limitValue: 50, unit: 'μg/kg', withdrawalPeriod: 7 },
    },
  },
  'Oxytetracycline': {
    drugName: 'Oxytetracycline',
    animalTypes: {
      'Cattle': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Pigs': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Poultry': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 10 },
      'Sheep': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 28 },
    },
  },
  'Penicillin G': {
    drugName: 'Penicillin G',
    animalTypes: {
      'Cattle': { limitValue: 4, unit: 'μg/kg', withdrawalPeriod: 5 },
      'Pigs': { limitValue: 4, unit: 'μg/kg', withdrawalPeriod: 5 },
      'Poultry': { limitValue: 10, unit: 'μg/kg', withdrawalPeriod: 2 },
      'Sheep': { limitValue: 4, unit: 'μg/kg', withdrawalPeriod: 5 },
    },
  },
  'Sulfadiazine': {
    drugName: 'Sulfadiazine',
    animalTypes: {
      'Cattle': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
      'Pigs': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
      'Poultry': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 5 },
      'Sheep': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
    },
  },
  'Chlortetracycline': {
    drugName: 'Chlortetracycline',
    animalTypes: {
      'Cattle': { limitValue: 200, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Pigs': { limitValue: 200, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Poultry': { limitValue: 200, unit: 'μg/kg', withdrawalPeriod: 10 },
      'Sheep': { limitValue: 200, unit: 'μg/kg', withdrawalPeriod: 28 },
    },
  },
  'Gentamicin': {
    drugName: 'Gentamicin',
    animalTypes: {
      'Cattle': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
      'Pigs': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
      'Poultry': { limitValue: 50, unit: 'μg/kg', withdrawalPeriod: 7 },
      'Sheep': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
    },
  },
  'Enrofloxacin': {
    drugName: 'Enrofloxacin',
    animalTypes: {
      'Cattle': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Pigs': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
      'Poultry': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 10 },
      'Sheep': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 28 },
    },
  },
  'Metronidazole': {
    drugName: 'Metronidazole',
    animalTypes: {
      'Cattle': { limitValue: 10, unit: 'μg/kg', withdrawalPeriod: 7 },
      'Pigs': { limitValue: 10, unit: 'μg/kg', withdrawalPeriod: 7 },
      'Poultry': { limitValue: 10, unit: 'μg/kg', withdrawalPeriod: 5 },
      'Sheep': { limitValue: 10, unit: 'μg/kg', withdrawalPeriod: 7 },
    },
  },
};

interface MRLStatusResult {
  status: 'safe' | 'warning' | 'exceeded';
  percentageOfLimit: number;
  limitValue: number;
  withdrawalPeriod: number;
}

export interface TimeAwareMRLStatusResult {
  status: 'safe' | 'warning' | 'exceeded';
  percentageOfLimit: number;
  currentResiduePercentage: number;
  daysElapsed: number;
  daysUntilSafe: number;
  limitValue: number;
  withdrawalPeriod: number;
  isSafeForSlaughter: boolean;
}

/**
 * Calculates MRL status based on dose vs industry standard limits
 * @param drugName - Name of the drug
 * @param animalType - Type of animal
 * @param doseAmount - Amount of dose administered
 * @param doseUnit - Unit of dose (mg, ml, g)
 * @returns MRL status information
 */
export function calculateMRLStatus(
  drugName: string,
  animalType: string,
  doseAmount: number,
  doseUnit: string
): MRLStatusResult {
  const mrlData = INDUSTRY_STANDARD_MRLS[drugName];

  if (!mrlData) {
    // Default safe status if drug not in database
    return {
      status: 'safe',
      percentageOfLimit: 0,
      limitValue: 0,
      withdrawalPeriod: 0,
    };
  }

  const animalData = mrlData.animalTypes[animalType];

  if (!animalData) {
    // Default safe status if animal type not found
    return {
      status: 'safe',
      percentageOfLimit: 0,
      limitValue: 0,
      withdrawalPeriod: 0,
    };
  }

  // Convert dose to μg/kg for comparison
  // Assuming dose is per kg of animal body weight
  let doseInMicrogramsPerKg = doseAmount;

  // Convert from mg or g to μg
  if (doseUnit === 'mg') {
    doseInMicrogramsPerKg = doseAmount * 1000; // 1mg = 1000μg
  } else if (doseUnit === 'g') {
    doseInMicrogramsPerKg = doseAmount * 1000000; // 1g = 1,000,000μg
  }
  // If it's already in μg, no conversion needed
  // If it's ml, we keep as is (assuming 1:1 ratio for liquid formulations)

  const percentageOfLimit = (doseInMicrogramsPerKg / animalData.limitValue) * 100;

  let status: 'safe' | 'warning' | 'exceeded';

  if (percentageOfLimit <= 50) {
    status = 'safe';
  } else if (percentageOfLimit <= 100) {
    status = 'warning';
  } else {
    status = 'exceeded';
  }

  return {
    status,
    percentageOfLimit: Math.round(percentageOfLimit * 100) / 100,
    limitValue: animalData.limitValue,
    withdrawalPeriod: animalData.withdrawalPeriod,
  };
}

/**
 * Get MRL limit for a specific drug and animal type
 */
export function getMRLLimit(drugName: string, animalType: string): number | null {
  const mrlData = INDUSTRY_STANDARD_MRLS[drugName];
  if (!mrlData) return null;

  const animalData = mrlData.animalTypes[animalType];
  return animalData?.limitValue ?? null;
}

/**
 * Get withdrawal period for a specific drug and animal type
 */
export function getWithdrawalPeriod(drugName: string, animalType: string): number | null {
  const mrlData = INDUSTRY_STANDARD_MRLS[drugName];
  if (!mrlData) return null;

  const animalData = mrlData.animalTypes[animalType];
  return animalData?.withdrawalPeriod ?? null;
}

/**
 * Helper function to calculate days between two dates
 * @param startDate - Start date (administration date)
 * @param endDate - End date (current date)
 * @returns Number of days between dates
 */
function calculateDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const diffInMs = end - start;
  return Math.floor(diffInMs / 86400000);  // Convert milliseconds to days (1 day = 86,400,000 ms)
}

/**
 * Calculates time-aware MRL status based on dose and time elapsed since administration
 * Uses linear depletion model: residues decline linearly from initial dose to 0% over withdrawal period
 * Based on EU Regulation (EC) No 470/2009 and FDA CVM guidelines
 *
 * @param drugName - Name of the drug
 * @param animalType - Type of animal
 * @param doseAmount - Amount of dose administered
 * @param doseUnit - Unit of dose (mg, ml, g)
 * @param administrationDate - Date when drug was administered
 * @param currentDate - Current date (defaults to today)
 * @returns Time-aware MRL status information with residue depletion
 */
export function calculateTimeAwareMRLStatus(
  drugName: string,
  animalType: string,
  doseAmount: number,
  doseUnit: string,
  administrationDate: string | Date,
  currentDate: string | Date = new Date()
): TimeAwareMRLStatusResult {
  // Step 1: Get baseline MRL data
  const mrlData = INDUSTRY_STANDARD_MRLS[drugName];

  if (!mrlData) {
    // Default safe status if drug not in database
    return {
      status: 'safe',
      percentageOfLimit: 0,
      currentResiduePercentage: 0,
      daysElapsed: 0,
      daysUntilSafe: 0,
      limitValue: 0,
      withdrawalPeriod: 0,
      isSafeForSlaughter: true,
    };
  }

  const animalData = mrlData.animalTypes[animalType];

  if (!animalData) {
    // Default safe status if animal type not found
    return {
      status: 'safe',
      percentageOfLimit: 0,
      currentResiduePercentage: 0,
      daysElapsed: 0,
      daysUntilSafe: 0,
      limitValue: 0,
      withdrawalPeriod: 0,
      isSafeForSlaughter: true,
    };
  }

  // Step 2: Convert dose to μg/kg for comparison (reuse existing logic)
  let doseInMicrogramsPerKg = doseAmount;

  if (doseUnit === 'mg') {
    doseInMicrogramsPerKg = doseAmount * 1000; // 1mg = 1000μg
  } else if (doseUnit === 'g') {
    doseInMicrogramsPerKg = doseAmount * 1000000; // 1g = 1,000,000μg
  }
  // If it's already in μg or ml, keep as is

  // Step 3: Calculate INITIAL percentage at administration (Day 0)
  const initialPercentageOfLimit = (doseInMicrogramsPerKg / animalData.limitValue) * 100;

  // Step 4: Calculate time elapsed since administration
  let daysElapsed = calculateDaysBetween(administrationDate, currentDate);

  // Handle future dates defensively
  if (daysElapsed < 0) {
    daysElapsed = 0;
  }

  const withdrawalPeriod = animalData.withdrawalPeriod;

  // Step 5: Calculate CURRENT residue percentage using linear depletion model
  let currentResiduePercentage: number;
  let daysUntilSafe: number;
  let isSafeForSlaughter: boolean;

  if (daysElapsed >= withdrawalPeriod) {
    // Past withdrawal period - residues below MRL, safe for slaughter
    currentResiduePercentage = 0;
    daysUntilSafe = 0;
    isSafeForSlaughter = true;
  } else {
    // During withdrawal period - residues still depleting
    // Linear depletion formula: residues decline from initial to 0 over withdrawal period
    const depletionFactor = 1 - (daysElapsed / withdrawalPeriod);
    currentResiduePercentage = initialPercentageOfLimit * depletionFactor;
    daysUntilSafe = withdrawalPeriod - daysElapsed;
    isSafeForSlaughter = false;
  }

  // Step 6: Determine time-aware MRL status based on CURRENT residue level
  let status: 'safe' | 'warning' | 'exceeded';

  if (daysElapsed >= withdrawalPeriod) {
    // Always safe after withdrawal period
    status = 'safe';
  } else if (currentResiduePercentage <= 50) {
    status = 'safe';  // Well below limit
  } else if (currentResiduePercentage <= 100) {
    status = 'warning';  // Approaching limit
  } else {
    status = 'exceeded';  // Above limit
  }

  return {
    status,
    percentageOfLimit: Math.round(initialPercentageOfLimit * 100) / 100,
    currentResiduePercentage: Math.round(currentResiduePercentage * 100) / 100,
    daysElapsed,
    daysUntilSafe,
    limitValue: animalData.limitValue,
    withdrawalPeriod,
    isSafeForSlaughter,
  };
}

