import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOnRoadPrice } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface PriceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  brandName: string;
  modelName: string;
}

const cities = [
  { value: "delhi", label: "New Delhi" },
  { value: "mumbai", label: "Mumbai" },
  { value: "bangalore", label: "Bangalore" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "pune", label: "Pune" },
  { value: "chennai", label: "Chennai" },
  { value: "kolkata", label: "Kolkata" },
];

const PriceModal = ({ open, onOpenChange, variantId, brandName, modelName }: PriceModalProps) => {
  const [selectedCity, setSelectedCity] = useState("delhi");
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleShowPrice = async () => {
    setLoading(true);
    const data = await getOnRoadPrice(variantId, selectedCity);
    setPriceData(data);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>On-Road Price Calculator</DialogTitle>
          <DialogDescription>
            Get detailed price breakdown for {brandName} {modelName} in your city
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select City</label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleShowPrice} className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Calculate Price
          </Button>

          {priceData && (
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
                    <TableCell>Ex-Showroom Price</TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{priceData.exShowroom.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>RTO & Registration</TableCell>
                    <TableCell className="text-right">
                      ₹{priceData.rto.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Insurance</TableCell>
                    <TableCell className="text-right">
                      ₹{priceData.insurance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Other Charges</TableCell>
                    <TableCell className="text-right">
                      ₹{priceData.others.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/5 font-semibold">
                    <TableCell>On-Road Price ({cities.find(c => c.value === selectedCity)?.label})</TableCell>
                    <TableCell className="text-right text-primary text-lg">
                      ₹{priceData.onRoadTotal.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {priceData && (
            <p className="text-xs text-muted-foreground text-center">
              * Prices are approximate and may vary based on dealer, offers, and accessories
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceModal;
