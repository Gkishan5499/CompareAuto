import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail } from "lucide-react";
import { toast } from "sonner";

interface UsedPriceBoxProps {
  price: number;
  sellerName: string;
  sellerPhone: string;
  sellerType: string;
}

export const UsedPriceBox = ({ price, sellerName, sellerPhone, sellerType }: UsedPriceBoxProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "I'm interested in this car. Please contact me.",
  });

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Crore`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lakh`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Your request has been sent! The seller will contact you soon.");
    setFormData({
      name: "",
      phone: "",
      email: "",
      message: "I'm interested in this car. Please contact me.",
    });
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-3xl text-primary">{formatPrice(price)}</CardTitle>
        <p className="text-sm text-muted-foreground">Ex-showroom price</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-t pt-4">
          <p className="font-medium mb-1">{sellerName}</p>
          <p className="text-sm text-muted-foreground mb-2">{sellerType}</p>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4" />
            <span>{sellerPhone}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91-XXXXXXXXXX"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Your message..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Mail className="w-4 h-4 mr-2" />
            Contact Seller
          </Button>
        </form>

        <p className="text-xs text-muted-foreground border-t pt-4">
          <strong>Note:</strong> Verify all seller documents before purchase. CompareAuto is not a dealer
          and does not sell cars directly.
        </p>
      </CardContent>
    </Card>
  );
};
