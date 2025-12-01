// Mock OTP and Enquiry API stubs

// In-memory store for OTP verification (mock only)
const otpStore = new Map<string, { code: string; mobile: string; expiresAt: number }>();
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Mock API: Request OTP
export const apiOtpRequest = async (mobile: string): Promise<{ success: boolean; txnId?: string; error?: string; ttl?: number }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Basic validation
  if (!/^\d{10}$/.test(mobile)) {
    return { success: false, error: "Invalid mobile number format" };
  }

  // Rate limiting (3 requests per minute per IP - mock with mobile)
  const now = Date.now();
  const rateLimit = rateLimitStore.get(mobile);
  
  if (rateLimit) {
    if (rateLimit.resetAt > now) {
      if (rateLimit.count >= 3) {
        return { success: false, error: "Too many requests. Please try again later." };
      }
      rateLimit.count++;
    } else {
      rateLimitStore.set(mobile, { count: 1, resetAt: now + 60000 }); // 1 minute
    }
  } else {
    rateLimitStore.set(mobile, { count: 1, resetAt: now + 60000 });
  }

  // Generate mock OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const txnId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  const expiresAt = now + 120000; // 2 minutes

  // Store OTP
  otpStore.set(txnId, { code, mobile, expiresAt });

  // Log for development (in production, this would be sent via SMS)
  console.log(`[MOCK OTP] Mobile: ${mobile}, Code: ${code}, TxnId: ${txnId}`);

  return { success: true, txnId, ttl: 120 };
};

// Mock API: Verify OTP
export const apiOtpVerify = async (txnId: string, code: string): Promise<{ success: boolean; error?: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const otpData = otpStore.get(txnId);

  if (!otpData) {
    return { success: false, error: "Invalid or expired transaction" };
  }

  if (Date.now() > otpData.expiresAt) {
    otpStore.delete(txnId);
    return { success: false, error: "OTP expired" };
  }

  if (otpData.code !== code) {
    return { success: false, error: "Invalid OTP" };
  }

  // OTP verified, clean up
  otpStore.delete(txnId);

  return { success: true };
};

// Mock API: Submit enquiry
export interface EnquiryPayload {
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
  message?: string;
  pageType: "model" | "variant" | "used" | "contact";
  brand?: string;
  model?: string;
  variant?: string;
  usedId?: string;
  source?: string;
}

export const apiEnquirySubmit = async (payload: EnquiryPayload): Promise<{ success: boolean; ref?: string; error?: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Validation
  if (!payload.fullName || !payload.email || !payload.mobile) {
    return { success: false, error: "Missing required fields" };
  }

  if (!/^\d{10}$/.test(payload.mobile)) {
    return { success: false, error: "Invalid mobile number" };
  }

  if (!/^\d{6}$/.test(payload.pincode)) {
    return { success: false, error: "Invalid pincode" };
  }

  // Generate reference ID
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  const ref = `ENQ-${date}-${random}`;

  // Log for development (in production, this would be saved to database)
  console.log(`[MOCK ENQUIRY] Ref: ${ref}`, payload);

  return { success: true, ref };
};
