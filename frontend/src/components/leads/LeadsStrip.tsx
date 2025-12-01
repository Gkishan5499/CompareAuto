import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Calendar } from "lucide-react";
import { LeadFormModal } from "./LeadFormModal";

interface LeadsStripProps {
  brand: string;
  model: string;
  variant?: string;
}

export const LeadsStrip = ({ brand, model, variant }: LeadsStripProps) => {
  const [modalType, setModalType] = useState<"quote" | "test-drive" | null>(null);

  return (
    <>
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold mb-1">
              Interested in {brand} {model}?
            </h3>
            <p className="text-muted-foreground text-sm">
              Get the best price or schedule a test drive at your nearest dealer
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button
              size="lg"
              variant="default"
              className="gap-2"
              onClick={() => setModalType("quote")}
            >
              <FileText className="w-4 h-4" />
              Get Price Quote
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => setModalType("test-drive")}
            >
              <Calendar className="w-4 h-4" />
              Book Test Drive
            </Button>
          </div>
        </div>
      </Card>

      <LeadFormModal
        open={modalType !== null}
        onOpenChange={(open) => !open && setModalType(null)}
        type={modalType || "quote"}
        brand={brand}
        model={model}
        variant={variant}
      />
    </>
  );
};
