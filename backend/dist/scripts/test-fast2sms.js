"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
/**
 * Debug script to test FAST2SMS API connectivity
 * Run with: npx ts-node backend/src/scripts/test-fast2sms.ts
 */
const testFast2SMS = async () => {
    var _a, _b, _c, _d, _e;
    const apiKey = process.env.FAST2SMS_API_KEY;
    console.log("\n🔍 FAST2SMS API Debug Test\n");
    console.log("═".repeat(60));
    if (!apiKey) {
        console.error("❌ FAST2SMS_API_KEY is not set in environment variables");
        console.log("\n📝 Add this to your .env file:");
        console.log("FAST2SMS_API_KEY=your_api_key_here\n");
        return;
    }
    console.log("✅ API Key found (length: " + apiKey.length + " chars)");
    console.log("═".repeat(60));
    const testMobile = "9876543210"; // Replace with test mobile
    const testOtp = "123456";
    try {
        console.log(`\n📱 Testing OTP send to: ${testMobile}`);
        console.log("⏳ Sending request to FAST2SMS...\n");
        const response = await axios_1.default.post("https://www.fast2sms.com/dev/bulkV2", {
            route: "otp",
            numbers: testMobile,
        }, {
            headers: {
                authorization: apiKey,
                "Content-Type": "application/json",
            },
            timeout: 15000,
        });
        console.log("✅ API Response Status:", response.status);
        console.log("📋 Response Data:");
        console.log(JSON.stringify(response.data, null, 2));
        if (response.data.return) {
            console.log("\n✅ SUCCESS! SMS can be sent.");
            console.log(`📊 Request ID: ${response.data.request_id}`);
        }
        else {
            console.log("\n❌ FAILED! FAST2SMS returned false.");
            console.log(`📝 Message: ${response.data.message || "N/A"}`);
            console.log(`📝 Error: ${response.data.error || "N/A"}`);
        }
    }
    catch (error) {
        console.error("\n❌ ERROR sending request:");
        console.error("Status:", (_a = error.response) === null || _a === void 0 ? void 0 : _a.status);
        console.error("Status Text:", (_b = error.response) === null || _b === void 0 ? void 0 : _b.statusText);
        console.error("Message:", error.message);
        if ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) {
            console.error("\n📋 Error Response Data:");
            console.error(JSON.stringify(error.response.data, null, 2));
        }
        console.log("\n🔧 Troubleshooting:");
        if (((_d = error.response) === null || _d === void 0 ? void 0 : _d.status) === 401) {
            console.log("   • Your API key might be invalid or expired");
            console.log("   • Check FAST2SMS dashboard for your API key");
            console.log("   • Make sure the key is copied completely");
        }
        else if (((_e = error.response) === null || _e === void 0 ? void 0 : _e.status) === 400) {
            console.log("   • Check if mobile number format is correct (10 digits)");
            console.log("   • Verify the API key is in the correct format");
            console.log("   • Check if your account has balance/quota");
        }
        else if (error.code === "ECONNABORTED") {
            console.log("   • Request timeout - check your internet connection");
            console.log("   • FAST2SMS server might be down");
        }
        else {
            console.log("   • Check your internet connection");
            console.log("   • Verify FAST2SMS service status: https://www.fast2sms.com");
        }
    }
    console.log("\n" + "═".repeat(60));
    console.log("\n");
};
// Run the test
testFast2SMS().catch(console.error);
