import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCity } from "@/contexts/CityContext";
import { apiFuelPrice } from "@/lib/api-prices";
import { apiElectricityRate } from "@/lib/api-prices";
import { listCities, listStates, listDiscoms } from "@/lib/prices";
import { toast } from "sonner";

const FuelCostEstimator = () => {
  const { city: globalCity } = useCity();
  const [vehicleType, setVehicleType] = useState<"fuel" | "ev">("fuel");
  const [monthlyKm, setMonthlyKm] = useState(1000);
  const [efficiency, setEfficiency] = useState(15); // km/l for fuel or kWh/km for EV (0.12)
  const [fuelType, setFuelType] = useState("petrol");
  const [fuelPrice, setFuelPrice] = useState(105);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDiscom, setSelectedDiscom] = useState("");
  const [evRate, setEvRate] = useState(8);
  const [fixedCharge, setFixedCharge] = useState(0.5);
  const [lastUpdated, setLastUpdated] = useState("");
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  const cities = listCities();
  const states = listStates();
  const discoms = selectedState ? listDiscoms(selectedState) : [];

  // Auto-fetch fuel price when city or fuel type changes
  useEffect(() => {
    if (vehicleType === "fuel" && selectedCity) {
      fetchFuelPrice();
    }
  }, [selectedCity, fuelType, vehicleType]);

  // Auto-fetch electricity rate when state/discom changes
  useEffect(() => {
    if (vehicleType === "ev" && selectedState && selectedDiscom) {
      fetchElectricityRate();
    }
  }, [selectedState, selectedDiscom, vehicleType]);

  // Set initial city from global context
  useEffect(() => {
    if (globalCity) {
      const citySlug = globalCity.toLowerCase().replace(/ /g, "-");
      setSelectedCity(citySlug);
    }
  }, [globalCity]);

  const fetchFuelPrice = async () => {
    setIsLoadingPrice(true);
    try {
      const result = await apiFuelPrice(selectedCity);
      if ("error" in result) {
        toast.error("Could not fetch fuel price for selected city");
      } else {
        const price = fuelType === "petrol" ? result.petrol : fuelType === "diesel" ? result.diesel : result.cng;
        if (price) {
          setFuelPrice(price);
          setLastUpdated(result.updated);
        } else {
          toast.info("CNG not available in this city");
        }
      }
    } catch (error) {
      toast.error("Failed to fetch fuel price");
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const fetchElectricityRate = async () => {
    setIsLoadingPrice(true);
    try {
      const result = await apiElectricityRate(selectedState, selectedDiscom);
      if ("error" in result) {
        toast.error("Could not fetch electricity rate");
      } else {
        // Calculate average rate from slabs (simplified - take middle slab or weighted average)
        const avgRate = result.slabs.reduce((sum, slab) => sum + slab.ratePerUnit, 0) / result.slabs.length;
        setEvRate(parseFloat(avgRate.toFixed(2)));
        setFixedCharge(result.slabs[0].fixedPerDay);
        setLastUpdated(result.updated);
      }
    } catch (error) {
      toast.error("Failed to fetch electricity rate");
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const presets = {
    fuel: [
      { label: "City Commute", km: 500, efficiency: 12, fuelType: "petrol", price: 105 },
      { label: "Regular Use", km: 1000, efficiency: 15, fuelType: "petrol", price: 105 },
      { label: "Heavy Use", km: 2000, efficiency: 18, fuelType: "diesel", price: 95 },
    ],
    ev: [
      { label: "City Commute", km: 500, efficiency: 150, fuelType: "ev", price: 8 },
      { label: "Regular Use", km: 1000, efficiency: 150, fuelType: "ev", price: 8 },
      { label: "Heavy Use", km: 2000, efficiency: 140, fuelType: "ev", price: 8 },
    ],
  };

  const fuelTypes = [
    { id: "petrol", name: "Petrol", defaultPrice: 105, unit: "₹/L" },
    { id: "diesel", name: "Diesel", defaultPrice: 95, unit: "₹/L" },
    { id: "cng", name: "CNG", defaultPrice: 85, unit: "₹/kg" },
    { id: "ev", name: "Electric", defaultPrice: 8, unit: "₹/kWh" },
  ];

  const calculateCost = () => {
    if (vehicleType === "fuel") {
      // For fuel vehicles: (km / efficiency) * price
      const monthlyConsumption = monthlyKm / efficiency;
      const monthlyCost = monthlyConsumption * fuelPrice;
      const annualCost = monthlyCost * 12;
      return { monthlyCost, annualCost, consumption: monthlyConsumption };
    } else {
      // For EVs: (km * kWhPerKm) * rate + fixed charges
      // efficiency is now kWh per km (e.g., 0.12 for 12 kWh/100km)
      const kWhPerKm = efficiency / 100; // Convert to decimal if needed, or use directly
      const monthlyConsumption = monthlyKm * kWhPerKm;
      const energyCost = monthlyConsumption * evRate;
      const fixedCost = fixedCharge * 30; // Monthly fixed charges
      const monthlyCost = energyCost + fixedCost;
      const annualCost = monthlyCost * 12;
      return { monthlyCost, annualCost, consumption: monthlyConsumption };
    }
  };

  const { monthlyCost, annualCost, consumption } = calculateCost();

  const applyPreset = (preset: any) => {
    setMonthlyKm(preset.km);
    setEfficiency(preset.efficiency);
    setFuelType(preset.fuelType);
    setFuelPrice(preset.price);
    if (preset.fuelType === "ev") {
      setVehicleType("ev");
    } else {
      setVehicleType("fuel");
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Vehicle Type Toggle */}
        <div className="space-y-2">
          <Label>Vehicle Type</Label>
          <Tabs value={vehicleType} onValueChange={(v) => setVehicleType(v as "fuel" | "ev")}>
            <TabsList className="grid w-full grid-cols-2 bg-blue-50">
              <TabsTrigger
                value="fuel"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Fuel Vehicle
              </TabsTrigger>
              <TabsTrigger
                value="ev"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Electric Vehicle
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Preset Chips */}
        <div className="space-y-2">
          <Label>Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            {presets[vehicleType].map((preset, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthly-km">Monthly Kilometers</Label>
              <Input
                id="monthly-km"
                type="number"
                value={monthlyKm}
                onChange={(e) => setMonthlyKm(Number(e.target.value))}
                min={0}
                step={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="efficiency">
                {vehicleType === "fuel" ? "Mileage (km/l or km/kg)" : "Efficiency (kWh/100km)"}
              </Label>
              <Input
                id="efficiency"
                type="number"
                value={efficiency}
                onChange={(e) => setEfficiency(Number(e.target.value))}
                min={0}
                step={vehicleType === "fuel" ? 0.1 : 0.5}
              />
              {vehicleType === "ev" && (
                <p className="text-xs text-muted-foreground">Default: 12 kWh/100km (editable)</p>
              )}
            </div>

            {vehicleType === "fuel" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fuel-type">Fuel Type</Label>
                  <Select
                    value={fuelType}
                    onValueChange={(value) => {
                      setFuelType(value);
                      if (selectedCity) fetchFuelPrice();
                    }}
                  >
                    <SelectTrigger id="fuel-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="cng">CNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city-select">City</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger id="city-select">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50 max-h-[200px]">
                      {cities.map((city) => (
                        <SelectItem key={city.slug} value={city.slug}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuel-price">Fuel Price (₹/L or ₹/kg)</Label>
                  <Input
                    id="fuel-price"
                    type="number"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(Number(e.target.value))}
                    min={0}
                    step={0.1}
                    disabled={isLoadingPrice}
                  />
                  {lastUpdated && (
                    <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="state-select">State</Label>
                  <Select value={selectedState} onValueChange={(value) => {
                    setSelectedState(value);
                    setSelectedDiscom("");
                  }}>
                    <SelectTrigger id="state-select">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50 max-h-[200px]">
                      {states.map((state) => (
                        <SelectItem key={state.slug} value={state.slug}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedState && (
                  <div className="space-y-2">
                    <Label htmlFor="discom-select">DISCOM</Label>
                    <Select value={selectedDiscom} onValueChange={setSelectedDiscom}>
                      <SelectTrigger id="discom-select">
                        <SelectValue placeholder="Select DISCOM" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {discoms.map((discom) => (
                          <SelectItem key={discom.slug} value={discom.slug}>
                            {discom.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="ev-rate">Electricity Rate (₹/kWh)</Label>
                  <Input
                    id="ev-rate"
                    type="number"
                    value={evRate}
                    onChange={(e) => setEvRate(Number(e.target.value))}
                    min={0}
                    step={0.1}
                    disabled={isLoadingPrice}
                  />
                  {lastUpdated && (
                    <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fixed-charge">Fixed Charge (₹/day)</Label>
                  <Input
                    id="fixed-charge"
                    type="number"
                    value={fixedCharge}
                    onChange={(e) => setFixedCharge(Number(e.target.value))}
                    min={0}
                    step={0.1}
                  />
                </div>
              </>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="bg-primary/5 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Monthly Cost</p>
              <p className="text-4xl font-bold text-primary">₹{Math.round(monthlyCost).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Annual Cost</p>
                <p className="text-xl font-semibold">₹{Math.round(annualCost).toLocaleString()}</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">
                  {vehicleType === "fuel" ? "Monthly Fuel" : "Monthly kWh"}
                </p>
                <p className="text-xl font-semibold">
                  {consumption.toFixed(1)}
                  {vehicleType === "fuel" ? "L" : " kWh"}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">Cost Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Day</span>
                  <span className="font-medium">₹{(monthlyCost / 30).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Week</span>
                  <span className="font-medium">₹{(monthlyCost / 4.33).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per 100 km</span>
                  <span className="font-medium">
                    ₹{((monthlyCost / monthlyKm) * 100).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2 border-t">
              * Fuel prices vary by city and date. Update prices for accurate estimates.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FuelCostEstimator;
