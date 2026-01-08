import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiOtpRequest, apiOtpVerify, apiEnquirySubmit, EnquiryPayload } from "@/lib/api-otp";
import { useCity } from "@/contexts/CityContext";

interface EnquiryFormProps {
  context?: {
    pageType: "model" | "variant" | "used" | "contact" | "upcoming" | "dealer";
    brand?: string;
    model?: string;
    dealerId?: string;
    variant?: string;
    usedId?: string;
  };
  modelName?: string;
  pageType?: string;
  onSuccess?: () => void;
  inline?: boolean;
}

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal"
];

export const EnquiryForm = ({ context, modelName, pageType, onSuccess, inline = false }: EnquiryFormProps) => {
  const { city: globalCity } = useCity();
  const [step, setStep] = useState<"details" | "otp" | "success">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    city: globalCity || "Delhi NCR",
    state: "Delhi",
    pincode: "",
    message: "",
    consent: false,
  });

  // OTP state
  const [txnId, setTxnId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [refId, setRefId] = useState("");

  // Update city from global context
  useEffect(() => {
    if (globalCity) {
      setFormData((prev) => ({ ...prev, city: globalCity }));
    }
  }, [globalCity]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }
    if (!formData.consent) {
      toast.error("Please accept the consent to proceed");
      return false;
    }
    return true;
  };

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await apiOtpRequest(formData.mobile, formData.email);
      if (result.success && result.txnId) {
        setTxnId(result.txnId);
        setStep("otp");
        setResendTimer(30);
        toast.success("OTP sent to your email");
      } else {
        toast.error(result.error || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP and Submit
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setOtpError("Please enter complete 6-digit OTP");
      return;
    }

    setIsSubmitting(true);
    setOtpError("");

    try {
      // Verify OTP
      const verifyResult = await apiOtpVerify(txnId, otpCode);
      if (!verifyResult.success) {
        setOtpError(verifyResult.error || "Invalid OTP");
        setIsSubmitting(false);
        return;
      }

      // Submit enquiry
      const payload: EnquiryPayload = {
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        message: modelName ? `${formData.message}\n\nModel: ${modelName}` : formData.message,
        pageType: (pageType as any) || context?.pageType || "contact",
        brand: context?.brand,
        model: context?.model,
        variant: context?.variant,
        usedId: context?.usedId,
      };

      const enquiryResult = await apiEnquirySubmit(payload);
      if (enquiryResult.success && enquiryResult.ref) {
        setRefId(enquiryResult.ref);
        setStep("success");
        toast.success("Enquiry submitted successfully!");
        if (onSuccess) onSuccess();
      } else {
        toast.error(enquiryResult.error || "Failed to submit enquiry");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsSubmitting(true);
    try {
      const result = await apiOtpRequest(formData.mobile, formData.email);
      if (result.success && result.txnId) {
        setTxnId(result.txnId);
        setOtpCode("");
        setOtpError("");
        setResendTimer(30);
        toast.success("OTP resent successfully");
      } else {
        toast.error(result.error || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CardWrapper = inline ? "div" : Card;
  const cardProps = inline ? {} : { className: "p-6" };

  // Step: Details Form
  if (step === "details") {
    return (
      <CardWrapper {...cardProps}>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                maxLength={255}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "") })}
                placeholder="10-digit mobile number"
                maxLength={10}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Your city"
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value })}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50 max-h-[200px]">
                  {STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                placeholder="6-digit pincode"
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Any specific requirements or questions..."
              rows={4}
              maxLength={1000}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={formData.consent}
              onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
            />
            <label htmlFor="consent" className="text-sm text-muted-foreground leading-tight cursor-pointer">
              By continuing, you agree to be contacted by phone/SMS/email. See Privacy Policy. *
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSendOtp}
              disabled={isSubmitting}
              className="flex-1"
              size="lg"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send OTP
            </Button>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Step: OTP Verification
  if (step === "otp") {
    return (
      <CardWrapper {...cardProps}>
        <div className="space-y-6 max-w-md mx-auto text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">Verify OTP</h3>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to {formData.email}
            </p>
          </div>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={(value) => {
                setOtpCode(value);
                setOtpError("");
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {otpError && (
            <p className="text-sm text-destructive" role="alert" aria-live="polite">
              {otpError}
            </p>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleVerifyOtp}
              disabled={isSubmitting || otpCode.length !== 6}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Verify OTP
            </Button>

            <Button
              variant="ghost"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || isSubmitting}
              className="w-full"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setStep("details")}
              disabled={isSubmitting}
              className="w-full"
            >
              Back to Details
            </Button>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Step: Success
  return (
    <CardWrapper {...cardProps}>
      <div className="text-center space-y-6 py-8">
        <div className="bg-green-50 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
          <p className="text-muted-foreground mb-4">
            Your enquiry has been submitted successfully.
          </p>
          <Badge variant="secondary" className="text-base px-4 py-2">
            Reference ID: {refId}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          We'll contact you at {formData.email} and {formData.mobile} within 24-48 hours.
        </p>
      </div>
    </CardWrapper>
  );
};
