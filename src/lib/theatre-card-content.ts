export type TheatreCardTextToggle = {
  enabled: boolean;
  text: string;
};

export type TheatreCardContent = {
  capacity: TheatreCardTextToggle;
  food: TheatreCardTextToggle;
  decor: TheatreCardTextToggle;
  freeCancellation: TheatreCardTextToggle;
  idealFor: {
    enabled: boolean;
    title: string;
    linePrimary: string;
    lineSecondary: string;
  };
  nextStep: {
    enabled: boolean;
    title: string;
    addDetails: TheatreCardTextToggle;
    addCake: TheatreCardTextToggle;
    fogEntry: TheatreCardTextToggle;
    gifts: TheatreCardTextToggle;
  };
};

export type TheatreCardTemplateValues = {
  capacity: number;
  decorationPrice: number;
  baseGuests?: number;
  extraPersonPrice?: number;
  location?: string;
};

export const DEFAULT_THEATRE_CARD_CONTENT: TheatreCardContent = {
  capacity: {
    enabled: true,
    text: "Up to {{capacity}} People",
  },
  food: {
    enabled: true,
    text: "Food",
  },
  decor: {
    enabled: true,
    text: "Decor ₹{{decorationPrice}} Only",
  },
  freeCancellation: {
    enabled: true,
    text: "Free Cancellation*",
  },
  idealFor: {
    enabled: true,
    title: "Ideal for",
    linePrimary: "couple and",
    lineSecondary: "family",
  },
  nextStep: {
    enabled: true,
    title: "Next Step:",
    addDetails: {
      enabled: true,
      text: "Add Details",
    },
    addCake: {
      enabled: true,
      text: "Add Cake",
    },
    fogEntry: {
      enabled: true,
      text: "Fog Entry",
    },
    gifts: {
      enabled: true,
      text: "Gifts",
    },
  },
};

export function createDefaultTheatreCardContent(): TheatreCardContent {
  return {
    capacity: { ...DEFAULT_THEATRE_CARD_CONTENT.capacity },
    food: { ...DEFAULT_THEATRE_CARD_CONTENT.food },
    decor: { ...DEFAULT_THEATRE_CARD_CONTENT.decor },
    freeCancellation: { ...DEFAULT_THEATRE_CARD_CONTENT.freeCancellation },
    idealFor: { ...DEFAULT_THEATRE_CARD_CONTENT.idealFor },
    nextStep: {
      ...DEFAULT_THEATRE_CARD_CONTENT.nextStep,
      addDetails: { ...DEFAULT_THEATRE_CARD_CONTENT.nextStep.addDetails },
      addCake: { ...DEFAULT_THEATRE_CARD_CONTENT.nextStep.addCake },
      fogEntry: { ...DEFAULT_THEATRE_CARD_CONTENT.nextStep.fogEntry },
      gifts: { ...DEFAULT_THEATRE_CARD_CONTENT.nextStep.gifts },
    },
  };
}

export function createEmptyTheatreCardContent(): TheatreCardContent {
  return {
    capacity: { enabled: true, text: "" },
    food: { enabled: true, text: "" },
    decor: { enabled: true, text: "" },
    freeCancellation: { enabled: true, text: "" },
    idealFor: {
      enabled: true,
      title: "",
      linePrimary: "",
      lineSecondary: "",
    },
    nextStep: {
      enabled: true,
      title: "",
      addDetails: { enabled: true, text: "" },
      addCake: { enabled: true, text: "" },
      fogEntry: { enabled: true, text: "" },
      gifts: { enabled: true, text: "" },
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readString(value: unknown, fallback: string, allowEmpty = false) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (trimmed.length > 0) return trimmed;
  return allowEmpty ? "" : fallback;
}

function normalizeTextToggle(
  value: unknown,
  fallback: TheatreCardTextToggle
): TheatreCardTextToggle {
  const record = asRecord(value);
  if (!record) return fallback;

  return {
    enabled: readBoolean(record.enabled, fallback.enabled),
    text: readString(record.text, fallback.text, true),
  };
}

export function normalizeTheatreCardContent(value: unknown): TheatreCardContent {
  const record = asRecord(value);
  if (!record) return createDefaultTheatreCardContent();

  const idealForRaw = asRecord(record.idealFor);
  const nextStepRaw = asRecord(record.nextStep);

  return {
    capacity: normalizeTextToggle(record.capacity, DEFAULT_THEATRE_CARD_CONTENT.capacity),
    food: normalizeTextToggle(record.food, DEFAULT_THEATRE_CARD_CONTENT.food),
    decor: normalizeTextToggle(record.decor, DEFAULT_THEATRE_CARD_CONTENT.decor),
    freeCancellation: normalizeTextToggle(
      record.freeCancellation,
      DEFAULT_THEATRE_CARD_CONTENT.freeCancellation
    ),
    idealFor: {
      enabled: readBoolean(
        idealForRaw?.enabled,
        DEFAULT_THEATRE_CARD_CONTENT.idealFor.enabled
      ),
      title: readString(idealForRaw?.title, DEFAULT_THEATRE_CARD_CONTENT.idealFor.title, true),
      linePrimary: readString(
        idealForRaw?.linePrimary,
        DEFAULT_THEATRE_CARD_CONTENT.idealFor.linePrimary,
        true
      ),
      lineSecondary: readString(
        idealForRaw?.lineSecondary,
        DEFAULT_THEATRE_CARD_CONTENT.idealFor.lineSecondary,
        true
      ),
    },
    nextStep: {
      enabled: readBoolean(
        nextStepRaw?.enabled,
        DEFAULT_THEATRE_CARD_CONTENT.nextStep.enabled
      ),
      title: readString(nextStepRaw?.title, DEFAULT_THEATRE_CARD_CONTENT.nextStep.title, true),
      addDetails: normalizeTextToggle(
        nextStepRaw?.addDetails,
        DEFAULT_THEATRE_CARD_CONTENT.nextStep.addDetails
      ),
      addCake: normalizeTextToggle(
        nextStepRaw?.addCake,
        DEFAULT_THEATRE_CARD_CONTENT.nextStep.addCake
      ),
      fogEntry: normalizeTextToggle(
        nextStepRaw?.fogEntry,
        DEFAULT_THEATRE_CARD_CONTENT.nextStep.fogEntry
      ),
      gifts: normalizeTextToggle(nextStepRaw?.gifts, DEFAULT_THEATRE_CARD_CONTENT.nextStep.gifts),
    },
  };
}

function applyTemplate(text: string, values: TheatreCardTemplateValues) {
  const templateValues: Record<string, string> = {
    capacity: String(values.capacity),
    decorationPrice: values.decorationPrice.toLocaleString("en-IN"),
    baseGuests: String(values.baseGuests ?? ""),
    extraPersonPrice:
      values.extraPersonPrice == null
        ? ""
        : values.extraPersonPrice.toLocaleString("en-IN"),
    location: values.location ?? "",
  };

  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
    return templateValues[key] ?? "";
  });
}

export function resolveTheatreCardContent(
  contentValue: unknown,
  values: TheatreCardTemplateValues
): TheatreCardContent {
  const content = normalizeTheatreCardContent(contentValue);

  return {
    ...content,
    capacity: {
      ...content.capacity,
      text: applyTemplate(content.capacity.text, values),
    },
    food: {
      ...content.food,
      text: applyTemplate(content.food.text, values),
    },
    decor: {
      ...content.decor,
      text: applyTemplate(content.decor.text, values),
    },
    freeCancellation: {
      ...content.freeCancellation,
      text: applyTemplate(content.freeCancellation.text, values),
    },
    idealFor: {
      ...content.idealFor,
      title: applyTemplate(content.idealFor.title, values),
      linePrimary: applyTemplate(content.idealFor.linePrimary, values),
      lineSecondary: applyTemplate(content.idealFor.lineSecondary, values),
    },
    nextStep: {
      ...content.nextStep,
      title: applyTemplate(content.nextStep.title, values),
      addDetails: {
        ...content.nextStep.addDetails,
        text: applyTemplate(content.nextStep.addDetails.text, values),
      },
      addCake: {
        ...content.nextStep.addCake,
        text: applyTemplate(content.nextStep.addCake.text, values),
      },
      fogEntry: {
        ...content.nextStep.fogEntry,
        text: applyTemplate(content.nextStep.fogEntry.text, values),
      },
      gifts: {
        ...content.nextStep.gifts,
        text: applyTemplate(content.nextStep.gifts.text, values),
      },
    },
  };
}
