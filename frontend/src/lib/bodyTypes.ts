/**
 * Canonical Body Type System
 * Single source of truth for all body type definitions and normalization
 */

export interface BodyTypeDefinition {
  slug: string;
  label: string;
  description: string;
  synonyms: string[];
}

export const BODY_TYPES: BodyTypeDefinition[] = [
  {
    slug: "hatchback",
    label: "Hatchback",
    description: "Compact and fuel-efficient city cars perfect for urban driving",
    synonyms: ["hatch"],
  },
  {
    slug: "compact-sedan",
    label: "Compact Sedan",
    description: "Small sedans ideal for city commuting with boot space",
    synonyms: ["compact sedan", "sub-compact sedan"],
  },
  {
    slug: "sedan",
    label: "Sedan",
    description: "Classic 4-door sedans with spacious interiors and boot space",
    synonyms: ["saloon"],
  },
  {
    slug: "microcar",
    label: "Microcar",
    description: "Ultra-compact cars for easy city navigation and parking",
    synonyms: ["micro", "minicar", "city car"],
  },
  {
    slug: "crossover",
    label: "Crossover",
    description: "Versatile vehicles combining car comfort with SUV styling",
    synonyms: ["cuv", "compact crossover"],
  },
  {
    slug: "compact-suv",
    label: "Compact SUV",
    description: "Smaller SUVs perfect for city driving with elevated seating",
    synonyms: ["compact suv", "subcompact suv", "sub-compact suv"],
  },
  {
    slug: "suv",
    label: "SUV",
    description: "Sport utility vehicles with high ground clearance and powerful performance",
    synonyms: ["sport utility", "4x4"],
  },
  {
    slug: "muv",
    label: "MUV / MPV",
    description: "Multi utility vehicles with 7-8 seater capacity for families",
    synonyms: ["mpv", "muv/mpv", "multi purpose vehicle", "multi utility vehicle", "people carrier"],
  },
  {
    slug: "wagon",
    label: "Wagon / Estate",
    description: "Estate cars combining practicality with style and cargo space",
    synonyms: ["estate", "station wagon", "estate car"],
  },
  {
    slug: "van",
    label: "Van",
    description: "Commercial and passenger vans for cargo and group transport",
    synonyms: ["commercial van", "cargo van"],
  },
  {
    slug: "minivan",
    label: "Minivan",
    description: "Compact vans designed for families and small groups",
    synonyms: ["mini van", "passenger van"],
  },
  {
    slug: "pickup",
    label: "Pickup",
    description: "Pickup trucks with cargo capacity and rugged capability",
    synonyms: ["pickup truck", "truck", "ute"],
  },
  {
    slug: "offroader",
    label: "Off-roader",
    description: "Rugged vehicles built for challenging terrain and adventures",
    synonyms: ["off-road", "4wd", "all-terrain"],
  },
  {
    slug: "sports",
    label: "Sports",
    description: "High-performance sports cars with thrilling driving dynamics",
    synonyms: ["sports car", "performance car"],
  },
  {
    slug: "luxury",
    label: "Luxury",
    description: "Premium luxury vehicles with top-tier comfort and features",
    synonyms: ["luxury car", "premium"],
  },
  {
    slug: "coupe",
    label: "Coupe",
    description: "Sporty 2-door cars with sleek designs and performance focus",
    synonyms: ["2-door", "sport coupe"],
  },
  {
    slug: "convertible",
    label: "Convertible",
    description: "Open-top cars for the ultimate driving experience",
    synonyms: ["cabriolet", "roadster", "soft-top", "drop-top"],
  },
];

// Create a lookup map for fast normalization
const synonymMap = new Map<string, string>();
BODY_TYPES.forEach((bodyType) => {
  // Add the main label (lowercase)
  synonymMap.set(bodyType.label.toLowerCase(), bodyType.slug);
  synonymMap.set(bodyType.slug, bodyType.slug);

  // Add all synonyms
  bodyType.synonyms.forEach((synonym) => {
    synonymMap.set(synonym.toLowerCase(), bodyType.slug);
  });
});

/**
 * Normalize any body type input to a canonical slug
 * Returns the canonical slug or null if not found
 * 
 * @example
 * normalizeBodyType("MPV") -> "muv"
 * normalizeBodyType("Estate") -> "wagon"
 * normalizeBodyType("CUV") -> "crossover"
 */
export function normalizeBodyType(input: string | undefined | null): string | null {
  if (!input) return null;

  const normalized = input.toLowerCase().trim();
  return synonymMap.get(normalized) || null;
}

/**
 * Get body type definition by slug or input
 */
export function getBodyTypeDefinition(input: string): BodyTypeDefinition | null {
  const slug = normalizeBodyType(input);
  if (!slug) return null;

  return BODY_TYPES.find((bt) => bt.slug === slug) || null;
}

/**
 * Get all canonical body type slugs
 */
export function getBodyTypeSlugs(): string[] {
  return BODY_TYPES.map((bt) => bt.slug);
}

/**
 * Get all body type labels
 */
export function getBodyTypeLabels(): string[] {
  return BODY_TYPES.map((bt) => bt.label);
}
