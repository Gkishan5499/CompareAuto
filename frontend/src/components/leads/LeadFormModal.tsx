import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";

interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "quote" | "test-drive";
  brand: string;
  model: string;
  variant?: string;
}

export const LeadFormModal = ({ open, onOpenChange, type, brand, model, variant }: LeadFormModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === "quote" ? "Get Price Quote" : "Book Test Drive"}
          </DialogTitle>
          <DialogDescription>
            {type === "quote"
              ? "Fill in your details to get the best price offer from our dealers."
              : "Schedule a test drive at your nearest dealership."}
          </DialogDescription>
        </DialogHeader>

        <EnquiryForm
          context={{
            pageType: variant ? "variant" : "model",
            brand,
            model,
            variant,
          }}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
