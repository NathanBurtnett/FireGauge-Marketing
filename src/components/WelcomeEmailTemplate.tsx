import React from 'react';

interface WelcomeEmailTemplateProps {
  userName?: string;
  departmentName?: string;
  redirectUrl?: string;
}

// HTML template for better email styling
export const getWelcomeEmailHTML = (props: WelcomeEmailTemplateProps) => {
  const { 
    userName = 'Fire Chief', 
    departmentName = 'Your Department', 
    redirectUrl = 'https://firegauge-marketing.onrender.com/onboarding' 
  } = props;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FireGauge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">
                🔥 FIREGAUGE
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">
                Professional Fire Equipment Testing
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #dc2626; font-size: 24px; margin-bottom: 20px; text-align: center;">
                Welcome to FireGauge, ${userName}!
              </h2>

              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; color: #374151;">
                Thank you for choosing FireGauge for <strong>${departmentName}</strong>. 
                We're excited to help you streamline your fire equipment testing process and ensure 
                compliance with NFPA standards.
              </p>

              <!-- Benefits Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="color: #dc2626; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #dc2626; padding-bottom: 8px;">
                      🚀 What You'll Accomplish:
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #374151;">
                      <li style="margin-bottom: 10px; font-size: 15px;">
                        <strong>Stay Compliant:</strong> Automated NFPA 1962 compliance tracking
                      </li>
                      <li style="margin-bottom: 10px; font-size: 15px;">
                        <strong>Save Time:</strong> Digital test records and instant reports
                      </li>
                      <li style="margin-bottom: 10px; font-size: 15px;">
                        <strong>Reduce Risk:</strong> Never miss critical inspection dates
                      </li>
                      <li style="margin-bottom: 10px; font-size: 15px;">
                        <strong>Professional Reports:</strong> Generate compliant documentation instantly
                      </li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Call to Action -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${redirectUrl}" style="background-color: #dc2626; color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);">
                      Complete Your Setup →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #fef3f2; border: 1px solid #fecaca; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h4 style="color: #dc2626; font-size: 16px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Your Next Steps:
                    </h4>
                    <ol style="margin: 0; padding-left: 20px; color: #374151;">
                      <li style="margin-bottom: 8px; font-size: 14px;">Complete your department profile</li>
                      <li style="margin-bottom: 8px; font-size: 14px;">Set up your hose inventory</li>
                      <li style="margin-bottom: 8px; font-size: 14px;">Configure testing schedules</li>
                      <li style="margin-bottom: 8px; font-size: 14px;">Generate your first compliance report</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- Support Section -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; padding-top: 25px;">
                <tr>
                  <td align="center">
                    <p style="font-size: 16px; color: #6b7280; margin-bottom: 15px;">
                      Need help? Our support team is ready to assist you.
                    </p>
                    <p style="font-size: 14px; margin: 0;">
                      📧 <a href="mailto:support@firegauge.app" style="color: #dc2626; text-decoration: none;">support@firegauge.app</a> | 
                      📞 <a href="tel:+15551234567" style="color: #dc2626; text-decoration: none;">+1 (555) 123-4567</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                <strong>FireGauge LLC</strong> | Professional Fire Department Solutions<br/>
                <a href="https://firegauge-marketing.onrender.com" style="color: #dc2626; text-decoration: none;">
                  firegauge-marketing.onrender.com
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export default getWelcomeEmailHTML; 