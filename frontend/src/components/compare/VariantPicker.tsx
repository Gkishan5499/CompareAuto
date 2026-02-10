import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { getBrands, getModels, getModelsByBrand, getVariants } from "@/lib/data";
import { useBrands, useModels, useModelsByBrand, useVariants } from "@/lib/api-hooks";
import { dataCache } from "@/lib/data-cache";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariantPickerProps {
  slot: "A" | "B" | "C";
  initialValue?: string; // format: brand-model-variant
  onSelect: (variantId: string | null) => void;
  selectedVariantId?: string | null;
  disabledVariantIds?: string[];
}

const VariantPicker = ({
  slot,
  initialValue,
  onSelect,
  selectedVariantId,
  disabledVariantIds = [],
}: VariantPickerProps) => {
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [selectedBrandLabel, setSelectedBrandLabel] = useState<string>("");
  const [selectedModelLabel, setSelectedModelLabel] = useState<string>("");
  const [selectedVariantLabel, setSelectedVariantLabel] = useState<string>("");
  const [brandSearchOpen, setBrandSearchOpen] = useState(false);
  const [variantSearchOpen, setVariantSearchOpen] = useState(false);

  const { data: apiBrands } = useBrands();
  const brands = apiBrands || getBrands();

  const { data: apiAllModels } = useModels();
  const allModels = apiAllModels || getModels();

  const { data: apiAllVariants } = useVariants("");
  const allVariants = apiAllVariants || dataCache.getVariants();

  const { data: apiModels } = useModelsByBrand(selectedBrand || "");
  const models = apiModels || (selectedBrand ? getModelsByBrand(selectedBrand) : []);

  // Determine the model id for useVariants hook
  const currentModelObj = models.find((m) => m.slug === selectedModel) || null;
  const { data: apiVariants } = useVariants(currentModelObj?.id || "");
  const variants = apiVariants || (currentModelObj ? getVariants(currentModelObj.id) : []);

  // Initialize from initialValue (variant id or slug)
  useEffect(() => {
    if (!initialValue) return;

    const variant = allVariants.find(
      (item) => item.id === initialValue || item.slug === initialValue || item._id === initialValue
    );
    if (!variant) return;

    const model = allModels.find(
      (item) => item.id === variant.modelId || item.slug === variant.modelId || item._id === variant.modelId
    );
    const brand = model
      ? brands.find((item) => item.id === model.brandId || item.slug === model.brandId)
      : undefined;

    setSelectedBrand(brand?.slug || brand?.id || "");
    setSelectedModel(model?.slug || model?.id || "");
    setSelectedVariant(variant.slug || variant.id || "");
    setSelectedBrandLabel(brand?.name || "");
    setSelectedModelLabel(model?.name || "");
    setSelectedVariantLabel(variant.name || "");
  }, [initialValue, allVariants, allModels, brands]);

  useEffect(() => {
    if (selectedBrand && !selectedBrandLabel) {
      const match = brands.find((brand) => brand.slug === selectedBrand || brand.id === selectedBrand);
      if (match) setSelectedBrandLabel(match.name);
    }
  }, [brands, selectedBrand, selectedBrandLabel]);

  useEffect(() => {
    if (selectedModel && !selectedModelLabel) {
      const match = models.find((model) => model.slug === selectedModel || model.id === selectedModel);
      if (match) setSelectedModelLabel(match.name);
    }
  }, [models, selectedModel, selectedModelLabel]);

  useEffect(() => {
    if (selectedVariant && !selectedVariantLabel) {
      const match = variants.find(
        (variant) => variant.slug === selectedVariant || variant.id === selectedVariant
      );
      if (match) setSelectedVariantLabel(match.name);
    }
  }, [variants, selectedVariant, selectedVariantLabel]);

  const brandDisplay =
    selectedBrandLabel ||
    brands.find((brand) => brand.slug === selectedBrand || brand.id === selectedBrand)?.name ||
    selectedBrand;
  const modelDisplay =
    selectedModelLabel ||
    models.find((model) => model.slug === selectedModel || model.id === selectedModel)?.name ||
    selectedModel;
  const variantDisplay =
    selectedVariantLabel ||
    variants.find((variant) => variant.slug === selectedVariant || variant.id === selectedVariant)?.name ||
    selectedVariant;

  const handleBrandChange = (value: string, label: string) => {
    setSelectedBrand(value);
    setSelectedBrandLabel(label);
    setSelectedModel("");
    setSelectedVariant("");
    setSelectedModelLabel("");
    setSelectedVariantLabel("");
    onSelect(null);
    setBrandSearchOpen(false);
  };

  const handleModelChange = (value: string) => {
    const match = models.find((model) => model.slug === value || model.id === value);
    setSelectedModel(value);
    setSelectedModelLabel(match?.name || "");
    setSelectedVariant("");
    setSelectedVariantLabel("");
    onSelect(null);
  };

  const handleVariantChange = (value: string) => {
    const match = variants.find((variant) => variant.slug === value || variant.id === value);
    const matchId = match?.id || match?._id || match?.slug || value;
    if (disabledVariantIds.includes(matchId) && matchId !== selectedVariantId) {
      setVariantSearchOpen(false);
      return;
    }
    setSelectedVariant(value);
    setSelectedVariantLabel(match?.name || "");
    // Find the variant and get its ID from the API variants
    const selectedVariantObj = variants.find(
      (variant) => variant.slug === value || variant.id === value
    );
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
    setSelectedBrandLabel("");
    setSelectedModelLabel("");
    setSelectedVariantLabel("");
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
                  {brandDisplay ? brandDisplay : "Select brand..."}
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
                        onSelect={() => handleBrandChange(brand.slug || brand.id, brand.name)}
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
              <span className="truncate">
                {modelDisplay ? modelDisplay : "Select model"}
              </span>
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
                  {variantDisplay ? variantDisplay : "Select variant..."}
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
                    {variants.map((variant) => {
                      const variantId = variant.id || variant._id || variant.slug;
                      const isDisabled =
                        disabledVariantIds.includes(variantId) && variantId !== selectedVariantId;
                      return (
                        <CommandItem
                          key={variant.id}
                          value={variant.name}
                          onSelect={() => {
                            if (isDisabled) return;
                            handleVariantChange(variant.slug || variant.id);
                          }}
                          disabled={isDisabled}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedVariant === variant.slug ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {variant.name}
                        </CommandItem>
                      );
                    })}
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
