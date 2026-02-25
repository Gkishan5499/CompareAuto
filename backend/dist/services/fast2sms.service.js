"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class Fast2SmsService {
    constructor(apiKey) {
        this.baseUrl = "https://www.fast2sms.com/dev/bulkV2";
        this.otpRoute = "otp";
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
    async sendOtp(options) {
        var _a, _b, _c, _d, _e, _f;
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
            const response = await axios_1.default.post(this.baseUrl, {
                route: this.otpRoute,
                numbers: mobile, // Single number or comma-separated
            }, {
                headers: {
                    authorization: this.apiKey,
                    "Content-Type": "application/json",
                },
                timeout: 15000, // 15 second timeout
            });
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
            }
            else {
                console.error(`❌ FAST2SMS returned false. Error: ${response.data.message || response.data.error || "Unknown error"}`);
                console.error(`📋 Full response:`, JSON.stringify(response.data));
                return false;
            }
        }
        catch (error) {
            const axiosError = error;
            console.error(`❌ Error sending OTP to ${mobile}:`, {
                status: (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status,
                statusText: (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.statusText,
                message: axiosError.message,
                data: (_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data,
            });
            // Additional debugging
            if (((_d = axiosError.response) === null || _d === void 0 ? void 0 : _d.status) === 401) {
                console.error("🔐 Authentication failed. Check your FAST2SMS_API_KEY");
            }
            else if (((_e = axiosError.response) === null || _e === void 0 ? void 0 : _e.status) === 400) {
                console.error("⚠️ Bad request. Check mobile number format and API parameters");
                console.error("📋 Response data:", JSON.stringify((_f = axiosError.response) === null || _f === void 0 ? void 0 : _f.data));
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
    verifyOtp(code, storedCode) {
        return code === storedCode;
    }
    /**
     * Check if API key is configured
     */
    isConfigured() {
        return !!this.apiKey;
    }
}
// Export singleton instance
exports.default = new Fast2SmsService();
