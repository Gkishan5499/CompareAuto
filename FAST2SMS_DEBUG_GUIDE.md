# FAST2SMS SMS Sending Issues - Diagnosis & Fix

## Your Error
```
Failed to send SMS to 9336822260, but OTP stored in system. Code: 216892
```

This means:
- ✅ OTP was generated correctly
- ✅ OTP was stored in the system
- ❌ SMS delivery to FAST2SMS failed

## Most Likely Causes (in order of probability)

### 1. **Invalid or Incorrect API Key** (80% of cases)
The API key you added might be:
- Incomplete (missing characters)
- From wrong place in FAST2SMS
- Not loaded because server wasn't restarted
- Still the placeholder value

**Fix:**
```bash
# Step 1: Get fresh API key from FAST2SMS
# https://www.fast2sms.com/
# Dashboard → API Settings → Copy the Authorization Key button

# Step 2: Update .env in backend folder
FAST2SMS_API_KEY=paste_your_exact_key_here

# Step 3: Restart the server
npm run dev
```

### 2. **Server Not Restarted**
.env changes only take effect on server restart.

**Fix:**
```bash
# In backend folder
npm run dev    # This restarts the server
```

### 3. **Account Issues**
- No SMS balance/credits
- Account suspended
- API not enabled

**Fix:**
- Login to FAST2SMS dashboard
- Check: Balance, Account Status, API Settings
- Add balance if needed

### 4. **Network/Connection Issues**
- Your server can't reach FAST2SMS
- FAST2SMS service temporarily down
- Firewall blocking the request

**Fix:**
- Check internet connection
- Try the debug script (it will tell you)
- Check FAST2SMS status page

## Step-by-Step Diagnosis

### Step 1: Run the Debug Script

This is the fastest way to know what's wrong:

```bash
cd backend
npx ts-node src/scripts/test-fast2sms.ts
```

**What to look for in the output:**

✅ **Good output:**
```
✅ API Response Status: 200
✅ SUCCESS! SMS can be sent.
📊 Request ID: 12345...
```

❌ **Error output:**
```
❌ ERROR sending request:
Status: 401    ← Invalid API key
```

Common status codes:
- **200** = Success ✅
- **401** = Invalid API key ❌
- **400** = Bad request (mobile format, etc) ❌
- **403** = Account disabled ❌

### Step 2: Verify .env File

Check your backend `.env` file:

```bash
# View the file (Linux/Mac)
cat backend/.env | grep FAST2SMS

# Or open in editor and look for FAST2SMS_API_KEY line
```

It should look like:
```env
FAST2SMS_API_KEY=c0e2a123c456d789e0f1a2b3c4d5e6f7
```

NOT like:
```env
FAST2SMS_API_KEY=
FAST2SMS_API_KEY=your_api_key_here
FAST2SMS_API_KEY=xxxxx
```

### Step 3: Get Fresh API Key

If you're not sure about your key:

1. Go to https://www.fast2sms.com/
2. Login with your credentials
3. Click Dashboard
4. Click API Settings (usually left sidebar)
5. Find "API Authorization Key"
6. Click the **Copy button** (don't manually select/copy)
7. Paste directly into `.env`
8. Restart server

## Testing SMS Manually

After getting the debug script to work:

### Make an OTP request:
```bash
curl -X POST http://localhost:5000/api/enquiries/request-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'
```

Check the response:
```json
{
  "success": true,
  "txnId": "TXN1704553200123",
  "ttl": 120,
  "message": "OTP sent to your mobile"
}
```

If you see this, SMS was sent! ✅

## Server Logs to Check

After making an OTP request, check your backend console for:

```
📱 Sending OTP to 9876543210 via FAST2SMS...
📨 FAST2SMS Response: {
  "return": true,
  "request_id": "12345..."
}
✅ OTP sent successfully
```

If you see:
```
❌ FAST2SMS returned false
📝 Error: Insufficient Balance
```

Your account needs SMS credits.

## Quick Checklist

Before debugging, verify:

- [ ] API key copied from FAST2SMS dashboard (not from email/document)
- [ ] `.env` file updated with the key
- [ ] Backend server restarted (`npm run dev`)
- [ ] Mobile number is 10 digits (e.g., 9876543210)
- [ ] FAST2SMS account active and has balance
- [ ] Internet connection is working

## If Debug Script Works But SMS Still Fails

If the test script shows success but OTP request fails:

1. **Server might need restart:**
   ```bash
   npm run dev
   ```

2. **There might be a code issue:**
   - Check backend logs for error messages
   - The error response will show the problem

3. **Environment variable might not be loaded:**
   ```bash
   # Check if the key is actually loaded
   node -e "console.log(process.env.FAST2SMS_API_KEY)"
   ```

## Can't Get Test Script to Run?

If you get errors running the test script:

```bash
# Make sure you're in backend folder
cd backend

# Install ts-node if needed
npm install --save-dev ts-node

# Run the test
npx ts-node src/scripts/test-fast2sms.ts
```

## Fallback Working Without SMS

**Important:** Even if SMS fails, the system still works:
- OTP is generated
- OTP is stored
- You can verify manually using the code from logs
- This is useful for testing

To see the generated code:
```
Check backend console when requestOtp is called:
[OTP] Mobile: 9876543210, Code: 123456, TxnId: TXN...
```

## Support Resources

- **FAST2SMS Docs:** https://www.fast2sms.com/dev/api
- **FAST2SMS Support:** https://www.fast2sms.com/support
- **Check API Status:** https://www.fast2sms.com/

## Next Steps

1. **Run debug script:**
   ```bash
   cd backend && npx ts-node src/scripts/test-fast2sms.ts
   ```

2. **Share output** if it shows error

3. **Verify API key** from FAST2SMS dashboard

4. **Restart backend** after updating .env

5. **Test OTP** request again

---

**Most likely fix:** Your API key is incorrect or the server hasn't been restarted after adding it to `.env`. Run the debug script to confirm! ✅
