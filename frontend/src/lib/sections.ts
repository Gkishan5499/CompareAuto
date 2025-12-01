/**
 * Section Registry for Page Builder
 * Maps section types to their React components
 */

import { ComponentType } from "react";

export interface SectionProps {
  [key: string]: any;
}

export interface SectionDefinition {
  type: string;
  component: ComponentType<any>;
  schema: {
    label: string;
    description: string;
    props: Record<string, {
      type: "string" | "text" | "number" | "boolean" | "select" | "array";
      label: string;
      required?: boolean;
      default?: any;
      options?: Array<{ label: string; value: any }>;
    }>;
  };
}

// Section registry will be populated dynamically
export const SECTION_REGISTRY: Record<string, SectionDefinition> = {};

/**
 * Register a section type
 */
export function registerSection(definition: SectionDefinition) {
  SECTION_REGISTRY[definition.type] = definition;
}

/**
 * Get all available section types
 */
export function getAvailableSections(): SectionDefinition[] {
  return Object.values(SECTION_REGISTRY);
}

/**
 * Get section definition by type
 */
export function getSectionDefinition(type: string): SectionDefinition | null {
  return SECTION_REGISTRY[type] || null;
}

// Define available section types for the builder
export const AVAILABLE_SECTION_TYPES = [
  "Hero",
  "RichText",
  "CardsGrid",
  "BodyTypesStrip",
  "FuelTypesStrip",
  "NewLaunches",
  "UpcomingPreview",
  "BrandsGrid",
  "CompareTeaser",
  "ToolsStrip",
  "FAQ",
  "LeadsStrip",
  "AdSlot",
  "MediaCarousel",
];

/**
 * Get section schema for validation and form generation
 */
export function getSectionSchema(type: string): any {
  const schemas: Record<string, any> = {
    Hero: {
      title: { type: "string", label: "Title", required: true },
      subtitle: { type: "string", label: "Subtitle" },
      cta: { type: "string", label: "CTA Text" },
      ctaHref: { type: "string", label: "CTA Link" },
    },
    RichText: {
      md: { type: "text", label: "Markdown Content", required: true },
    },
    CardsGrid: {
      title: { type: "string", label: "Section Title" },
      items: { type: "array", label: "Card Items (JSON)" },
    },
    CTA: {
      label: { type: "string", label: "Button Text", required: true },
      href: { type: "string", label: "Link", required: true },
      variant: {
        type: "select",
        label: "Button Style",
        options: [
          { label: "Primary", value: "default" },
          { label: "Secondary", value: "secondary" },
          { label: "Outline", value: "outline" },
        ],
      },
    },
  };

  return schemas[type] || {};
}
