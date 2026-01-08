# ✅ OTP via Email - Implemented

## Changes Made

Your system has been switched from **SMS (mobile) to Email** for OTP delivery.

### Backend Changes

**File:** `backend/src/controllers/enquiry.controller.ts`

1. **Updated `requestOtp` endpoint:**
   - Now accepts both `mobile` and `email` from request body
   - Validates email format
   - Generates beautiful OTP email with:
     - Styled HTML template
     - 6-digit OTP displayed prominently
     - 2-minute expiry notice
     - Security warning
   - Sends OTP via email instead of SMS
   - SMS logic temporarily disabled (awaiting FAST2SMS verification)

2. **Updated `sendEmail` helper:**
   - Now accepts optional `userEmail` parameter
   - Can send to user's email or admin notification email
   - Returns boolean success status
   - Better error handling with try-catch

### Frontend Changes

**File:** `frontend/src/lib/api-otp.ts`
- Updated `apiOtpRequest()` to accept both `mobile` and `email` parameters
- Sends both to backend

**File:** `frontend/src/components/enquiry/EnquiryForm.tsx`
- `handleSendOtp()`: Now passes email when calling `apiOtpRequest()`
- `handleResendOtp()`: Now passes email when resending OTP
- OTP verification message updated to say "sent to {email}"
- Toast messages updated to "OTP sent to your email"

## How It Works Now

1. **User enters details** including email and mobile number
2. **Clicks "Send OTP"**
3. **Backend:**
   - Validates email format
   - Generates 6-digit OTP code
   - Creates unique transaction ID (txnId)
   - Stores OTP with 2-minute expiry in memory
   - **Sends OTP via email** (styled HTML)
   - Returns success response with txnId

4. **User receives email** with OTP code
5. **User enters OTP** in the verification screen
6. **OTP verified** and enquiry submitted

## OTP Email Template

Users will receive a professional email with:
- Header: "🔐 Your OTP Code"
- Large, easy-to-read 6-digit code
- Message: "This OTP will expire in 2 minutes"
- Security notice: "Don't share this code with anyone"

## Temporary Changes (Until FAST2SMS Verification)

- SMS via FAST2SMS is **disabled** but code remains in place
- Email is now the primary OTP delivery method
- Once FAST2SMS verification is complete, you can switch back to SMS or use both

## Testing

### Test OTP Email Delivery

1. **Restart backend:**
   ```bash
   npm run dev
   ```

2. **Fill enquiry form:**
   - Enter valid email (required)
   - Enter valid mobile (10 digits, still required for record)
   - Fill other details

3. **Click "Send OTP"**

4. **Check email inbox** for OTP email

5. **Enter OTP** and complete enquiry

### Expected Backend Logs

```
📧 OTP Request - Mobile: 9876543210, Email: user@example.com, TxnId: TXN..., Email Sent: true
```

## When FAST2SMS is Ready

To switch back to SMS:

1. Complete FAST2SMS website verification
2. Uncomment SMS code in `requestOtp()` 
3. Comment out email code
4. Or send OTP via both SMS and email for redundancy

## What Still Works

✅ OTP generation and storage  
✅ OTP verification (code matching)  
✅ OTP expiry (2 minutes)  
✅ Resend OTP  
✅ Enquiry submission  
✅ Email notifications to admin  
❌ SMS delivery (temporarily disabled)

## Backend Environment Variables Required

Make sure your `.env` has these for email:
```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@compareauto.com
NOTIFY_EMAIL_TO=admin@compareauto.com
```

---

**Status:** ✅ Email OTP delivery is now active!  
**Mobile SMS:** ⏸️ Temporarily disabled (awaiting FAST2SMS verification)
