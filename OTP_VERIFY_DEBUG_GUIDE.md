# 🔍 OTP Verify 400 Error - Debugging Guide

## What I Fixed

I've enhanced the OTP verification with:
1. **Better validation** - Checks if txnId and code are present
2. **Detailed logging** - Shows exactly what's stored and what's being compared
3. **String comparison** - Converts both codes to strings to avoid type mismatches
4. **Error messages** - Clear error messages for each failure case

## How to Debug

### Step 1: Restart Backend
```bash
npm run dev
```

### Step 2: Check Console Logs

When you request OTP, you'll see:
```
📧 OTP Generated - Mobile: 9876543210, Email: user@example.com, Code: 123456, TxnId: TXN1704553200xyz
📧 Email sent status: ✅ Success
```

### Step 3: Try OTP Verification

When verifying OTP:

**If successful:**
```
✅ OTP verified successfully for txnId: TXN1704553200xyz
```

**If it fails, you'll see one of:**
```
❌ Missing txnId or code - (txnId and code are required)
❌ Invalid transaction ID: TXN... - (txnId doesn't exist or expired)
❌ OTP expired for txnId: TXN... - (2 minutes have passed)
❌ Invalid OTP code { provided: '123456', stored: '654321' } - (Wrong code)
```

## Common Issues & Solutions

### Issue 1: "Invalid transaction"
**Cause:** txnId not found in memory  
**Solution:**
- Make sure you're copying the correct txnId from OTP request response
- Don't refresh the page (OTP store is in-memory)

### Issue 2: "OTP expired"
**Cause:** More than 2 minutes have passed  
**Solution:**
- Resend OTP (click "Resend OTP" button)
- It's a security feature - OTPs expire after 2 minutes

### Issue 3: "Invalid OTP"
**Cause:** Wrong code entered  
**Solution:**
- Check the code in your email
- Make sure you're entering all 6 digits
- Copy-paste from email if possible

### Issue 4: 400 Error on verify (missing txnId/code)
**Cause:** Frontend not sending txnId or code properly  
**Solution:**
- Check network tab in browser DevTools
- Verify JSON being sent has `txnId` and `code` fields
- Both should be strings

## Test Steps

1. **Fill form with:**
   - Name: Test User
   - Email: your-email@gmail.com (or any valid email)
   - Mobile: 9876543210
   - Other required fields

2. **Click "Send OTP"**
   - Check backend console for OTP code
   - Check email inbox for OTP email

3. **Open browser DevTools** (F12)
   - Go to Network tab
   - Click "Verify OTP" after entering code
   - Click the `/enquiries/otp/verify` request
   - Check Request body - should show:
     ```json
     {
       "txnId": "TXN1704...",
       "code": "123456"
     }
     ```

4. **Check Response**
   - Should be `{ "success": true }`
   - If error, check backend console logs

## Debugging Tools

### Browser DevTools Network Tab

1. Press F12
2. Go to Network tab
3. Fill form and click "Send OTP"
4. Look for `/enquiries/otp/request` request
5. Click it and check:
   - **Request body** - Should show mobile and email
   - **Response** - Should show txnId

6. Click "Verify OTP"
7. Look for `/enquiries/otp/verify` request
8. Check:
   - **Request body** - Should show txnId and code
   - **Response** - Should show success: true

### Backend Console Logs

When backend runs:
```bash
npm run dev
```

You'll see logs like:
```
📧 OTP Generated - Mobile: ..., Code: ..., TxnId: ...
📧 Email sent status: ✅ Success
✅ OTP verified successfully for txnId: ...
```

Or errors:
```
❌ Invalid OTP code { provided: '123456', stored: '654321' }
❌ OTP expired for txnId: ...
```

## Still Having Issues?

Check these in order:

1. ✅ Backend is running (`npm run dev`)
2. ✅ Email setup is correct (Gmail App Password)
3. ✅ You're using correct txnId from response
4. ✅ OTP code from email matches what you're entering
5. ✅ Less than 2 minutes have passed
6. ✅ All 6 digits of OTP are entered

## Next: Successful Flow

Once OTP verifies successfully:
1. ✅ System confirms "OTP verified"
2. ✅ Frontend submits enquiry with all data
3. ✅ Backend creates enquiry record
4. ✅ Admin receives notification email
5. ✅ User sees success message

---

**Run backend and check logs - they'll show exactly what's happening!** 🔍
