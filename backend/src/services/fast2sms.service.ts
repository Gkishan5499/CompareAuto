import axios, { AxiosError } from "axios";

interface Fast2SmsResponse {
  return: boolean;
  request_id?: string;
  message?: string;
  error?: string;
}

interface SendOtpOptions {
  mobile: string;
  code: string;
  templateName?: string;
}

class Fast2SmsService {
  private apiKey: string;
  private baseUrl = "https://www.fast2sms.com/dev/bulkV2";
  private otpRoute = "otp";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FAST2SMS_API_KEY || "";
    if (!this.apiKey) {
      console.warn("⚠️ FAST2SMS_API_KEY not configured. OTP SMS functionality will be disabled.");
    }
  }

  /**
   * Send OTP via FAST2SMS
   * @param options SendOtpOptions with mobile, code, and optional templateName
   * @returns boolean indicating success
   */
  async sendOtp(options: SendOtpOptions): Promise<boolean> {
    const { mobile, code } = options;

    if (!this.apiKey) {
      console.error("❌ FAST2SMS_API_KEY not configured. Cannot send OTP.");
      return false;
    }

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      console.error("❌ Invalid mobile number format");
      return false;
    }

    try {
      console.log(`📱 Sending OTP to ${mobile} via FAST2SMS...`);

      // FAST2SMS API expects these specific headers and format
      const response = await axios.post<Fast2SmsResponse>(
        this.baseUrl,
        {
          route: this.otpRoute,
          numbers: mobile, // Single number or comma-separated
        },
        {
          headers: {
            authorization: this.apiKey,
            "Content-Type": "application/json",
          },
          timeout: 15000, // 15 second timeout
        }
      );

      console.log(`📨 FAST2SMS Response:`, {
        return: response.data.return,
        request_id: response.data.request_id,
        message: response.data.message,
        error: response.data.error,
        status: response.status,
      });

      if (response.data.return) {
        console.log(`✅ OTP sent successfully to ${mobile}. Request ID: ${response.data.request_id}`);
        return true;
      } else {
        console.error(`❌ FAST2SMS returned false. Error: ${response.data.message || response.data.error || "Unknown error"}`);
        console.error(`📋 Full response:`, JSON.stringify(response.data));
        return false;
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`❌ Error sending OTP to ${mobile}:`, {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        message: axiosError.message,
        data: axiosError.response?.data,
      });
      
      // Additional debugging
      if (axiosError.response?.status === 401) {
        console.error("🔐 Authentication failed. Check your FAST2SMS_API_KEY");
      } else if (axiosError.response?.status === 400) {
        console.error("⚠️ Bad request. Check mobile number format and API parameters");
        console.error("📋 Response data:", JSON.stringify(axiosError.response?.data));
      }
      
      return false;
    }
  }

  /**
   * Verify OTP stored in memory
   * @param code The code to verify
   * @param storedCode The stored OTP code
   * @returns boolean indicating if codes match
   */
  verifyOtp(code: string, storedCode: string): boolean {
    return code === storedCode;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// Export singleton instance
export default new Fast2SmsService();
