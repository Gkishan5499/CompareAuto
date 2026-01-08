# FAST2SMS Troubleshooting Guide

## Issue: "Failed to send SMS" - SMS Sending Returns False

If you're seeing this error:
```
Failed to send SMS to 9336822260, but OTP stored in system. Code: 216892
📌 OTP Request - Mobile: 9336822260, TxnId: TXN17676938979550gn81, SMS Sent: false
```

### Debug Steps

#### Step 1: Test FAST2SMS API Key
Run the debug script to verify your API key works:

```bash
cd backend
npx ts-node src/scripts/test-fast2sms.ts
```

This will show you exactly what FAST2SMS is responding with.

#### Step 2: Check API Key Format
Your FAST2SMS API key should:
- Be copied exactly from the FAST2SMS dashboard
- Typically be 40+ characters long
- Be in `.env` file as: `FAST2SMS_API_KEY=your_exact_key`

**To get your API key:**
1. Login to https://www.fast2sms.com/
2. Go to Dashboard → API Settings → API Authorization Key
3. Copy the entire key (use Copy button if available)
4. Paste into `.env` exactly as shown

#### Step 3: Verify .env File
Make sure your `.env` file has:
```env
FAST2SMS_API_KEY=your_api_key_from_dashboard
```

After adding/changing, **restart the backend server**:
```bash
npm run dev
# or
npm start
```

#### Step 4: Check Account Status
Common reasons for failure:

| Error Code | Cause | Solution |
|-----------|-------|----------|
| **401** | Invalid API Key | Copy key again from dashboard |
| **400** | Invalid mobile/parameters | Check mobile is 10 digits |
| **403** | Account disabled | Check FAST2SMS account status |
| **Rate Limited** | Too many requests | Wait before retrying |
| **No Balance** | Insufficient SMS credits | Add balance to FAST2SMS account |

#### Step 5: Check Mobile Number
The mobile number must be:
- Exactly 10 digits
- Valid Indian format
- Not already opted out

Test with your own mobile number first.

### Common Fixes

#### Fix 1: API Key Not Loaded
```bash
# Check if environment variable is loaded
node -e "console.log(process.env.FAST2SMS_API_KEY)"
```

Should print your API key. If empty or undefined, the key wasn't loaded.

**Solution:**
- Verify `.env` file exists in `/backend` directory
- Check spelling: `FAST2SMS_API_KEY` (exact case)
- Restart server after adding to `.env`

#### Fix 2: Wrong API Key Format
Copy directly from FAST2SMS:
1. Dashboard → API Settings
2. Click the "Copy" button next to API Authorization Key
3. Paste into `.env`

❌ **Don't do this:**
- Copy from email
- Manually type the key
- Use a truncated version
- Add extra spaces

✅ **Do this:**
- Copy from FAST2SMS dashboard
- Paste exactly as provided

#### Fix 3: Mobile Number Invalid
Ensure mobile is 10 digits without country code:

```
❌ Wrong:
+919876543210  (has +91)
019876543210   (11 digits)
9876543210a    (has letter)

✅ Correct:
9876543210     (exactly 10 digits)
```

#### Fix 4: Account Issues
Check FAST2SMS dashboard:
1. Account Status → Should be "Active"
2. Balance → Should have SMS credits > 0
3. API Status → Should be "Enabled"

If not, contact FAST2SMS support or add balance.

### Detailed Error Responses

Check server logs for these responses:

```
❌ "FAST2SMS returned false. Error: ..."
```
This means the API key is likely invalid or account has no balance.

```
📨 FAST2SMS Response: {
  "return": false,
  "request_id": null,
  "message": "...",
  "error": "..."
}
```
The `message` or `error` field will tell you exactly what's wrong.

### Test Endpoint

If you need to see detailed error messages:

1. Look at backend console logs when you make an OTP request
2. The logs will show full FAST2SMS response with error details
3. Use those details to fix the issue

### Still Stuck?

1. **Run debug script:**
   ```bash
   npx ts-node backend/src/scripts/test-fast2sms.ts
   ```

2. **Share the output** with the error message

3. **Check FAST2SMS support:** https://www.fast2sms.com/support

4. **Verify credentials:**
   - API key is active in dashboard
   - Account has SMS balance
   - Mobile number is valid
   - Internet connection is stable

### Logs to Check

When troubleshooting, enable verbose logging:

```typescript
// In fast2sms.service.ts sendOtp method:
console.log(`📱 Sending OTP to ${mobile} via FAST2SMS...`);
console.log(`📨 FAST2SMS Response:`, response.data);
console.log(`❌ Error sending OTP:`, error.response?.data);
```

All of these are already in the code and will print detailed info.

### Fallback Behavior

**Good news:** Even if SMS fails, the system still:
- Generates the OTP code
- Stores it in memory
- Returns txnId for verification
- You can still verify manually

So you can test the flow without SMS working, by using the OTP code from logs.

---

## Quick Checklist

- [ ] `.env` file has `FAST2SMS_API_KEY=...`
- [ ] API key copied from FAST2SMS dashboard
- [ ] Backend server restarted after adding key
- [ ] Test mobile number is 10 digits
- [ ] FAST2SMS account is active
- [ ] FAST2SMS account has SMS balance
- [ ] Internet connection is stable
- [ ] Ran debug script to verify API connection

If all checked, your SMS should work! ✅
