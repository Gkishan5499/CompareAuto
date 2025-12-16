import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBrands, getModelsByBrand, getVariants, getVariant } from "@/lib/data";
import { formatINR, parseINRToRupees } from "@/lib/guards";
import { getOnRoadPrice, PriceBreakdown } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const cities = [
  { id: "delhi", name: "Delhi NCR" },
  { id: "mumbai", name: "Mumbai" },
  { id: "bangalore", name: "Bangalore" },
  { id: "chennai", name: "Chennai" },
  { id: "kolkata", name: "Kolkata" },
  { id: "hyderabad", name: "Hyderabad" },
  { id: "pune", name: "Pune" },
  { id: "ahmedabad", name: "Ahmedabad" },
];

const OnRoadPriceEstimator = () => {
  const navigate = useNavigate();
  const brands = getBrands();

  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState("delhi");
  const [priceData, setPriceData] = useState<PriceBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const models = selectedBrand ? getModelsByBrand(selectedBrand) : [];
  const variants = selectedModel
    ? getVariants(models.find((m) => m.slug === selectedModel)?.id || "")
    : [];

  const handleShowPrice = async () => {
    if (!selectedVariant) return;

    setIsLoading(true);
    try {
      const data = await getOnRoadPrice(selectedVariant, selectedCity);
      setPriceData(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenVariantPage = () => {
    if (selectedBrand && selectedModel && selectedVariant) {
      navigate(`/${selectedBrand}/${selectedModel}/${selectedVariant}`);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Selects */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand-select">Brand</Label>
            <Select
              value={selectedBrand}
              onValueChange={(value) => {
                setSelectedBrand(value);
                setSelectedModel("");
                setSelectedVariant("");
                setPriceData(null);
              }}
            >
              <SelectTrigger id="brand-select">
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.slug}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model-select">Model</Label>
            <Select
              value={selectedModel}
              onValueChange={(value) => {
                setSelectedModel(value);
                setSelectedVariant("");
                setPriceData(null);
              }}
              disabled={!selectedBrand}
            >
              <SelectTrigger id="model-select">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.slug}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="variant-select">Variant</Label>
            <Select
              value={selectedVariant}
              onValueChange={(value) => {
                setSelectedVariant(value);
                setPriceData(null);
              }}
              disabled={!selectedModel}
            >
              <SelectTrigger id="variant-select">
                <SelectValue placeholder="Select a variant" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {variants.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name} - {(() => {
                      const raw = variant.exShowroomPrice ?? variant.price;
                      const p = parseINRToRupees(raw);
                      return p && p > 0 ? formatINR(p, true) : "—";
                    })()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city-select">City</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger id="city-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleShowPrice}
          disabled={!selectedVariant || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Calculating..." : "Show On-Road Price"}
        </Button>

        {/* Price Breakdown */}
        {priceData && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">
              Price Breakdown for {cities.find((c) => c.id === selectedCity)?.name}
            </h3>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Ex-showroom Price</TableCell>
                    <TableCell className="text-right">
                      ₹{priceData.exShowroom.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">RTO & Registration</TableCell>
                    <TableCell className="text-right">₹{priceData.rto.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Insurance</TableCell>
                    <TableCell className="text-right">
                      ₹{priceData.insurance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Other Charges</TableCell>
                    <TableCell className="text-right">
                      ₹{priceData.others.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/5 font-semibold">
                    <TableCell>Total On-Road Price</TableCell>
                    <TableCell className="text-right text-primary text-lg">
                      ₹{priceData.onRoadTotal.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <Button
              onClick={handleOpenVariantPage}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Variant Page
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              * Prices are approximate and may vary based on dealer, location, and current offers.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default OnRoadPriceEstimator;
