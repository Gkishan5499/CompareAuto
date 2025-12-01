import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Variant, Model } from "@/lib/data";
import { formatINR, parseINRToRupees } from "@/lib/guards";

interface CompareTableProps {
  variants: (Variant | null)[];
  models: (Model | null)[];
  onRoadPrices?: (number | null)[];
}

const CompareTable = ({ variants, models, onRoadPrices }: CompareTableProps) => {
  // Helper to check if values differ
  const hasDifference = (values: (string | number | undefined)[]) => {
    const uniqueValues = new Set(values.filter(v => v !== undefined && v !== null));
    return uniqueValues.size > 1;
  };

  // Helper to render cell with highlight
  const renderCell = (value: string | number | undefined, allValues: (string | number | undefined)[]) => {
    const isDifferent = hasDifference(allValues);
    return (
      <TableCell
        className={cn(
          "font-medium",
          isDifferent && value && "bg-yellow-50 dark:bg-yellow-950 font-bold"
        )}
      >
        {value || "—"}
      </TableCell>
    );
  };

  return (
    <Card className="overflow-hidden">
      <Accordion type="multiple" defaultValue={["prices", "engine", "safety"]} className="w-full">
        {/* Prices Section */}
        <AccordionItem value="prices">
          <AccordionTrigger className="px-6 py-4 bg-primary/5 hover:bg-primary/10">
            <span className="font-semibold">Prices</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10">Price Component</TableHead>
                    {variants.map((variant, idx) => (
                      <TableHead key={idx} className="text-center">
                        {variant ? `Variant ${String.fromCharCode(65 + idx)}` : "—"}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Ex-Showroom</TableCell>
                    {variants.map((variant, idx) => (
                      <TableCell key={idx} className="text-center font-semibold text-primary">
                        {variant ? (() => {
                          const p = parseINRToRupees(variant.price);
                          return p && p > 0 ? formatINR(p, true) : "—";
                        })() : "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                  {onRoadPrices && onRoadPrices.some(p => p !== null) && (
                    <TableRow>
                      <TableCell className="sticky left-0 bg-background font-medium">On-Road Price</TableCell>
                      {onRoadPrices.map((price, idx) => (
                        <TableCell key={idx} className="text-center font-semibold text-primary">
                          {price ? `₹${(price / 100000).toFixed(2)}L` : "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Engine & Performance */}
        <AccordionItem value="engine">
          <AccordionTrigger className="px-6 py-4 bg-primary/5 hover:bg-primary/10">
            <span className="font-semibold">Engine & Performance</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Engine</TableCell>
                    {variants.map((variant, idx) => {
                      const values = variants.map(v => v?.engine);
                      return renderCell(variant?.engine, values);
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Fuel Type</TableCell>
                    {variants.map((variant, idx) => {
                      const values = variants.map(v => v?.fuelType);
                      return renderCell(variant?.fuelType, values);
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Transmission</TableCell>
                    {variants.map((variant, idx) => {
                      const values = variants.map(v => v?.transmission);
                      return renderCell(variant?.transmission, values);
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Mileage</TableCell>
                    {variants.map((variant, idx) => {
                      const values = variants.map(v => v?.mileage);
                      return renderCell(variant ? `${variant.mileage} km/l` : undefined, values);
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Dimensions */}
        <AccordionItem value="dimensions">
          <AccordionTrigger className="px-6 py-4 bg-primary/5 hover:bg-primary/10">
            <span className="font-semibold">Dimensions & Capacity</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Seating</TableCell>
                    {variants.map((variant, idx) => {
                      const values = variants.map(v => v?.seating);
                      return renderCell(variant ? `${variant.seating} Seater` : undefined, values);
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Body Type</TableCell>
                    {variants.map((variant, idx) => {
                      const model = models[idx];
                      const values = models.map(m => m?.bodyType);
                      return renderCell(model?.bodyType, values);
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Safety */}
        <AccordionItem value="safety">
          <AccordionTrigger className="px-6 py-4 bg-primary/5 hover:bg-primary/10">
            <span className="font-semibold">Safety Features</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Airbags</TableCell>
                    {variants.map((_, idx) => (
                      <TableCell key={idx} className="text-center">
                        6 Airbags
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">ABS</TableCell>
                    {variants.map((_, idx) => (
                      <TableCell key={idx} className="text-center">
                        Standard
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">ESP</TableCell>
                    {variants.map((_, idx) => (
                      <TableCell key={idx} className="text-center">
                        Available
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Infotainment */}
        <AccordionItem value="infotainment">
          <AccordionTrigger className="px-6 py-4 bg-primary/5 hover:bg-primary/10">
            <span className="font-semibold">Infotainment</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Touchscreen</TableCell>
                    {variants.map((_, idx) => (
                      <TableCell key={idx} className="text-center">
                        7-inch
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Android Auto</TableCell>
                    {variants.map((_, idx) => (
                      <TableCell key={idx} className="text-center">
                        ✓
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Apple CarPlay</TableCell>
                    {variants.map((_, idx) => (
                      <TableCell key={idx} className="text-center">
                        ✓
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Comfort & Convenience */}
        <AccordionItem value="comfort">
          <AccordionTrigger className="px-6 py-4 bg-primary/5 hover:bg-primary/10">
            <span className="font-semibold">Comfort & Convenience</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Climate Control</TableCell>
                    {variants.map((_, idx) => (
                      <TableCell key={idx} className="text-center">
                        Auto
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Sunroof</TableCell>
                    {variants.map((_, idx) => (
                      <TableCell key={idx} className="text-center">
                        —
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background font-medium">Wireless Charger</TableCell>
                    {variants.map((_, idx) => (
                      <TableCell key={idx} className="text-center">
                        ✓
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default CompareTable;
