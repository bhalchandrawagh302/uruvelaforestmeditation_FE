export interface DanaDatePricing {
  dateStr: string; // "YYYY-MM-DD"
  dateDisplay: string; // e.g. "Oct 15, 2026"
  dayOfWeek?: string;
  breakfast: number;
  lunch: number;
  gilanpachhaya: number;
  fullDay: number;
  note?: string;
  isCustom?: boolean;
  updatedAt?: string;
}

export interface DanaBaselinePricing {
  breakfast: number;
  lunch: number;
  gilanpachhaya: number;
  fullDay: number;
}

const STORAGE_KEY_OVERRIDES = 'uruvela_dana_pricing_overrides';
const STORAGE_KEY_BASELINE = 'uruvela_dana_baseline_pricing';
export const DANA_PRICING_UPDATED_EVENT = 'dana-pricing-updated';

const DEFAULT_BASELINE: DanaBaselinePricing = {
  breakfast: 2500,
  lunch: 5000,
  gilanpachhaya: 1500,
  fullDay: 9000,
};

// Seed custom dates (e.g. Kathina Ceremony, Vassa full moon, etc.)
const SEED_OVERRIDES: Record<string, DanaDatePricing> = {
  '2026-10-15': {
    dateStr: '2026-10-15',
    dateDisplay: 'October 15, 2026',
    dayOfWeek: 'Thursday',
    breakfast: 3000,
    lunch: 6000,
    gilanpachhaya: 2000,
    fullDay: 11000,
    note: 'Vassa Pavarana & Special Merit Day',
    isCustom: true,
    updatedAt: new Date().toISOString(),
  },
};

/** Get global baseline rates */
export function getBaselinePricing(): DanaBaselinePricing {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BASELINE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        breakfast: Number(parsed.breakfast) || DEFAULT_BASELINE.breakfast,
        lunch: Number(parsed.lunch) || DEFAULT_BASELINE.lunch,
        gilanpachhaya: Number(parsed.gilanpachhaya) || DEFAULT_BASELINE.gilanpachhaya,
        fullDay:
          (Number(parsed.breakfast) || DEFAULT_BASELINE.breakfast) +
          (Number(parsed.lunch) || DEFAULT_BASELINE.lunch) +
          (Number(parsed.gilanpachhaya) || DEFAULT_BASELINE.gilanpachhaya),
      };
    }
  } catch (_) {}
  return { ...DEFAULT_BASELINE };
}

/** Save global baseline rates */
export function saveBaselinePricing(baseline: Partial<DanaBaselinePricing>): DanaBaselinePricing {
  const current = getBaselinePricing();
  const updated: DanaBaselinePricing = {
    breakfast: baseline.breakfast !== undefined ? Number(baseline.breakfast) : current.breakfast,
    lunch: baseline.lunch !== undefined ? Number(baseline.lunch) : current.lunch,
    gilanpachhaya: baseline.gilanpachhaya !== undefined ? Number(baseline.gilanpachhaya) : current.gilanpachhaya,
    fullDay:
      (baseline.breakfast !== undefined ? Number(baseline.breakfast) : current.breakfast) +
      (baseline.lunch !== undefined ? Number(baseline.lunch) : current.lunch) +
      (baseline.gilanpachhaya !== undefined ? Number(baseline.gilanpachhaya) : current.gilanpachhaya),
  };

  try {
    localStorage.setItem(STORAGE_KEY_BASELINE, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(DANA_PRICING_UPDATED_EVENT));
  } catch (_) {}

  return updated;
}

/** Get all custom pricing overrides */
export function getAllCustomPricingOverrides(): Record<string, DanaDatePricing> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OVERRIDES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (_) {}
  // Initialize with seed overrides if empty
  try {
    localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(SEED_OVERRIDES));
  } catch (_) {}
  return { ...SEED_OVERRIDES };
}

/** Format YYYY-MM-DD into display string and day of week */
function getDateDetails(dateStr: string): { dateDisplay: string; dayOfWeek: string } {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return {
      dateDisplay: dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      dayOfWeek: dt.toLocaleDateString('en-US', { weekday: 'long' }),
    };
  } catch (_) {
    return { dateDisplay: dateStr, dayOfWeek: '' };
  }
}

/** Get pricing for a specific date: returns custom rate if exists, otherwise baseline */
export function getDanaPricingForDate(dateStr: string): DanaDatePricing {
  const overrides = getAllCustomPricingOverrides();
  if (overrides[dateStr]) {
    const ov = overrides[dateStr];
    return {
      ...ov,
      fullDay: ov.breakfast + ov.lunch + ov.gilanpachhaya,
      isCustom: true,
    };
  }

  const baseline = getBaselinePricing();
  const { dateDisplay, dayOfWeek } = getDateDetails(dateStr);

  return {
    dateStr,
    dateDisplay,
    dayOfWeek,
    breakfast: baseline.breakfast,
    lunch: baseline.lunch,
    gilanpachhaya: baseline.gilanpachhaya,
    fullDay: baseline.breakfast + baseline.lunch + baseline.gilanpachhaya,
    isCustom: false,
  };
}

/** Save or update custom rate for a date */
export function saveDanaPricingForDate(data: {
  dateStr: string;
  breakfast: number;
  lunch: number;
  gilanpachhaya: number;
  note?: string;
}): DanaDatePricing {
  const overrides = getAllCustomPricingOverrides();
  const { dateDisplay, dayOfWeek } = getDateDetails(data.dateStr);
  const bf = Math.max(0, Number(data.breakfast) || 0);
  const lu = Math.max(0, Number(data.lunch) || 0);
  const gi = Math.max(0, Number(data.gilanpachhaya) || 0);

  const updatedItem: DanaDatePricing = {
    dateStr: data.dateStr,
    dateDisplay,
    dayOfWeek,
    breakfast: bf,
    lunch: lu,
    gilanpachhaya: gi,
    fullDay: bf + lu + gi,
    note: data.note?.trim() || undefined,
    isCustom: true,
    updatedAt: new Date().toISOString(),
  };

  overrides[data.dateStr] = updatedItem;

  try {
    localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent(DANA_PRICING_UPDATED_EVENT));
  } catch (_) {}

  return updatedItem;
}

/** Reset / remove custom override for a date */
export function deleteDanaPricingOverride(dateStr: string): void {
  const overrides = getAllCustomPricingOverrides();
  if (overrides[dateStr]) {
    delete overrides[dateStr];
    try {
      localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(overrides));
      window.dispatchEvent(new CustomEvent(DANA_PRICING_UPDATED_EVENT));
    } catch (_) {}
  }
}
