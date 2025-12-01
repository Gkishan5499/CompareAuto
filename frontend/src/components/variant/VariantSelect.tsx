import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useVariants } from "@/lib/api-hooks";
import { formatINR, parseINRToRupees } from "@/lib/guards";

interface VariantSelectProps {
  brand: string;
  model: string;
  currentVariantSlug: string;
  className?: string;
}

export const VariantSelect = ({ brand, model, currentVariantSlug, className = "" }: VariantSelectProps) => {
  const navigate = useNavigate();
  const { data: apiVariants, isLoading } = useVariants(model);
  const variants = apiVariants || [];

  // Safety: If no current variant slug but variants exist, don't render selector
  if (!currentVariantSlug && variants.length > 0) {
    console.warn(`VariantSelect called without currentVariantSlug for ${brand}/${model}`);
    return null;
  }

  // Handle empty or single variant
  if (variants.length === 0) {
    console.warn(`No variants found for brand: ${brand}, model: ${model}`);
    return null;
  }

  if (variants.length === 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Label className="text-sm text-muted-foreground">Variant</Label>
        <Select value={variants[0].slug} disabled>
          <SelectTrigger className="w-full lg:w-[280px]" aria-label="Variant selector (only one available)">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={variants[0].slug}>
              <div className="flex items-center justify-between gap-4 w-full">
                <span>{variants[0].name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatINR(parseINRToRupees(variants[0].price), true)}
                </span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  const handleVariantChange = (slug: string) => {
    navigate(`/${brand}/${model}/${slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label htmlFor="variant-select" className="text-sm text-muted-foreground">
        Variant
      </Label>
      <Select value={currentVariantSlug} onValueChange={handleVariantChange}>
        <SelectTrigger
          id="variant-select"
          className="w-full lg:w-[280px]"
          aria-label="Select variant"
          role="combobox"
          data-testid="variant-select"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
                {variants.map((variant) => (
            <SelectItem key={variant.id} value={variant.slug}>
              <div className="flex items-center justify-between gap-4 w-full min-w-[220px]">
                <span className="truncate">{variant.name}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {(() => {
                    const p = parseINRToRupees(variant.price);
                    return p && p > 0 ? formatINR(p, true) : "—";
                  })()}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
