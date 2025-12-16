import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getBrands, getModel, getModelsByBrand, getVariants } from "@/lib/data";
import { useBrands, useModelsByBrand, useVariants } from "@/lib/api-hooks";
import { X } from "lucide-react";

interface VariantPickerProps {
  slot: "A" | "B" | "C";
  initialValue?: string; // format: brand-model-variant
  onSelect: (variantId: string | null) => void;
}

const VariantPicker = ({ slot, initialValue, onSelect }: VariantPickerProps) => {
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");

  const { data: apiBrands } = useBrands();
  const brands = apiBrands || getBrands();

  const { data: apiModels } = useModelsByBrand(selectedBrand || "");
  const models = apiModels || (selectedBrand ? getModelsByBrand(selectedBrand) : []);

  // Determine the model id for useVariants hook
  const currentModelObj = models.find((m) => m.slug === selectedModel) || null;
  const { data: apiVariants } = useVariants(currentModelObj?.id || "");
  const variants = apiVariants || (currentModelObj ? getVariants(currentModelObj.id) : []);

  // Initialize from initialValue
  useEffect(() => {
    if (initialValue) {
      const parts = initialValue.split("-");
      if (parts.length >= 3) {
        const brandSlug = parts[0];
        const modelSlug = parts[1];
        const variantSlug = parts.slice(2).join("-");
        
        setSelectedBrand(brandSlug);
        setSelectedModel(modelSlug);
        setSelectedVariant(variantSlug);
      }
    }
  }, [initialValue]);

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    setSelectedModel("");
    setSelectedVariant("");
    onSelect(null);
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    setSelectedVariant("");
    onSelect(null);
  };

  const handleVariantChange = (value: string) => {
    setSelectedVariant(value);
    // Find the variant and get its ID from the API variants
    const selectedVariantObj = variants.find(v => v.slug === value);
    if (selectedVariantObj) {
      onSelect(selectedVariantObj.id);
    }
  };

  const handleClear = () => {
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedVariant("");
    onSelect(null);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Slot {slot}</h3>
        {(selectedBrand || selectedModel || selectedVariant) && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Brand Select */}
        <div className="space-y-2">
          <Label>Brand</Label>
          <Select value={selectedBrand} onValueChange={handleBrandChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.slug}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Select */}
        <div className="space-y-2">
          <Label>Model</Label>
          <Select
            value={selectedModel}
            onValueChange={handleModelChange}
            disabled={!selectedBrand}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.slug}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Variant Select */}
        <div className="space-y-2">
          <Label>Variant</Label>
          <Select
            value={selectedVariant}
            onValueChange={handleVariantChange}
            disabled={!selectedModel}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.slug}>
                  {variant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default VariantPicker;
