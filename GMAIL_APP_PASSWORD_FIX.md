# 🔧 Fix Gmail OTP Email Issue

## The Problem

```
Error: Invalid login: 534-5.7.9 Application-specific password required
```

Google Gmail requires an **App Password** instead of your regular password for third-party apps like Nodemailer.

## Solution: Generate Gmail App Password

### Step 1: Enable 2-Factor Authentication (if not already done)

1. Go to: https://myaccount.google.com/
2. Click "Security" in left menu
3. Look for "2-Step Verification"
4. If not enabled, follow Google's setup

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   (Requires 2FA to be enabled first)

2. Select:
   - **Select app:** Choose "Mail"
   - **Select device:** Choose "Windows Computer" (or your OS)

3. Click **Generate**

4. Google will show you a **16-character password**
   ```
   Example: uxab cdef ghij klmn
   (It includes spaces - remove them)
   ```

5. **Copy the full password** (without spaces)

### Step 3: Update .env File

Replace your current `SMTP_PASS` with the new App Password:

**Current (wrong):**
```env
SMTP_PASS=uxfrulvqnmdflxmf
```

**New (correct):**
```env
SMTP_PASS=your_16_char_app_password_without_spaces
```

### Step 4: Restart Backend

```bash
cd backend
npm run dev
```

## Complete Gmail SMTP Configuration

Your `.env` should look like:

```env
# Gmail SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=compareauto5@gmail.com
SMTP_PASS=your_app_password_here    ← 16-char password from Google
SMTP_FROM=noreply@compareauto.com
NOTIFY_EMAIL_TO=admin@compareauto.com
```

## Why This Happens?

Google blocks password-based login for security. They require:
- 2-Factor Authentication enabled
- App-specific passwords for third-party apps
- Or use OAuth2 (more complex)

## Test Email Delivery

After updating `.env`:

1. **Restart backend:**
   ```bash
   npm run dev
   ```

2. **Test in your app:**
   - Fill enquiry form with your email
   - Click "Send OTP"
   - Check inbox for OTP email

3. **Check backend logs:**
   ```
   ✅ Success! (Should see log message)
   ```

## Common Issues

| Issue | Solution |
|-------|----------|
| Still getting error 534 | Verify app password is correct (no spaces) |
| Password not working | Generate a new app password in Google Account |
| Can't see apppasswords link | Enable 2FA first in Security settings |
| Spaces in password | Remove all spaces when copying |

## Alternative: Allow Less Secure Apps

⚠️ **NOT RECOMMENDED** (security risk), but if you must:

1. Go to: https://myaccount.google.com/u/0/lesssecureapps
2. Toggle "Allow less secure app access" ON
3. Use your regular Gmail password

**Better approach:** Use App Password instead!

## Troubleshooting

If email still fails after updating:

1. **Check logs** - Look for the exact error message
2. **Verify credentials** - Copy-paste from Google (no typos)
3. **Test SMTP** - Try sending test email:
   ```bash
   npm run dev
   # Make API call to /api/enquiries/otp/request
   ```

## Need Help?

1. Google SMTP Setup: https://support.google.com/mail/answer/185833
2. App Password Help: https://support.google.com/accounts/answer/185833
3. Nodemailer Gmail: https://nodemailer.com/smtp/gmail/

---

**Quick Action:** Generate app password, update SMTP_PASS, restart backend! 🚀
