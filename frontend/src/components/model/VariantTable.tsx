import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { Variant } from "@/lib/data";
import { formatINR, parseINRToRupees } from "@/lib/guards";

interface VariantTableProps {
  variants: Variant[];
  brandSlug: string;
  modelSlug: string;
}

type SortField = "price" | "name";

const VariantTable = ({ variants, brandSlug, modelSlug }: VariantTableProps) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [fuelFilter, setFuelFilter] = useState<string>("All");
  const [transFilter, setTransFilter] = useState<string>("All");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const loadCompareIds = () => {
    const rawList = JSON.parse(localStorage.getItem("compareList") || "[]");
    const normalized = Array.isArray(rawList)
      ? rawList.filter((item) => typeof item === "string")
      : [];
    setCompareIds(normalized);
  };

  useEffect(() => {
    loadCompareIds();
    const handleUpdate = () => loadCompareIds();
    window.addEventListener("compareListUpdated", handleUpdate);
    return () => window.removeEventListener("compareListUpdated", handleUpdate);
  }, []);

  // Get unique fuel types and transmissions
  const fuelTypes = ["All", ...Array.from(new Set(variants.map(v => v.fuelType)))];
  const transmissions = ["All", ...Array.from(new Set(variants.map(v => v.transmission)))];

  // Filter and sort variants
  const filteredAndSortedVariants = useMemo(() => {
    let filtered = variants.filter(v => {
      const matchesFuel = fuelFilter === "All" || v.fuelType === fuelFilter;
      const matchesTrans = transFilter === "All" || v.transmission === transFilter;
      return matchesFuel && matchesTrans;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === "price") {
        comparison = a.price - b.price;
      } else {
        comparison = a.name.localeCompare(b.name);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [variants, fuelFilter, transFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleAddToCompare = (variantId: string) => {
    const rawList = JSON.parse(localStorage.getItem("compareList") || "[]");
    const compareList = Array.isArray(rawList)
      ? rawList.filter((item) => typeof item === "string")
      : [];

    if (!compareList.includes(variantId) && compareList.length < 3) {
      compareList.push(variantId);
      localStorage.setItem("compareList", JSON.stringify(compareList));
      window.dispatchEvent(new Event("compareListUpdated"));
    }

    setCompareIds(compareList);

    const validVariants = compareList.filter((v: string) => v !== null && v !== undefined);
    if (validVariants.length >= 2) {
      navigate(`/compare?v=${validVariants.join(",")}`);
    }
  };

  const compareSuggestions = useMemo(() => {
    if (compareIds.length !== 1) return [];
    return filteredAndSortedVariants
      .filter((variant) => variant.id !== compareIds[0])
      .slice(0, 3);
  }, [compareIds, filteredAndSortedVariants]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-sm font-medium">Fuel:</span>
          {fuelTypes.map((fuel) => (
            <Badge
              key={fuel}
              variant={fuelFilter === fuel ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFuelFilter(fuel)}
            >
              {fuel}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">Transmission:</span>
          <Select value={transFilter} onValueChange={setTransFilter}>
            <SelectTrigger className="h-8 w-[220px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {transmissions.map((trans) => (
                <SelectItem key={trans} value={trans}>
                  {trans}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {compareIds.length === 1 && compareSuggestions.length > 0 && (
        <div className="mb-6 rounded-lg border border-dashed border-primary/40 bg-muted/40 p-3">
          <div className="text-sm font-medium text-foreground mb-2">Add one more variant to compare</div>
          <div className="flex flex-wrap gap-2">
            {compareSuggestions.map((variant) => (
              <Button
                key={variant.id}
                size="sm"
                variant="outline"
                onClick={() => handleAddToCompare(variant.id)}
              >
                {variant.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  Variant <ArrowUpDown className="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>Fuel</TableHead>
              <TableHead>Transmission</TableHead>
              <TableHead>Engine</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("price")}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  Price <ArrowUpDown className="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedVariants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{variant.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{variant.fuelType}</Badge>
                </TableCell>
                <TableCell>{variant.transmission}</TableCell>
                <TableCell>{variant.engine}</TableCell>
                <TableCell>{variant.mileage} km/l</TableCell>
                <TableCell className="font-semibold text-primary">
                  {(() => {
                    const p = parseINRToRupees(variant.price);
                    return p && p > 0 ? formatINR(p, true) : "—";
                  })()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link to={`/${brandSlug}/${modelSlug}/${variant.slug}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddToCompare(variant.id)}
                    >
                      Compare
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredAndSortedVariants.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No variants found matching your filters.
        </div>
      )}
    </div>
  );
};

export default VariantTable;
