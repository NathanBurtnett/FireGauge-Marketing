# 🎨 FireGauge Supabase Email Templates

## Overview
Supabase allows you to customize authentication emails with your own branding. Here are the custom templates for FireGauge.

## 📧 Magic Link Email Template

### Template Configuration
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/juznipgitbmtfmoszzek)
2. Navigate to **Authentication** → **Email Templates**
3. Select **Magic Link** template
4. Replace the default template with the FireGauge branded version below:

### HTML Template Code:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your FireGauge Sign-In</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #374151;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .tagline {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 30px;
      line-height: 1.7;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      transition: all 0.3s ease;
      margin: 20px 0;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
    }
    .onboarding-steps {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .onboarding-steps h4 {
      margin: 0 0 12px 0;
      color: #1e40af;
      font-size: 16px;
      font-weight: 600;
    }
    .onboarding-steps ol {
      margin: 0;
      padding-left: 20px;
      color: #1e3a8a;
    }
    .onboarding-steps li {
      margin-bottom: 8px;
      font-size: 14px;
    }
    .security-note {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .security-note h4 {
      margin: 0 0 8px 0;
      color: #92400e;
      font-size: 14px;
      font-weight: 600;
    }
    .security-note p {
      margin: 0;
      font-size: 14px;
      color: #78350f;
    }
    .footer {
      background-color: #1f2937;
      color: #d1d5db;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer-brand {
      font-weight: 600;
      color: #dc2626;
      margin-bottom: 10px;
    }
    .footer-compliance {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 15px;
      font-style: italic;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      color: #dc2626;
      text-decoration: none;
      margin: 0 10px;
      font-weight: 500;
    }
    @media (max-width: 600px) {
      .container {
        margin: 0;
        border-radius: 0;
      }
      .header, .content, .footer {
        padding: 30px 20px;
      }
      .greeting {
        font-size: 20px;
      }
      .cta-button {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🔥 FireGauge</div>
      <p class="tagline">Professional Fire Equipment Management</p>
    </div>

    <!-- Content -->
    <div class="content">
      <h1 class="greeting">Complete Your Sign-In</h1>
      
      <p class="message">
        You're just one click away from accessing your FireGauge account! Click the secure button below to continue your onboarding or sign in to your dashboard.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="cta-button">
          🚀 Complete Sign-In & Continue Setup
        </a>
      </div>

      <!-- Onboarding Steps -->
      <div class="onboarding-steps">
        <h4>📋 What happens next:</h4>
        <ol>
          <li><strong>Click the button above</strong> - You'll be securely signed in</li>
          <li><strong>Complete your department info</strong> - Tell us about your fire department</li>
          <li><strong>Choose your plan & billing</strong> - Select subscription or invoice options</li>
          <li><strong>Finish setup</strong> - Configure preferences and create user accounts</li>
          <li><strong>Start managing equipment</strong> - Access your FireGauge dashboard</li>
        </ol>
      </div>

      <!-- Security Note -->
      <div class="security-note">
        <h4>🔒 Security Notice</h4>
        <p>This secure link expires in 1 hour and can only be used once. If you didn't request this sign-in, please ignore this email and your account will remain secure.</p>
      </div>

      <p class="message">
        <strong>Keep the onboarding page open</strong> while you check this email - you'll be redirected back to continue your setup seamlessly.
      </p>

      <p class="message">
        Need help? Contact our support team at <a href="mailto:support@firegauge.app" style="color: #dc2626;">support@firegauge.app</a> - we're here to help with your fire equipment management system.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">FireGauge - Professional Fire Equipment Management</div>
      <p>Ensuring NFPA compliance and operational readiness for fire departments nationwide.</p>
      
      <div class="social-links">
        <a href="https://firegauge.app/about">About Us</a> |
        <a href="https://firegauge.app/contact">Support</a> |
        <a href="https://firegauge.app/legal">Privacy Policy</a>
      </div>
      
      <p class="footer-compliance">
        NFPA 1851, 1852, 1855 Compliant • Professional Fire Equipment Management Solutions
      </p>
      
      <p style="font-size: 11px; color: #6b7280; margin-top: 15px;">
        This email was sent to help you access your FireGauge account. If you have questions, reply to this email or visit our support center.
      </p>
    </div>
  </div>
</body>
</html>
```

## 📧 Password Recovery Email Template

### Template Configuration
1. In the same **Email Templates** section
2. Select **Reset Password** template
3. Use this branded template:

### HTML Template Code:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your FireGauge Password</title>
  <style>
    /* Same styles as above */
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #374151;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .tagline {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 30px;
      line-height: 1.7;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      transition: all 0.3s ease;
      margin: 20px 0;
    }
    .security-note {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .security-note h4 {
      margin: 0 0 8px 0;
      color: #92400e;
      font-size: 14px;
      font-weight: 600;
    }
    .security-note p {
      margin: 0;
      font-size: 14px;
      color: #78350f;
    }
    .footer {
      background-color: #1f2937;
      color: #d1d5db;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer-brand {
      font-weight: 600;
      color: #dc2626;
      margin-bottom: 10px;
    }
    .footer-compliance {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 15px;
      font-style: italic;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      color: #dc2626;
      text-decoration: none;
      margin: 0 10px;
      font-weight: 500;
    }
    @media (max-width: 600px) {
      .container {
        margin: 0;
        border-radius: 0;
      }
      .header, .content, .footer {
        padding: 30px 20px;
      }
      .greeting {
        font-size: 20px;
      }
      .cta-button {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🔥 FireGauge</div>
      <p class="tagline">Professional Fire Equipment Management</p>
    </div>

    <!-- Content -->
    <div class="content">
      <h1 class="greeting">Password Reset Request</h1>
      
      <p class="message">
        You requested to reset your FireGauge account password. Click the secure link below to create a new password for your account.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="cta-button">
          🔐 Reset My Password
        </a>
      </div>

      <!-- Security Note -->
      <div class="security-note">
        <h4>🔒 Security Notice</h4>
        <p>This password reset link is secure and will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
      </div>

      <p class="message">
        If you continue to have trouble accessing your account, please contact our support team for immediate assistance.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">FireGauge - Professional Fire Equipment Management</div>
      <p>Ensuring NFPA compliance and operational readiness for fire departments nationwide.</p>
      
      <div class="social-links">
        <a href="https://firegauge-marketing.onrender.com/about">About Us</a> |
        <a href="https://firegauge-marketing.onrender.com/contact">Support</a> |
        <a href="https://firegauge-marketing.onrender.com/legal">Privacy Policy</a>
      </div>
      
      <p class="footer-compliance">
        NFPA 1851, 1852, 1855 Compliant • Professional Fire Equipment Management Solutions
      </p>
    </div>
  </div>
</body>
</html>
```

## 🎨 Email Confirmation Template

For email confirmations (when users sign up):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your FireGauge Email</title>
  <!-- Same styles as above -->
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🔥 FireGauge</div>
      <p class="tagline">Professional Fire Equipment Management</p>
    </div>

    <!-- Content -->
    <div class="content">
      <h1 class="greeting">Welcome to FireGauge!</h1>
      
      <p class="message">
        Thank you for joining FireGauge! Please confirm your email address to complete your account setup and start managing your fire equipment with professional-grade tools.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="cta-button">
          ✅ Confirm Email & Get Started
        </a>
      </div>

      <!-- Security Note -->
      <div class="security-note">
        <h4>🔒 Security Notice</h4>
        <p>This confirmation link is secure and will expire in 24 hours. After confirmation, you'll be directed to complete your department setup.</p>
      </div>

      <p class="message">
        Once confirmed, you'll have access to comprehensive fire equipment management tools designed specifically for fire departments and NFPA compliance.
      </p>
    </div>

    <!-- Footer (same as above) -->
  </div>
</body>
</html>
```

## 📋 Implementation Steps

### Step 1: Update Supabase Email Templates
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/juznipgitbmtfmoszzek)
2. Navigate to **Authentication** → **Email Templates**
3. Update each template (Magic Link, Reset Password, Confirm Email)
4. Copy the HTML code above into each respective template
5. Save changes

### Step 2: Test Email Templates
1. Test the magic link flow from your onboarding page
2. Test password reset (if implemented)
3. Test email confirmation for new signups

### Step 3: Optional Customizations
- Update the footer links to match your actual URLs
- Add your company logo URL if you have one hosted
- Adjust colors to match your exact brand palette
- Add additional compliance information if needed

## 🎯 Key Features of These Templates

✅ **Professional FireGauge Branding**
✅ **Mobile-Responsive Design**  
✅ **NFPA Compliance Messaging**
✅ **Security-Focused Messaging**
✅ **Fire Department Appropriate Tone**
✅ **Clear Call-to-Action Buttons**
✅ **Professional Footer with Links**
✅ **Consistent Visual Identity**

The templates will make your authentication emails look professional and on-brand with FireGauge! 🚀 