export const ACCESS_OPTIONS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "brands", label: "Brands" },
  { key: "models", label: "Models" },
  { key: "variants", label: "Variants" },
  { key: "specs", label: "Car Specs" },
  { key: "pricing", label: "Pricing & Taxes" },
  { key: "heroCarousel", label: "Hero Carousel" },
  { key: "enquiries", label: "Enquiries" },
  { key: "articles", label: "Articles" },
  { key: "comments", label: "Comments" },
  { key: "usedCars", label: "Used Cars" },
  { key: "upcomingCars", label: "Upcoming Cars" },
  { key: "dealers", label: "Dealers" },
  { key: "branding", label: "Branding" },
  { key: "importCsv", label: "Import CSV" },
  { key: "users", label: "Users" },
  { key: "settings", label: "Settings" },
] as const;

export type PermissionKey = (typeof ACCESS_OPTIONS)[number]["key"];

export const ALL_PERMISSIONS: PermissionKey[] = ACCESS_OPTIONS.map((item) => item.key);

export const DEFAULT_EDITOR_PERMISSIONS: PermissionKey[] = [
  "dashboard",
  "brands",
  "models",
  "variants",
  "pricing",
  "heroCarousel",
  "enquiries",
  "articles",
  "comments",
  "usedCars",
  "upcomingCars",
  "dealers",
  "branding",
  "settings",
];

const ROUTE_PERMISSION_MAP: Array<{ startsWith: string; permission: PermissionKey }> = [
  { startsWith: "/users", permission: "users" },
  { startsWith: "/specs", permission: "specs" },
  { startsWith: "/import", permission: "importCsv" },
  { startsWith: "/pricing", permission: "pricing" },
  { startsWith: "/hero-carousel", permission: "heroCarousel" },
  { startsWith: "/enquiries", permission: "enquiries" },
  { startsWith: "/articles", permission: "articles" },
  { startsWith: "/comments", permission: "comments" },
  { startsWith: "/used-cars", permission: "usedCars" },
  { startsWith: "/upcoming", permission: "upcomingCars" },
  { startsWith: "/dealers", permission: "dealers" },
  { startsWith: "/branding", permission: "branding" },
  { startsWith: "/settings", permission: "settings" },
  { startsWith: "/variants", permission: "variants" },
  { startsWith: "/models", permission: "models" },
  { startsWith: "/brands", permission: "brands" },
  { startsWith: "/", permission: "dashboard" },
];

export type AuthUser = {
  role?: string;
  permissions?: string[];
};

export const normalizePermissions = (permissions?: string[]): PermissionKey[] => {
  if (!Array.isArray(permissions)) return [];
  const valid = permissions.filter((item): item is PermissionKey =>
    ALL_PERMISSIONS.includes(item as PermissionKey),
  );
  return [...new Set(valid)];
};

export const getEffectivePermissions = (user?: AuthUser | null): PermissionKey[] => {
  if (!user) return [];
  if (user.role === "admin") return ALL_PERMISSIONS;

  const normalized = normalizePermissions(user.permissions);
  if (normalized.length > 0) return normalized;

  // Backward compatibility for old users created before permissions were introduced.
  return DEFAULT_EDITOR_PERMISSIONS;
};

export const hasPermission = (user: AuthUser | null | undefined, permission: PermissionKey): boolean => {
  return getEffectivePermissions(user).includes(permission);
};

export const getPermissionForPath = (pathname: string): PermissionKey | null => {
  const match = ROUTE_PERMISSION_MAP.find((item) => pathname.startsWith(item.startsWith));
  return match ? match.permission : null;
};

export const getFirstAllowedPath = (user: AuthUser | null | undefined): string => {
  const permissionToPath: Array<{ permission: PermissionKey; path: string }> = [
    { permission: "dashboard", path: "/" },
    { permission: "brands", path: "/brands" },
    { permission: "models", path: "/models" },
    { permission: "variants", path: "/variants" },
    { permission: "pricing", path: "/pricing" },
    { permission: "heroCarousel", path: "/hero-carousel" },
    { permission: "usedCars", path: "/used-cars" },
    { permission: "upcomingCars", path: "/upcoming" },
    { permission: "articles", path: "/articles" },
    { permission: "comments", path: "/comments" },
    { permission: "dealers", path: "/dealers" },
    { permission: "enquiries", path: "/enquiries" },
    { permission: "branding", path: "/branding" },
    { permission: "settings", path: "/settings" },
    { permission: "specs", path: "/specs" },
    { permission: "importCsv", path: "/import" },
    { permission: "users", path: "/users" },
  ];

  const allowed = permissionToPath.find((entry) => hasPermission(user, entry.permission));
  return allowed?.path || "/";
};
