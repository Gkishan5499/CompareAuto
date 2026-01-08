const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface EnquiryPayload {
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
  message?: string;
  pageType: "model" | "variant" | "used" | "contact" | string;
  brand?: string;
  model?: string;
  variant?: string;
  usedId?: string;
  source?: string;
}

const postJson = async <T>(endpoint: string, body: any): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Request failed");
  return json as T;
};

export const apiOtpRequest = async (mobile: string, email: string): Promise<{ success: boolean; txnId?: string; error?: string; ttl?: number }> => {
  return postJson("/enquiries/otp/request", { mobile, email });
};

export const apiOtpVerify = async (txnId: string, code: string): Promise<{ success: boolean; error?: string }> => {
  return postJson("/enquiries/otp/verify", { txnId, code });
};

export const apiEnquirySubmit = async (payload: EnquiryPayload): Promise<{ success: boolean; ref?: string; error?: string }> => {
  return postJson("/enquiries", payload);
};
