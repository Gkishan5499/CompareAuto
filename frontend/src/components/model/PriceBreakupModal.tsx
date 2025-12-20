import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getOnRoadPrice } from "@/lib/api";
import { calculatePriceBreakdown, PriceBreakdown, getStateFromCity } from "@/lib/priceCalculations";
import { formatINR } from "@/lib/guards";
import { MapPin, Loader2, Fuel } from "lucide-react";

interface PriceBreakupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string | null;
  city: string;
  brandName?: string;
  modelName?: string;
  exShowroomPrice?: number;
}

export const PriceBreakupModal = ({
  open,
  onOpenChange,
  variantId,
  city,
  brandName,
  modelName,
  exShowroomPrice,
}: PriceBreakupModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<PriceBreakdown | null>(null);
  const [variantData, setVariantData] = useState<any>(null);
  const state = getStateFromCity(city);

  useEffect(() => {
    if (open && variantId) {
      fetchVariantData();
      if (exShowroomPrice) {
        calculatePrice();
      }
    }
  }, [open, exShowroomPrice, city, variantId]);

  const fetchVariantData = async () => {
    if (!variantId) return;
    
    try {
      const resp = await fetch(`/api/variants/${variantId}`);
      if (resp.ok) {
        const data = await resp.json();
        setVariantData(data);
      }
    } catch (err) {
      console.error('Failed to fetch variant data:', err);
    }
  };
  
  const calculatePrice = async () => {
    if (!exShowroomPrice && !variantId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (variantId) {
        const timestamp = new Date().getTime();
        const resp = await fetch(
          `/api/pricing/variant/${variantId}/price?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&_t=${timestamp}`,
          {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        );
        if (resp.ok) {
          const json = await resp.json();
          console.log('Modal: Backend pricing response:', json);
          if (json.breakdown?.exShowroomPrice > 0) {
            setPriceData(json.breakdown);
          } else {
            setError('Variant price data not available. Please check admin data.');
          }
          setLoading(false);
          return;
        } else {
          setError('Pricing unavailable for selected state/city.');
          return;
        }
      }
    } catch (err) {
      console.error('Modal pricing error:', err);
      setError('Pricing service error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    calculatePrice();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto z-[1100]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                On-Road Price Breakdown
              </span>
            </div>
            {brandName && modelName && (
              <span className="block text-base font-semibold text-foreground mt-2">
                {brandName} {modelName}
              </span>
            )}
            {variantData && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {variantData.name}
                </span>
                {variantData.fuelType && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    {variantData.fuelType}
                  </Badge>
                )}
              </div>
            )}
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              {city}, {state}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && priceData && (
            <div className="space-y-6">
              {/* Debug Info */}
              {priceData.exShowroomPrice <= 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Variant price is ₹0. Please update the variant price in admin before checking on-road pricing.
                  </AlertDescription>
                </Alert>
              )}
              {/* Main Price Card - CarWale Style */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-xl p-6">
                <div className="space-y-4">
                  {/* Ex-Showroom Price */}
                  <div className="flex justify-between items-center pb-3 border-b border-primary/20">
                    <span className="text-sm font-medium text-muted-foreground">Ex-Showroom Price</span>
                    <span className="text-2xl font-bold">{formatINR(priceData.exShowroomPrice, true)}</span>
                  </div>

                  {/* Individual Registration */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-muted-foreground">Individual Registration</span>
                    <span className="text-xl font-semibold text-orange-600">{formatINR(priceData.rto)}</span>
                  </div>

                  {/* Insurance */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-muted-foreground">Insurance</span>
                    <span className="text-xl font-semibold text-orange-600">{formatINR(priceData.insurance)}</span>
                  </div>

                  {/* Other Charges */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-medium text-muted-foreground">Other Charges</span>
                      <span className="text-xl font-semibold text-orange-600">{formatINR(priceData.otherCharges)}</span>
                    </div>
                    <div className="pl-4 space-y-2 text-sm">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          TCS (1%)
                        </span>
                        <span className="font-medium">Rs. {priceData.tcs.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          FASTag
                        </span>
                        <span className="font-medium">Rs. {priceData.fastag.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* On-Road Price - Prominent */}
                  <div className="flex justify-between items-center pt-4 border-t-2 border-primary">
                    <span className="text-lg font-bold">On Road Price</span>
                    <span className="text-3xl font-bold text-primary">{formatINR(priceData.onRoadPrice, true)}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b">
                  <h4 className="font-semibold text-sm">Detailed Breakdown</h4>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      {/* <TableHead className="text-right w-24">% of Base</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="font-medium">
                      <TableCell>Ex-Showroom Price</TableCell>
                      <TableCell className="text-right">{formatINR(priceData.exShowroomPrice)}</TableCell>
                      {/* <TableCell className="text-right">100%</TableCell> */}
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Individual Registration (RTO)</TableCell>
                      <TableCell className="text-right text-orange-600">{formatINR(priceData.rto)}</TableCell>
                      {/* <TableCell className="text-right">
                        {((priceData.rto / priceData.exShowroomPrice) * 100).toFixed(1)}%
                      </TableCell> */}
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Insurance (Comprehensive)</TableCell>
                      <TableCell className="text-right text-orange-600">{formatINR(priceData.insurance)}</TableCell>
                      {/* <TableCell className="text-right">
                        {((priceData.insurance / priceData.exShowroomPrice) * 100).toFixed(1)}%
                      </TableCell> */}
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Other Charges</TableCell>
                      <TableCell className="text-right text-orange-600">{formatINR(priceData.otherCharges)}</TableCell>
                      {/* <TableCell className="text-right">
                        {((priceData.otherCharges / priceData.exShowroomPrice) * 100).toFixed(2)}%
                      </TableCell> */}
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-8 text-muted-foreground/70">TCS (1%)</TableCell>
                      <TableCell className="text-right">Rs. {priceData.tcs.toLocaleString()}</TableCell>
                      {/* <TableCell className="text-right">
                        {((priceData.tcs / priceData.exShowroomPrice) * 100).toFixed(2)}%
                      </TableCell> */}
                    </TableRow>
                    <TableRow className="text-xs">
                      <TableCell className="pl-8 text-muted-foreground/70">FASTag</TableCell>
                      <TableCell className="text-right">Rs. {priceData.fastag.toLocaleString()}</TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                    <TableRow className="border-t-2 bg-primary/5 font-bold">
                      <TableCell>On-Road Price</TableCell>
                      <TableCell className="text-right text-primary text-lg">{formatINR(priceData.onRoadPrice)}</TableCell>
                      {/* <TableCell className="text-right">
                        {((priceData.onRoadPrice / priceData.exShowroomPrice - 1) * 100).toFixed(1)}%
                      </TableCell> */}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Summary Box */}
              <div className="bg-primary/10 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Price Summary for {city}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ex-Showroom</p>
                    <p className="font-bold text-lg">{formatINR(priceData.exShowroomPrice, true)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">On-Road Total</p>
                    <p className="font-bold text-lg text-primary">{formatINR(priceData.onRoadPrice, true)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">
                      State: <span className="font-semibold">{state}</span> | 
                      Additional Charges: <span className="font-semibold">{formatINR(priceData.otherCharges)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && !priceData && exShowroomPrice && (
            <Alert>
              <AlertDescription>No price data available. Please try again.</AlertDescription>
            </Alert>
          )}

          {!exShowroomPrice && (
            <Alert>
              <AlertDescription>Unable to fetch price details for this variant.</AlertDescription>
            </Alert>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground flex items-center gap-2">
              <span className="text-yellow-600">ℹ️</span> Important Information
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>On-Road price calculated for <strong>{city}, {state}</strong></li>
              <li>Individual Registration includes RTO, road tax, and registration fees</li>
              <li>TCS (Tax Collected at Source) applies to vehicles above Rs. 10 lakh</li>
              <li>Insurance covers comprehensive own damage + third-party liability</li>
              <li>Actual prices may vary based on dealer offers, exchange value, and finance schemes</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceBreakupModal;
