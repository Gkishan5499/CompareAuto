import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Variant, Model } from "@/lib/data";
import { formatINR, parseINRToRupees } from "@/lib/guards";
import { specsApi } from "@/lib/api";

interface CompareTableProps {
  variants: (Variant | null)[];
  models: (Model | null)[];
  onRoadPrices?: (number | null)[];
}

const CompareTable = ({ variants, models, onRoadPrices }: CompareTableProps) => {
  const [specsData, setSpecsData] = useState<(any | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(true);

  // Fetch specs for each variant
  useEffect(() => {
    const fetchSpecs = async () => {
      setLoading(true);
      const promises = variants.map(async (variant) => {
        if (!variant) return null;
        try {
          return await specsApi.getByVariantId(variant.id);
        } catch (error) {
          console.error(`Failed to fetch specs for variant ${variant.id}:`, error);
          return null;
        }
      });
      const results = await Promise.all(promises);
      setSpecsData(results);
      setLoading(false);
    };

    fetchSpecs();
  }, [variants]);

  // Helper to check if values differ
  const hasDifference = (values: (string | number | undefined)[]) => {
    const uniqueValues = new Set(values.filter(v => v !== undefined && v !== null && v !== ""));
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
      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading specifications...</div>
      ) : (
        <Accordion type="multiple" defaultValue={["prices", "engine", "dimensions"]} className="w-full">
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
                          {variant ? variant.name : "—"}
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
                            {price ? formatINR(price, true) : "—"}
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

          {/* Specs from Database */}
          {specsData.some(s => s !== null) && (
            <>
              {/* Overview */}
              <AccordionItem value="overview">
                <AccordionTrigger className="px-6 py-4 bg-primary/5 hover:bg-primary/10">
                  <span className="font-semibold">Overview</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableBody>
                        {specsData.some(s => s?.overview?.summary) && (
                          <TableRow>
                            <TableCell className="sticky left-0 bg-background font-medium">Summary</TableCell>
                            {specsData.map((spec, idx) => (
                              <TableCell key={idx} className="text-sm">
                                {spec?.overview?.summary || "—"}
                              </TableCell>
                            ))}
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Safety Features */}
              <AccordionItem value="safety">
                <AccordionTrigger className="px-6 py-4 bg-primary/5 hover:bg-primary/10">
                  <span className="font-semibold">Safety Features</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableBody>
                        {specsData.some(s => s?.safety) && Object.entries(specsData[0]?.safety || {}).map(([key]) => {
                          const values = specsData.map(s => s?.safety?.[key as any]);
                          // Only show if there are differences
                          if (!hasDifference(values)) return null;
                          return (
                            <TableRow key={key}>
                              <TableCell className="sticky left-0 bg-background font-medium capitalize">{key.replace(/_/g, " ")}</TableCell>
                              {specsData.map((spec, idx) => {
                                const value = spec?.safety?.[key as keyof typeof spec.safety];
                                return renderCell(value, values);
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Exterior Features */}
              <AccordionItem value="exterior">
                <AccordionTrigger className="px-6 py-4 bg-primary/5 hover:bg-primary/10">
                  <span className="font-semibold">Exterior Features</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableBody>
                        {specsData.some(s => s?.exterior) && Object.entries(specsData[0]?.exterior || {}).map(([key]) => {
                          const values = specsData.map(s => s?.exterior?.[key as any]);
                          // Only show if there are differences
                          if (!hasDifference(values)) return null;
                          return (
                            <TableRow key={key}>
                              <TableCell className="sticky left-0 bg-background font-medium capitalize">{key.replace(/_/g, " ")}</TableCell>
                              {specsData.map((spec, idx) => {
                                const value = spec?.exterior?.[key as keyof typeof spec.exterior];
                                return renderCell(value, values);
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Interior Features */}
              <AccordionItem value="interior">
                <AccordionTrigger className="px-6 py-4 bg-primary/5 hover:bg-primary/10">
                  <span className="font-semibold">Interior Features</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableBody>
                        {specsData.some(s => s?.interior) && Object.entries(specsData[0]?.interior || {}).map(([key]) => {
                          const values = specsData.map(s => s?.interior?.[key as any]);
                          // Only show if there are differences
                          if (!hasDifference(values)) return null;
                          return (
                            <TableRow key={key}>
                              <TableCell className="sticky left-0 bg-background font-medium capitalize">{key.replace(/_/g, " ")}</TableCell>
                              {specsData.map((spec, idx) => {
                                const value = spec?.interior?.[key as keyof typeof spec.interior];
                                return renderCell(value, values);
                              })}
                            </TableRow>
                          );
                        })}
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
                        {specsData.some(s => s?.comfort) && Object.entries(specsData[0]?.comfort || {}).map(([key]) => {
                          const values = specsData.map(s => s?.comfort?.[key as any]);
                          // Only show if there are differences
                          if (!hasDifference(values)) return null;
                          return (
                            <TableRow key={key}>
                              <TableCell className="sticky left-0 bg-background font-medium capitalize">{key.replace(/_/g, " ")}</TableCell>
                              {specsData.map((spec, idx) => {
                                const value = spec?.comfort?.[key as keyof typeof spec.comfort];
                                return renderCell(value, values);
                              })}
                            </TableRow>
                          );
                        })}
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
                        {specsData.some(s => s?.infotainment) && Object.entries(specsData[0]?.infotainment || {}).map(([key]) => {
                          const values = specsData.map(s => s?.infotainment?.[key as any]);
                          // Only show if there are differences
                          if (!hasDifference(values)) return null;
                          return (
                            <TableRow key={key}>
                              <TableCell className="sticky left-0 bg-background font-medium capitalize">{key.replace(/_/g, " ")}</TableCell>
                              {specsData.map((spec, idx) => {
                                const value = spec?.infotainment?.[key as keyof typeof spec.infotainment];
                                return renderCell(value, values);
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </>
          )}
        </Accordion>
      )}
    </Card>
  );
};

export default CompareTable;
