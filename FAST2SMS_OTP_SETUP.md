# FAST2SMS OTP Integration Guide

## Overview
This integration uses **FAST2SMS** service to send OTP (One-Time Password) via SMS to users for verification.

## Setup Instructions

### 1. Get FAST2SMS API Key
- Visit: https://www.fast2sms.com/
- Register/Login to your account
- Navigate to Dashboard → API Settings
- Copy your **API Authorization Key**

### 2. Set Environment Variable
Add the API key to your `.env` file:

```env
# FAST2SMS Configuration
FAST2SMS_API_KEY=your_api_key_here
```

### 3. FAST2SMS API Details
- **Service**: FAST2SMS Bulk SMS Service
- **Endpoint**: `https://www.fast2sms.com/dev/bulkV2`
- **Route**: `otp` (automatic OTP template)
- **Timeout**: 10 seconds
- **Mobile Format**: 10-digit Indian mobile numbers

## API Endpoints

### Request OTP
**POST** `/api/enquiries/request-otp`

**Request Body:**
```json
{
  "mobile": "9876543210"
}
```

**Response (Success):**
```json
{
  "success": true,
  "txnId": "TXN1704553200123abc",
  "ttl": 120,
  "message": "OTP sent to your mobile"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "Invalid mobile number"
}
```

### Verify OTP
**POST** `/api/enquiries/verify-otp`

**Request Body:**
```json
{
  "txnId": "TXN1704553200123abc",
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "Invalid OTP" | "OTP expired" | "Invalid transaction"
}
```

## FAST2SMS OTP Template
FAST2SMS provides an automatic OTP template that formats the message. The message typically looks like:

```
Your CompareAuto verification code is: XXXXXX
This code expires in 2 minutes.
Do not share this code with anyone.
```

## Files Modified/Created

### New Files
- `/backend/src/services/fast2sms.service.ts` - FAST2SMS service wrapper with error handling

### Modified Files
- `/backend/src/controllers/enquiry.controller.ts` - Updated to use FAST2SMS service for OTP delivery

## Architecture

```
Frontend (React)
    ↓
    ├─ User enters mobile number
    ├─ POST /api/enquiries/request-otp
    ↓
Backend (Express)
    ├─ Generate OTP (6 digits)
    ├─ Store in otpStore (Map) with 2-min expiry
    ├─ Call fast2SmsService.sendOtp()
    ↓
FAST2SMS API
    ├─ Validate API key
    ├─ Format OTP message
    ├─ Send SMS to mobile
    ↓
User's Phone
    ├─ Receives SMS with OTP
    ├─ Enters OTP in frontend
    ├─ POST /api/enquiries/verify-otp
    ↓
Backend
    ├─ Retrieve OTP from otpStore
    ├─ Check expiry (2 minutes)
    ├─ Verify code matches
    ├─ Delete from otpStore
    ↓
Frontend
    ├─ Show success message
    ├─ Proceed with enquiry submission
```

## Features

✅ **Automatic OTP Generation** - 6-digit codes  
✅ **2-Minute Expiry** - Security-focused  
✅ **Transactional IDs** - Track each OTP request  
✅ **Error Logging** - Comprehensive logging for debugging  
✅ **Graceful Fallback** - Still works if SMS sending fails  
✅ **Mobile Validation** - 10-digit Indian format only  
✅ **Timeout Protection** - 10-second timeout to FAST2SMS API  

## Testing

### Manual Testing
1. Replace `FAST2SMS_API_KEY` in `.env` with your actual key
2. Call POST `/api/enquiries/request-otp` with valid mobile
3. Check logs for SMS delivery status
4. Use returned `txnId` and OTP code for verification

### Without Real SMS (Development)
If API key is not configured:
- OTP still gets generated and stored
- SMS sending is skipped with warning log
- You can manually test OTP verification
- Check console logs for generated OTP codes

## Common Issues & Solutions

### Issue: "FAST2SMS_API_KEY not configured"
**Solution**: Add `FAST2SMS_API_KEY=your_key` to `.env` file and restart the server

### Issue: "Invalid mobile number format"
**Solution**: Ensure mobile number is exactly 10 digits (Indian format only)

### Issue: SMS not received but API returns success
**Possible Causes:**
- FAST2SMS account has insufficient balance
- Mobile number blacklisted/opted out
- FAST2SMS service temporarily down
- Check FAST2SMS dashboard for delivery reports

### Issue: FAST2SMS API timeout
**Solution**: Check your internet connection and FAST2SMS service status

## Security Best Practices

1. ✅ Never log OTP codes in production (only txnId)
2. ✅ Always validate mobile format
3. ✅ Implement rate limiting on request-otp endpoint
4. ✅ Use HTTPS for all OTP-related endpoints
5. ✅ Store API key only in environment variables
6. ✅ Clear expired OTPs periodically (currently: 2 minutes)
7. ✅ Implement max attempts limit for OTP verification

## Rate Limiting Recommendation

Add rate limiting middleware to OTP endpoints:

```typescript
import rateLimit from "express-rate-limit";

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per windowMs
  message: "Too many OTP requests, please try again later",
});

router.post("/request-otp", otpLimiter, requestOtp);
router.post("/verify-otp", otpLimiter, verifyOtp);
```

## Monitoring & Logging

All OTP operations are logged with prefixes:
- 📱 - SMS sending operations
- ✅ - Successful operations
- ❌ - Failures
- ⚠️ - Warnings
- 📌 - Info messages

Check logs regularly for any issues or anomalies.

## Support
For FAST2SMS support: https://www.fast2sms.com/support
