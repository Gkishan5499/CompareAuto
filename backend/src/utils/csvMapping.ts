// backend/src/utils/csvMapping.ts

export function setNested(obj: any, path: string, value: any) {
  if (!path) return;

  const parts = path.split(".");
  let cur = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];

    if (cur[p] === undefined || cur[p] === null || typeof cur[p] !== "object") {
      cur[p] = {};
    }
    cur = cur[p];
  }

  cur[parts[parts.length - 1]] = value;
}

export type Mapping = Record<string, string>;

/**
 * Master CSV → Specs object transformer.
 * Smart features:
 *  - numeric auto-conversion
 *  - boolean auto-conversion
 *  - comma/semicolon/pipe → array
 *  - mapping fallback: if field not in mapping, set it at top-level
 */
export function mapRowToSpecs(
  row: Record<string, any>,
  mapping: Mapping
) {
  const out: any = {};
  // Create a normalized mapping with lowercase keys for case-insensitive CSV header matching
  const normalizedMap: Mapping = {};
  for (const [k, v] of Object.entries(mapping || {})) {
    normalizedMap[String(k).trim().toLowerCase()] = v;
  }

  for (const [csvKey, raw] of Object.entries(row)) {
    if (raw === undefined || raw === null) continue;

    let csvVal = String(raw).trim();
    if (csvVal === "") continue;

    const normalizedKey = csvKey.trim().toLowerCase();
    const rawTarget = normalizedMap[normalizedKey] || normalizedMap[csvKey.trim().toLowerCase()] || csvKey.trim();
    // if the targetPath is not nested (no dot) and it's not one of the allowed top-level fields (variantId),
    // move it under `extras` so we don't pollute the root object with many ad-hoc keys.
    let targetPath = rawTarget;
    const topLevelAllowed = new Set(["variantId", "variantid", "id", "wheels"]);
    if (!rawTarget.includes(".") && !topLevelAllowed.has(String(rawTarget))) {
      targetPath = `extras.${String(rawTarget).trim()}`;
    }

    // process CSV values with smart conversion
    const parsedValue = smartConvert(csvVal);

    setNested(out, targetPath, parsedValue);
  }

  return out;
}

/**
 * Smart value converter:
 *  - `12` → number
 *  - `12.5` → float
 *  - `yes/no` → boolean
 *  - `true/false` → boolean
 *  - `val1,val2,val3` → array
 */
function smartConvert(val: string): any {
  const s = val.trim();

  // Boolean detection
  if (/^(yes|true|y)$/i.test(s)) return true;
  if (/^(no|false|n)$/i.test(s)) return false;

  // Array detection (gallery, features)
  if (s.includes(",") || s.includes(";") || s.includes("|")) {
    return s.split(/[,;|]+/).map((v) => v.trim()).filter(Boolean);
  }

  // Integer
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);

  // Float
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);

  return s; // fallback → string
}
