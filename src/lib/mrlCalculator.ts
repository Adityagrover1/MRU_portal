/**
 * MRL (Maximum Residue Limits) Calculator
 * Based on EU Regulation (EC) No 470/2009, FDA standards, and FSSAI standards
 * MRL values are in μg/kg (micrograms per kilogram) for EU/FDA
 * MRL values are in mg/kg (milligrams per kilogram) for FSSAI
 */

export type RegulatoryStandard = 'EU_FDA' | 'FSSAI';

export interface MRLData {
  drugName: string;
  animalTypes: {
    [key: string]: {
      limitValue: number; // in μg/kg (EU/FDA) or mg/kg (FSSAI)
      unit: string;
      withdrawalPeriod: number; // in days
    };
  };
}

export interface FSSAIMRLData {
  drugName: string;
  animalTypes: {
    [key: string]: {
      tissues: {
        [key: string]: {
          limitValue: number; // in mg/kg
          unit: string;
        };
      };
      withdrawalPeriod?: number; // in days (when specified by FSSAI)
    };
  };
}

// FSSAI-based MRL limits (in mg/kg)
// Source: FSSAI Compendium of Contaminants and Regulations v6 (2022-01-28)
export const FSSAI_STANDARDS_MRLS: Record<string, FSSAIMRLData> = {
  'Ampicillin': {
    drugName: 'Ampicillin',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.01, unit: 'mg/kg' },
          'liver': { limitValue: 0.01, unit: 'mg/kg' },
          'kidney': { limitValue: 0.01, unit: 'mg/kg' },
          'fat': { limitValue: 0.01, unit: 'mg/kg' },
          'milk': { limitValue: 0.01, unit: 'mg/kg' },
        },
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.01, unit: 'mg/kg' },
          'liver': { limitValue: 0.01, unit: 'mg/kg' },
          'kidney': { limitValue: 0.01, unit: 'mg/kg' },
          'fat': { limitValue: 0.01, unit: 'mg/kg' },
        },
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.01, unit: 'mg/kg' },
          'liver': { limitValue: 0.01, unit: 'mg/kg' },
          'kidney': { limitValue: 0.01, unit: 'mg/kg' },
          'fat': { limitValue: 0.01, unit: 'mg/kg' },
        },
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.01, unit: 'mg/kg' },
          'liver': { limitValue: 0.01, unit: 'mg/kg' },
          'kidney': { limitValue: 0.01, unit: 'mg/kg' },
          'fat': { limitValue: 0.01, unit: 'mg/kg' },
          'milk': { limitValue: 0.01, unit: 'mg/kg' },
        },
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.01, unit: 'mg/kg' },
          'liver': { limitValue: 0.01, unit: 'mg/kg' },
          'kidney': { limitValue: 0.01, unit: 'mg/kg' },
          'fat': { limitValue: 0.01, unit: 'mg/kg' },
          'milk': { limitValue: 0.01, unit: 'mg/kg' },
        },
      },
    },
  },
  'Streptomycin': {
    drugName: 'Streptomycin/Dihydrostreptomycin',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.6, unit: 'mg/kg' },
          'liver': { limitValue: 0.6, unit: 'mg/kg' },
          'kidney': { limitValue: 1.0, unit: 'mg/kg' },
          'fat': { limitValue: 0.6, unit: 'mg/kg' },
          'milk': { limitValue: 0.02, unit: 'mg/kg' },
        },
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.6, unit: 'mg/kg' },
          'liver': { limitValue: 0.6, unit: 'mg/kg' },
          'kidney': { limitValue: 1.0, unit: 'mg/kg' },
          'fat': { limitValue: 0.6, unit: 'mg/kg' },
        },
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.6, unit: 'mg/kg' },
          'liver': { limitValue: 0.6, unit: 'mg/kg' },
          'kidney': { limitValue: 1.0, unit: 'mg/kg' },
          'fat': { limitValue: 0.6, unit: 'mg/kg' },
        },
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.6, unit: 'mg/kg' },
          'liver': { limitValue: 0.6, unit: 'mg/kg' },
          'kidney': { limitValue: 1.0, unit: 'mg/kg' },
          'fat': { limitValue: 0.6, unit: 'mg/kg' },
          'milk': { limitValue: 0.2, unit: 'mg/kg' },
        },
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.6, unit: 'mg/kg' },
          'liver': { limitValue: 0.6, unit: 'mg/kg' },
          'kidney': { limitValue: 1.0, unit: 'mg/kg' },
          'fat': { limitValue: 0.6, unit: 'mg/kg' },
          'milk': { limitValue: 0.2, unit: 'mg/kg' },
        },
      },
    },
  },
  'Tetracycline': {
    drugName: 'Tetracyclines (Tetracycline, Oxytetracycline, Chlortetracycline)',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.2, unit: 'mg/kg' },
          'liver': { limitValue: 0.6, unit: 'mg/kg' },
          'kidney': { limitValue: 1.2, unit: 'mg/kg' },
          'fat': { limitValue: 0.2, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.2, unit: 'mg/kg' },
          'liver': { limitValue: 0.6, unit: 'mg/kg' },
          'kidney': { limitValue: 1.2, unit: 'mg/kg' },
          'fat': { limitValue: 0.2, unit: 'mg/kg' },
        },
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.2, unit: 'mg/kg' },
          'liver': { limitValue: 0.6, unit: 'mg/kg' },
          'kidney': { limitValue: 1.2, unit: 'mg/kg' },
          'fat': { limitValue: 0.2, unit: 'mg/kg' },
          'eggs': { limitValue: 0.4, unit: 'mg/kg' },
        },
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.2, unit: 'mg/kg' },
          'liver': { limitValue: 0.6, unit: 'mg/kg' },
          'kidney': { limitValue: 1.2, unit: 'mg/kg' },
          'fat': { limitValue: 0.2, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.2, unit: 'mg/kg' },
          'liver': { limitValue: 0.6, unit: 'mg/kg' },
          'kidney': { limitValue: 1.2, unit: 'mg/kg' },
          'fat': { limitValue: 0.2, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
      },
    },
  },
  'Erythromycin': {
    drugName: 'Erythromycin',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
        },
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'eggs': { limitValue: 0.05, unit: 'mg/kg' },
        },
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
      },
    },
  },
  'Neomycin': {
    drugName: 'Neomycin',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.5, unit: 'mg/kg' },
          'liver': { limitValue: 0.5, unit: 'mg/kg' },
          'kidney': { limitValue: 10.0, unit: 'mg/kg' },
          'fat': { limitValue: 0.5, unit: 'mg/kg' },
          'milk': { limitValue: 1.5, unit: 'mg/kg' },
        },
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.5, unit: 'mg/kg' },
          'liver': { limitValue: 0.5, unit: 'mg/kg' },
          'kidney': { limitValue: 10.0, unit: 'mg/kg' },
          'fat': { limitValue: 0.5, unit: 'mg/kg' },
        },
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.5, unit: 'mg/kg' },
          'liver': { limitValue: 0.5, unit: 'mg/kg' },
          'kidney': { limitValue: 10.0, unit: 'mg/kg' },
          'fat': { limitValue: 0.5, unit: 'mg/kg' },
          'eggs': { limitValue: 0.5, unit: 'mg/kg' },
        },
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.5, unit: 'mg/kg' },
          'liver': { limitValue: 0.5, unit: 'mg/kg' },
          'kidney': { limitValue: 10.0, unit: 'mg/kg' },
          'fat': { limitValue: 0.5, unit: 'mg/kg' },
        },
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.5, unit: 'mg/kg' },
          'liver': { limitValue: 0.5, unit: 'mg/kg' },
          'kidney': { limitValue: 10.0, unit: 'mg/kg' },
          'fat': { limitValue: 0.5, unit: 'mg/kg' },
          'milk': { limitValue: 1.5, unit: 'mg/kg' },
        },
      },
    },
  },
  'Amoxicillin': {
    drugName: 'Amoxicillin',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.05, unit: 'mg/kg' },
          'liver': { limitValue: 0.05, unit: 'mg/kg' },
          'kidney': { limitValue: 0.05, unit: 'mg/kg' },
          'fat': { limitValue: 0.05, unit: 'mg/kg' },
          'milk': { limitValue: 0.05, unit: 'mg/kg' },
        },
        withdrawalPeriod: 7,
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.05, unit: 'mg/kg' },
          'liver': { limitValue: 0.05, unit: 'mg/kg' },
          'kidney': { limitValue: 0.05, unit: 'mg/kg' },
          'fat': { limitValue: 0.05, unit: 'mg/kg' },
        },
        withdrawalPeriod: 7,
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.02, unit: 'mg/kg' },
          'liver': { limitValue: 0.02, unit: 'mg/kg' },
          'kidney': { limitValue: 0.02, unit: 'mg/kg' },
          'fat': { limitValue: 0.02, unit: 'mg/kg' },
          'eggs': { limitValue: 0.02, unit: 'mg/kg' },
        },
        withdrawalPeriod: 3,
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.05, unit: 'mg/kg' },
          'liver': { limitValue: 0.05, unit: 'mg/kg' },
          'kidney': { limitValue: 0.05, unit: 'mg/kg' },
          'fat': { limitValue: 0.05, unit: 'mg/kg' },
          'milk': { limitValue: 0.05, unit: 'mg/kg' },
        },
        withdrawalPeriod: 7,
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.05, unit: 'mg/kg' },
          'liver': { limitValue: 0.05, unit: 'mg/kg' },
          'kidney': { limitValue: 0.05, unit: 'mg/kg' },
          'fat': { limitValue: 0.05, unit: 'mg/kg' },
          'milk': { limitValue: 0.05, unit: 'mg/kg' },
        },
        withdrawalPeriod: 7,
      },
    },
  },
  'Oxytetracycline': {
    drugName: 'Oxytetracycline',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 28,
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 28,
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'eggs': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 10,
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 28,
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 28,
      },
    },
  },
  'Penicillin G': {
    drugName: 'Penicillin G',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.004, unit: 'mg/kg' },
          'liver': { limitValue: 0.004, unit: 'mg/kg' },
          'kidney': { limitValue: 0.004, unit: 'mg/kg' },
          'fat': { limitValue: 0.004, unit: 'mg/kg' },
          'milk': { limitValue: 0.004, unit: 'mg/kg' },
        },
        withdrawalPeriod: 5,
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.004, unit: 'mg/kg' },
          'liver': { limitValue: 0.004, unit: 'mg/kg' },
          'kidney': { limitValue: 0.004, unit: 'mg/kg' },
          'fat': { limitValue: 0.004, unit: 'mg/kg' },
        },
        withdrawalPeriod: 5,
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.01, unit: 'mg/kg' },
          'liver': { limitValue: 0.01, unit: 'mg/kg' },
          'kidney': { limitValue: 0.01, unit: 'mg/kg' },
          'fat': { limitValue: 0.01, unit: 'mg/kg' },
          'eggs': { limitValue: 0.01, unit: 'mg/kg' },
        },
        withdrawalPeriod: 2,
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.004, unit: 'mg/kg' },
          'liver': { limitValue: 0.004, unit: 'mg/kg' },
          'kidney': { limitValue: 0.004, unit: 'mg/kg' },
          'fat': { limitValue: 0.004, unit: 'mg/kg' },
          'milk': { limitValue: 0.004, unit: 'mg/kg' },
        },
        withdrawalPeriod: 5,
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.004, unit: 'mg/kg' },
          'liver': { limitValue: 0.004, unit: 'mg/kg' },
          'kidney': { limitValue: 0.004, unit: 'mg/kg' },
          'fat': { limitValue: 0.004, unit: 'mg/kg' },
          'milk': { limitValue: 0.004, unit: 'mg/kg' },
        },
        withdrawalPeriod: 5,
      },
    },
  },
  'Sulfadiazine': {
    drugName: 'Sulfadiazine',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 14,
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 14,
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'eggs': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 5,
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 14,
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 14,
      },
    },
  },
  'Chlortetracycline': {
    drugName: 'Chlortetracycline',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.2, unit: 'mg/kg' },
          'liver': { limitValue: 0.2, unit: 'mg/kg' },
          'kidney': { limitValue: 0.2, unit: 'mg/kg' },
          'fat': { limitValue: 0.2, unit: 'mg/kg' },
          'milk': { limitValue: 0.2, unit: 'mg/kg' },
        },
        withdrawalPeriod: 28,
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.2, unit: 'mg/kg' },
          'liver': { limitValue: 0.2, unit: 'mg/kg' },
          'kidney': { limitValue: 0.2, unit: 'mg/kg' },
          'fat': { limitValue: 0.2, unit: 'mg/kg' },
        },
        withdrawalPeriod: 28,
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.2, unit: 'mg/kg' },
          'liver': { limitValue: 0.2, unit: 'mg/kg' },
          'kidney': { limitValue: 0.2, unit: 'mg/kg' },
          'fat': { limitValue: 0.2, unit: 'mg/kg' },
          'eggs': { limitValue: 0.2, unit: 'mg/kg' },
        },
        withdrawalPeriod: 10,
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.2, unit: 'mg/kg' },
          'liver': { limitValue: 0.2, unit: 'mg/kg' },
          'kidney': { limitValue: 0.2, unit: 'mg/kg' },
          'fat': { limitValue: 0.2, unit: 'mg/kg' },
          'milk': { limitValue: 0.2, unit: 'mg/kg' },
        },
        withdrawalPeriod: 28,
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.2, unit: 'mg/kg' },
          'liver': { limitValue: 0.2, unit: 'mg/kg' },
          'kidney': { limitValue: 0.2, unit: 'mg/kg' },
          'fat': { limitValue: 0.2, unit: 'mg/kg' },
          'milk': { limitValue: 0.2, unit: 'mg/kg' },
        },
        withdrawalPeriod: 28,
      },
    },
  },
  'Gentamicin': {
    drugName: 'Gentamicin',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 14,
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 14,
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.05, unit: 'mg/kg' },
          'liver': { limitValue: 0.05, unit: 'mg/kg' },
          'kidney': { limitValue: 0.05, unit: 'mg/kg' },
          'fat': { limitValue: 0.05, unit: 'mg/kg' },
          'eggs': { limitValue: 0.05, unit: 'mg/kg' },
        },
        withdrawalPeriod: 7,
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 14,
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 14,
      },
    },
  },
  'Enrofloxacin': {
    drugName: 'Enrofloxacin',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 28,
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 14,
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'eggs': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 10,
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 28,
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.1, unit: 'mg/kg' },
          'liver': { limitValue: 0.1, unit: 'mg/kg' },
          'kidney': { limitValue: 0.1, unit: 'mg/kg' },
          'fat': { limitValue: 0.1, unit: 'mg/kg' },
          'milk': { limitValue: 0.1, unit: 'mg/kg' },
        },
        withdrawalPeriod: 28,
      },
    },
  },
  'Metronidazole': {
    drugName: 'Metronidazole',
    animalTypes: {
      'Cattle': {
        tissues: {
          'muscle': { limitValue: 0.01, unit: 'mg/kg' },
          'liver': { limitValue: 0.01, unit: 'mg/kg' },
          'kidney': { limitValue: 0.01, unit: 'mg/kg' },
          'fat': { limitValue: 0.01, unit: 'mg/kg' },
          'milk': { limitValue: 0.01, unit: 'mg/kg' },
        },
        withdrawalPeriod: 7,
      },
      'Pig': {
        tissues: {
          'muscle': { limitValue: 0.01, unit: 'mg/kg' },
          'liver': { limitValue: 0.01, unit: 'mg/kg' },
          'kidney': { limitValue: 0.01, unit: 'mg/kg' },
          'fat': { limitValue: 0.01, unit: 'mg/kg' },
        },
        withdrawalPeriod: 7,
      },
      'Poultry': {
        tissues: {
          'muscle': { limitValue: 0.01, unit: 'mg/kg' },
          'liver': { limitValue: 0.01, unit: 'mg/kg' },
          'kidney': { limitValue: 0.01, unit: 'mg/kg' },
          'fat': { limitValue: 0.01, unit: 'mg/kg' },
          'eggs': { limitValue: 0.01, unit: 'mg/kg' },
        },
        withdrawalPeriod: 5,
      },
      'Sheep': {
        tissues: {
          'muscle': { limitValue: 0.01, unit: 'mg/kg' },
          'liver': { limitValue: 0.01, unit: 'mg/kg' },
          'kidney': { limitValue: 0.01, unit: 'mg/kg' },
          'fat': { limitValue: 0.01, unit: 'mg/kg' },
          'milk': { limitValue: 0.01, unit: 'mg/kg' },
        },
        withdrawalPeriod: 7,
      },
      'Goat': {
        tissues: {
          'muscle': { limitValue: 0.01, unit: 'mg/kg' },
          'liver': { limitValue: 0.01, unit: 'mg/kg' },
          'kidney': { limitValue: 0.01, unit: 'mg/kg' },
          'fat': { limitValue: 0.01, unit: 'mg/kg' },
          'milk': { limitValue: 0.01, unit: 'mg/kg' },
        },
        withdrawalPeriod: 7,
      },
    },
  },
};

// Industry-standard MRL limits based on EU and FDA regulations (in μg/kg)
export const INDUSTRY_STANDARD_MRLS: Record<string, MRLData> = {
  'Amoxicillin': {
    drugName: 'Amoxicillin',
    animalTypes: {
      'Cattle': { limitValue: 50, unit: 'μg/kg', withdrawalPeriod: 7 },
      'Pigs': { limitValue: 50, unit: 'μg/kg', withdrawalPeriod: 7 },
      'Poultry': { limitValue: 20, unit: 'μg/kg', withdrawalPeriod: 3 },
      'Sheep': { limitValue: 50, unit: 'μg/kg', withdrawalPeriod: 7 },
      'Goat': { limitValue: 50, unit: 'μg/kg', withdrawalPeriod: 7 },
    },
  },
  'Oxytetracycline': {
    drugName: 'Oxytetracycline',
    animalTypes: {
      'Cattle': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Pigs': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Poultry': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 10 },
      'Sheep': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Goat': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 28 },
    },
  },
  'Penicillin G': {
    drugName: 'Penicillin G',
    animalTypes: {
      'Cattle': { limitValue: 4, unit: 'μg/kg', withdrawalPeriod: 5 },
      'Pigs': { limitValue: 4, unit: 'μg/kg', withdrawalPeriod: 5 },
      'Poultry': { limitValue: 10, unit: 'μg/kg', withdrawalPeriod: 2 },
      'Sheep': { limitValue: 4, unit: 'μg/kg', withdrawalPeriod: 5 },
      'Goat': { limitValue: 4, unit: 'μg/kg', withdrawalPeriod: 5 },
    },
  },
  'Sulfadiazine': {
    drugName: 'Sulfadiazine',
    animalTypes: {
      'Cattle': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
      'Pigs': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
      'Poultry': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 5 },
      'Sheep': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
      'Goat': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
    },
  },
  'Chlortetracycline': {
    drugName: 'Chlortetracycline',
    animalTypes: {
      'Cattle': { limitValue: 200, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Pigs': { limitValue: 200, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Poultry': { limitValue: 200, unit: 'μg/kg', withdrawalPeriod: 10 },
      'Sheep': { limitValue: 200, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Goat': { limitValue: 200, unit: 'μg/kg', withdrawalPeriod: 28 },
    },
  },
  'Gentamicin': {
    drugName: 'Gentamicin',
    animalTypes: {
      'Cattle': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
      'Pigs': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
      'Poultry': { limitValue: 50, unit: 'μg/kg', withdrawalPeriod: 7 },
      'Sheep': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
      'Goat': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
    },
  },
  'Enrofloxacin': {
    drugName: 'Enrofloxacin',
    animalTypes: {
      'Cattle': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Pigs': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 14 },
      'Poultry': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 10 },
      'Sheep': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 28 },
      'Goat': { limitValue: 100, unit: 'μg/kg', withdrawalPeriod: 28 },
    },
  },
  'Metronidazole': {
    drugName: 'Metronidazole',
    animalTypes: {
      'Cattle': { limitValue: 10, unit: 'μg/kg', withdrawalPeriod: 7 },
      'Pigs': { limitValue: 10, unit: 'μg/kg', withdrawalPeriod: 7 },
      'Poultry': { limitValue: 10, unit: 'μg/kg', withdrawalPeriod: 5 },
      'Sheep': { limitValue: 10, unit: 'μg/kg', withdrawalPeriod: 7 },
      'Goat': { limitValue: 10, unit: 'μg/kg', withdrawalPeriod: 7 },
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
 * Calculates MRL status based on dose vs regulatory standard limits
 * @param drugName - Name of the drug
 * @param animalType - Type of animal
 * @param doseAmount - Amount of dose administered
 * @param doseUnit - Unit of dose (mg, ml, g)
 * @param standard - Regulatory standard to use (EU_FDA or FSSAI)
 * @returns MRL status information
 */
export function calculateMRLStatus(
  drugName: string,
  animalType: string,
  doseAmount: number,
  doseUnit: string,
  standard: RegulatoryStandard = 'EU_FDA'
): MRLStatusResult {
  if (standard === 'FSSAI') {
    return calculateFSSAIMRLStatus(drugName, animalType, doseAmount, doseUnit);
  }
  return calculateEUFDAMRLStatus(drugName, animalType, doseAmount, doseUnit);
}

/**
 * Calculates EU/FDA MRL status based on dose vs industry standard limits
 * @param drugName - Name of the drug
 * @param animalType - Type of animal
 * @param doseAmount - Amount of dose administered
 * @param doseUnit - Unit of dose (mg, ml, g)
 * @returns MRL status information
 */
function calculateEUFDAMRLStatus(
  drugName: string,
  animalType: string,
  doseAmount: number,
  doseUnit: string
): MRLStatusResult {
  const mrlData = INDUSTRY_STANDARD_MRLS[drugName];

  if (!mrlData) {
    // Drug not in database — cannot verify safety, treat as exceeded
    return {
      status: 'exceeded',
      percentageOfLimit: 0,
      limitValue: 0,
      withdrawalPeriod: 0,
    };
  }

  const animalData = mrlData.animalTypes[animalType];

  if (!animalData) {
    // Animal type not defined for this drug — cannot verify safety, treat as exceeded
    return {
      status: 'exceeded',
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
 * Calculates FSSAI MRL status based on dose vs FSSAI standards
 * Uses muscle tissue as default for comparison
 * @param drugName - Name of the drug
 * @param animalType - Type of animal
 * @param doseAmount - Amount of dose administered
 * @param doseUnit - Unit of dose (mg, ml, g)
 * @returns MRL status information
 */
function calculateFSSAIMRLStatus(
  drugName: string,
  animalType: string,
  doseAmount: number,
  doseUnit: string
): MRLStatusResult {
  const mrlData = FSSAI_STANDARDS_MRLS[drugName];

  if (!mrlData) {
    // Drug not found in FSSAI database
    console.warn(`Warning: Drug "${drugName}" not found in FSSAI MRL standards. Using default limits.`);
    return {
      status: 'warning',  // Changed from 'safe' to 'warning' for safety
      percentageOfLimit: 0,
      limitValue: 0,
      withdrawalPeriod: 0,
    };
  }

  const animalData = mrlData.animalTypes[animalType];

  if (!animalData) {
    // Animal type not found for this drug
    console.warn(`Warning: Animal type "${animalType}" not supported for drug "${drugName}" in FSSAI standards. Please check your input.`);
    return {
      status: 'warning',  // Changed from 'safe' to 'warning' for safety
      percentageOfLimit: 0,
      limitValue: 0,
      withdrawalPeriod: 0,
    };
  }

  // Use muscle tissue as default, or the first available tissue
  const tissueLimit = animalData.tissues['muscle'] ||
                      Object.values(animalData.tissues)[0];

  if (!tissueLimit) {
    console.warn(`Warning: No tissue data found for "${drugName}" in "${animalType}".`);
    return {
      status: 'warning',  // Changed from 'safe' to 'warning' for safety
      percentageOfLimit: 0,
      limitValue: 0,
      withdrawalPeriod: 0,
    };
  }

  // Convert dose to mg/kg for comparison
  let doseInMg = doseAmount;

  // Convert to mg
  if (doseUnit === 'mg') {
    doseInMg = doseAmount; // Already in mg
  } else if (doseUnit === 'g') {
    doseInMg = doseAmount * 1000; // 1g = 1000mg
  } else if (doseUnit === 'μg') {
    doseInMg = doseAmount / 1000; // 1000μg = 1mg
  }
  // If it's ml, we keep as is (assuming 1:1 ratio for liquid formulations)

  const percentageOfLimit = (doseInMg / tissueLimit.limitValue) * 100;

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
    limitValue: tissueLimit.limitValue,
    withdrawalPeriod: animalData.withdrawalPeriod ?? 7, // Default 7 days if not specified
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
 * Based on EU Regulation (EC) No 470/2009, FDA CVM guidelines, and FSSAI standards
 *
 * @param drugName - Name of the drug
 * @param animalType - Type of animal
 * @param doseAmount - Amount of dose administered
 * @param doseUnit - Unit of dose (mg, ml, g)
 * @param administrationDate - Date when drug was administered
 * @param currentDate - Current date (defaults to today)
 * @param standard - Regulatory standard to use (EU_FDA or FSSAI)
 * @returns Time-aware MRL status information with residue depletion
 */
export function calculateTimeAwareMRLStatus(
  drugName: string,
  animalType: string,
  doseAmount: number,
  doseUnit: string,
  administrationDate: string | Date,
  currentDate: string | Date = new Date(),
  standard: RegulatoryStandard = 'EU_FDA'
): TimeAwareMRLStatusResult {
  // Step 1: Get baseline MRL data
  const mrlData = standard === 'FSSAI'
    ? FSSAI_STANDARDS_MRLS[drugName]
    : INDUSTRY_STANDARD_MRLS[drugName];

  if (!mrlData) {
    // Drug not in database — cannot verify safety, treat as exceeded
    return {
      status: 'exceeded',
      percentageOfLimit: 0,
      currentResiduePercentage: 0,
      daysElapsed: 0,
      daysUntilSafe: 0,
      limitValue: 0,
      withdrawalPeriod: 0,
      isSafeForSlaughter: false,
    };
  }

  const animalData = mrlData.animalTypes[animalType];

  if (!animalData) {
    // Animal type not defined for this drug — cannot verify safety, treat as exceeded
    return {
      status: 'exceeded',
      percentageOfLimit: 0,
      currentResiduePercentage: 0,
      daysElapsed: 0,
      daysUntilSafe: 0,
      limitValue: 0,
      withdrawalPeriod: 0,
      isSafeForSlaughter: false,
    };
  }

  // Step 2: Convert dose to appropriate unit for comparison
  let doseInBaseUnit = doseAmount;
  let limitValue: number;

  if (standard === 'FSSAI') {
    // FSSAI uses mg/kg
    const fssaiData = animalData as any; // TypeScript workaround for union type
    const tissueLimit = fssaiData.tissues?.['muscle'] || Object.values(fssaiData.tissues || {})[0];
    if (!tissueLimit) {
      // No tissue data — cannot verify safety, treat as exceeded
      return {
        status: 'exceeded',
        percentageOfLimit: 0,
        currentResiduePercentage: 0,
        daysElapsed: 0,
        daysUntilSafe: 0,
        limitValue: 0,
        withdrawalPeriod: 0,
        isSafeForSlaughter: false,
      };
    }
    limitValue = tissueLimit.limitValue;

    // Convert to mg
    if (doseUnit === 'mg') {
      doseInBaseUnit = doseAmount;
    } else if (doseUnit === 'g') {
      doseInBaseUnit = doseAmount * 1000;
    } else if (doseUnit === 'μg') {
      doseInBaseUnit = doseAmount / 1000;
    }
  } else {
    // EU/FDA uses μg/kg
    const eufdaData = animalData as any;
    limitValue = eufdaData.limitValue;

    if (doseUnit === 'mg') {
      doseInBaseUnit = doseAmount * 1000; // 1mg = 1000μg
    } else if (doseUnit === 'g') {
      doseInBaseUnit = doseAmount * 1000000; // 1g = 1,000,000μg
    }
  }

  // Step 3: Calculate INITIAL percentage at administration (Day 0)
  const initialPercentageOfLimit = (doseInBaseUnit / limitValue) * 100;

  // Step 4: Calculate time elapsed since administration
  let daysElapsed = calculateDaysBetween(administrationDate, currentDate);

  // Handle future dates defensively
  if (daysElapsed < 0) {
    daysElapsed = 0;
  }

  const withdrawalPeriod = standard === 'FSSAI'
    ? (animalData as any).withdrawalPeriod ?? 7
    : (animalData as any).withdrawalPeriod ?? 7;

  // Step 5: Calculate CURRENT residue percentage using linear depletion model
  let currentResiduePercentage: number;
  let daysUntilSafe: number;
  let isSafeForSlaughter: boolean;

  if (daysElapsed >= withdrawalPeriod) {
    // Past withdrawal period - residues below MRL, safe for slaughter
    currentResiduePercentage = 0;
    daysUntilSafe = 0;
    isSafeForSlaughter = true;
  } else if (initialPercentageOfLimit <= 100) {
    // Initial dose was already at or below the MRL — safe from day 0
    currentResiduePercentage = initialPercentageOfLimit;
    daysUntilSafe = 0;
    isSafeForSlaughter = true;
  } else {
    // During withdrawal period - use exponential (first-order) decay
    // Derived so residue reaches exactly 100% of MRL at withdrawalPeriod
    const decayRate = Math.log(initialPercentageOfLimit / 100) / withdrawalPeriod;
    currentResiduePercentage = initialPercentageOfLimit * Math.exp(-decayRate * daysElapsed);
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

  // Keep isSafeForSlaughter and daysUntilSafe consistent with the status
  if (status === 'safe') {
    isSafeForSlaughter = true;
    daysUntilSafe = 0;
  }

  return {
    status,
    percentageOfLimit: Math.round(initialPercentageOfLimit * 100) / 100,
    currentResiduePercentage: Math.round(currentResiduePercentage * 100) / 100,
    daysElapsed,
    daysUntilSafe,
    limitValue,
    withdrawalPeriod,
    isSafeForSlaughter,
  };
}

