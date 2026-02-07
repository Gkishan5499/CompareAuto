import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { getBrands, getModelsByBrand, getVariants } from "@/lib/data";
import { useBrands, useModelsByBrand, useVariants } from "@/lib/api-hooks";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariantPickerProps {
  slot: "A" | "B" | "C";
  initialValue?: string; // format: brand-model-variant
  onSelect: (variantId: string | null) => void;
}

const VariantPicker = ({ slot, initialValue, onSelect }: VariantPickerProps) => {
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [brandSearchOpen, setBrandSearchOpen] = useState(false);
  const [variantSearchOpen, setVariantSearchOpen] = useState(false);

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
    setBrandSearchOpen(false);
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
      const variantId = selectedVariantObj.id || selectedVariantObj._id || selectedVariantObj.slug;
      onSelect(variantId || null);
    } else {
      onSelect(null);
    }
    setVariantSearchOpen(false);
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
        <h3 className="font-semibold text-lg"> Option {slot}</h3>
        <div className="flex gap-2">
          {(selectedBrand || selectedModel || selectedVariant) && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Brand Select with Search */}
        <div className="space-y-2">
          <Label>Brand</Label>
          <Popover open={brandSearchOpen} onOpenChange={setBrandSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={brandSearchOpen}
                className="w-full justify-between text-left font-normal"
              >
                <span className="truncate">
                  {selectedBrand
                    ? brands.find((brand) => brand.slug === selectedBrand)?.name
                    : "Select brand..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search brand..." />
                <CommandList>
                  <CommandEmpty>No brand found.</CommandEmpty>
                  <CommandGroup>
                    {brands.map((brand) => (
                      <CommandItem
                        key={brand.id}
                        value={brand.name}
                        onSelect={() => handleBrandChange(brand.slug)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedBrand === brand.slug ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {brand.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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

        {/* Variant Select with Search */}
        <div className="space-y-2">
          <Label>Variant</Label>
          <Popover open={variantSearchOpen} onOpenChange={setVariantSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={variantSearchOpen}
                className="w-full justify-between text-left font-normal"
                disabled={!selectedModel}
              >
                <span className="truncate">
                  {selectedVariant
                    ? variants.find((variant) => variant.slug === selectedVariant)?.name
                    : "Select variant..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search variant..." />
                <CommandList>
                  <CommandEmpty>No variant found.</CommandEmpty>
                  <CommandGroup>
                    {variants.map((variant) => (
                      <CommandItem
                        key={variant.id}
                        value={variant.name}
                        onSelect={() => handleVariantChange(variant.slug)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedVariant === variant.slug ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {variant.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
};

export default VariantPicker;
