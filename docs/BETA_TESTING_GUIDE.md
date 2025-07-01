# Beta Testing Guide - Clearing Test Data

## 🧹 **How to Clear Beta Testing Data**

When testing the onboarding flow, you may need to reset your data between test runs. Here's how to clear different types of test data:

### 1. **Clear Browser Storage (Local/Session Storage)**

**Chrome/Edge/Firefox:**
1. Open Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Under **Storage** section, find:
   - **Local Storage** → `your-domain` → Clear all
   - **Session Storage** → `your-domain` → Clear all
   - **Cookies** → `your-domain` → Delete all cookies

**Or use this JavaScript in the console:**
```javascript
// Clear all local storage
localStorage.clear();

// Clear all session storage
sessionStorage.clear();

// Clear specific onboarding keys
localStorage.removeItem('onboarding_completed');
localStorage.removeItem('department_data');
localStorage.removeItem('user_credentials');

// Clear auth tokens
localStorage.removeItem('sb-your-project-id-auth-token');
```

### 2. **Clear Supabase Auth Session**

**Option A: Use Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project
3. Go to **Authentication** → **Users**
4. Delete test user accounts

**Option B: Use JavaScript Console**
```javascript
// Sign out current user
import { supabase } from './src/lib/supabase';
await supabase.auth.signOut();
```

### 3. **Clear Stripe Test Data**

**Stripe Dashboard:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
2. Make sure you're in **Test Mode** (toggle in top-left)
3. Clear test data:
   - **Customers** → Delete test customers
   - **Subscriptions** → Cancel test subscriptions
   - **Invoices** → Delete test invoices

### 4. **Reset Database Records (if applicable)**

If you have test records in your database:

**Supabase SQL Editor:**
```sql
-- Delete test user profiles (be careful!)
DELETE FROM user_profiles WHERE email LIKE '%test%';

-- Delete test subscription records
DELETE FROM subscriptions WHERE customer_email LIKE '%test%';

-- Reset any department data
DELETE FROM departments WHERE name LIKE '%Test%';
```

⚠️ **Warning:** Only run these queries in a test environment!

## 🔄 **Complete Reset Process**

For a complete reset between beta tests:

1. **Clear Browser:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Sign Out:**
   - Click sign out in the app
   - Or clear auth tokens manually

3. **Clear Cookies:**
   - Delete all cookies for your domain

4. **Hard Refresh:**
   - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

5. **Incognito/Private Mode:**
   - Use incognito/private browsing for clean testing

## 🐛 **Common Issues & Solutions**

### **Issue: "User already exists"**
**Solution:** Clear the auth session and delete the user from Supabase dashboard.

### **Issue: "Plan configuration not found"**
**Solution:** 
- Check the URL parameter: should be `?plan=pilot` not `?plan=pilot:125`
- Clear browser cache and try again
- Check console for errors

### **Issue: Stuck on onboarding step**
**Solution:**
```javascript
// Reset onboarding state
localStorage.removeItem('onboarding_step');
localStorage.removeItem('onboarding_data');
```

### **Issue: Stripe checkout not working**
**Solution:**
- Verify you're in Stripe test mode
- Check browser console for errors
- Clear cookies and retry

## 🧪 **Test Data Examples**

**Test Email Addresses:**
- `test.admin@firegauge.test`
- `demo.user@firegauge.test`
- `beta.tester@firegauge.test`

**Test Department Names:**
- `Test Fire Department`
- `Beta Testing Station`
- `Demo Department`

**Test Credit Cards (Stripe Test Mode):**
- `4242424242424242` - Visa (succeeds)
- `4000000000000002` - Visa (declined)
- `4000000000009995` - Visa (insufficient funds)

## 📞 **Support**

If you encounter issues that can't be resolved by clearing data:

1. Check browser console for errors
2. Take screenshots of error messages
3. Note the exact steps to reproduce
4. Contact support with details

## 🔧 **Developer Tools**

**Quick Clear Script:**
```javascript
// Copy and paste this in browser console for quick reset
(function() {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });
  console.log("✅ All browser data cleared!");
  location.reload();
})();
```

Happy testing! 🚀 