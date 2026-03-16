export const ADMIN_PERMISSION_OPTIONS = [
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

export type AdminPermission = (typeof ADMIN_PERMISSION_OPTIONS)[number]["key"];

export const ALL_ADMIN_PERMISSIONS: AdminPermission[] = ADMIN_PERMISSION_OPTIONS.map((item) => item.key);

export const DEFAULT_EDITOR_PERMISSIONS: AdminPermission[] = [
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

export const sanitizeAdminPermissions = (permissions: unknown): AdminPermission[] => {
  if (!Array.isArray(permissions)) return [];
  const valid = permissions.filter((item): item is AdminPermission =>
    ALL_ADMIN_PERMISSIONS.includes(item as AdminPermission),
  );
  return [...new Set(valid)];
};
