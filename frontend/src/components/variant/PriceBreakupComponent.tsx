import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/guards";
import { PriceBreakdown, getPriceBreakdownPercentages } from "@/lib/priceCalculations";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PriceBreakupComponentProps {
  breakdown: PriceBreakdown;
  city: string;
}

export const PriceBreakupComponent = ({
  breakdown,
  city,
}: PriceBreakupComponentProps) => {
  const percentages = getPriceBreakdownPercentages(breakdown);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Info className="w-4 h-4" />
          Price Breakdown
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>On-Road Price Breakdown - {city}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Main breakdown card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Price Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Ex-Showroom Price</span>
                  <span className="font-semibold">{formatINR(breakdown.exShowroomPrice)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">
                    Individual Registration (RTO)
                  </span>
                  <span className="font-semibold text-orange-600">{formatINR(breakdown.rto)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">
                    Insurance ({percentages.insurance}%)
                  </span>
                  <span className="font-semibold text-orange-600">{formatINR(breakdown.insurance)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Other Charges</span>
                  <span className="font-semibold text-orange-600">{formatINR(breakdown.otherCharges)}</span>
                </div>
                <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>TCS (1%)</span>
                    <span>₹{breakdown.tcs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FASTag</span>
                    <span>₹{breakdown.fastag.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 bg-primary/5 rounded p-3 mt-4">
                  <span className="font-bold text-lg">On-Road Price</span>
                  <span className="font-bold text-lg text-primary">{formatINR(breakdown.onRoadPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">% of Base</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Ex-Showroom Price</TableCell>
                    <TableCell className="text-right">{formatINR(breakdown.exShowroomPrice)}</TableCell>
                    <TableCell className="text-right">100%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">Individual Registration (RTO)</TableCell>
                    <TableCell className="text-right text-orange-600">{formatINR(breakdown.rto)}</TableCell>
                    <TableCell className="text-right">{percentages.rto}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">Insurance (Comprehensive)</TableCell>
                    <TableCell className="text-right text-orange-600">{formatINR(breakdown.insurance)}</TableCell>
                    <TableCell className="text-right">{percentages.insurance}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">Other Charges</TableCell>
                    <TableCell className="text-right text-orange-600">{formatINR(breakdown.otherCharges)}</TableCell>
                    <TableCell className="text-right">~{((breakdown.otherCharges / breakdown.exShowroomPrice) * 100).toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8 text-sm text-muted-foreground/70">TCS (1%)</TableCell>
                    <TableCell className="text-right text-sm">₹{breakdown.tcs.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">{((breakdown.tcs / breakdown.exShowroomPrice) * 100).toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8 text-sm text-muted-foreground/70">FASTag</TableCell>
                    <TableCell className="text-right text-sm">₹{breakdown.fastag.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">-</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/5 font-bold">
                    <TableCell>On-Road Price</TableCell>
                    <TableCell className="text-right text-primary">{formatINR(breakdown.onRoadPrice)}</TableCell>
                    <TableCell className="text-right">{((breakdown.onRoadPrice / breakdown.exShowroomPrice - 1) * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> Prices vary by city and state. These calculations are approximate and based on current rates.
              Actual on-road prices may vary depending on dealer discounts, exchange value, and finance options.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
