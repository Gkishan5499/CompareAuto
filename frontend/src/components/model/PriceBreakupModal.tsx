import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getOnRoadPrice } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface PriceBreakupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string | null;
  city: string;
  brandName?: string;
  modelName?: string;
}

interface PriceBreakup {
  exShowroom: number;
  rto: number;
  insurance: number;
  others: number;
  onRoad: number;
}

export const PriceBreakupModal = ({
  open,
  onOpenChange,
  variantId,
  city,
  brandName,
  modelName,
}: PriceBreakupModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<PriceBreakup | null>(null);

  useEffect(() => {
    if (open && variantId) {
      fetchPriceBreakup();
    }
  }, [open, variantId, city]);

  const fetchPriceBreakup = async () => {
    if (!variantId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getOnRoadPrice(variantId, city);
      setPriceData(data);
    } catch (err) {
      setError("Failed to fetch price details. Please try again.");
      console.error("Price fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchPriceBreakup();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] z-[1100]">
        <DialogHeader>
          <DialogTitle>
            On-Road Price Breakup
            {brandName && modelName && (
              <span className="block text-sm font-normal text-muted-foreground mt-1">
                {brandName} {modelName}
              </span>
            )}
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
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Ex-Showroom Price</TableCell>
                  <TableCell className="text-right">
                    ₹{(priceData.exShowroom / 100000).toFixed(2)} Lakh
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">RTO & Registration</TableCell>
                  <TableCell className="text-right">
                    ₹{(priceData.rto / 100000).toFixed(2)} Lakh
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Insurance</TableCell>
                  <TableCell className="text-right">
                    ₹{(priceData.insurance / 100000).toFixed(2)} Lakh
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Other Charges</TableCell>
                  <TableCell className="text-right">
                    ₹{(priceData.others / 100000).toFixed(2)} Lakh
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2">
                  <TableCell className="font-bold text-lg">Total On-Road Price</TableCell>
                  <TableCell className="text-right font-bold text-lg text-primary">
                    ₹{(priceData.onRoad / 100000).toFixed(2)} Lakh
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}

          {!loading && !error && !priceData && variantId && (
            <Alert>
              <AlertDescription>No price data available for this variant.</AlertDescription>
            </Alert>
          )}

          {!variantId && (
            <Alert>
              <AlertDescription>Please select a variant to view price breakup.</AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground text-center">
            * Prices are indicative and subject to change. Please contact your nearest dealer for exact pricing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
