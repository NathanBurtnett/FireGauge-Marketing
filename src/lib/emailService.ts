export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface ContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  departmentName?: string;
  planType?: string;
  signupDate?: string;
  [key: string]: any;
}

export interface EmailSequence {
  id: string;
  name: string;
  trigger: 'signup' | 'onboarding_complete' | 'trial_ending' | 'subscription_active';
  delay: number; // in hours
  templateId: string;
}

class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_SENDGRID_API_KEY || '';
    this.fromEmail = import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@firegauge.com';
    this.fromName = import.meta.env.VITE_SENDGRID_FROM_NAME || 'FireGauge Team';
  }

  // Email Templates for different sequences
  private emailTemplates: Record<string, EmailTemplate> = {
    'welcome-email': {
      id: 'welcome-email',
      name: 'Welcome Email',
      subject: 'Welcome to FireGauge - Your Digital Hose Testing Journey Begins!',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to FireGauge</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://firegauge.com/logo.png" alt="FireGauge" style="max-width: 200px; height: auto;">
          </div>
          
          <h1 style="color: #e11d48; text-align: center;">Welcome to FireGauge, {{firstName}}!</h1>
          
          <p>Thank you for choosing FireGauge for your digital hose testing needs. We're excited to help you streamline your department's hose testing process and ensure compliance with the highest safety standards.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #e11d48; margin-top: 0;">What's Next?</h3>
            <ul style="padding-left: 20px;">
              <li>Complete your department setup in the onboarding wizard</li>
              <li>Configure your testing schedules and parameters</li>
              <li>Start tracking your hose inventory and test results</li>
              <li>Generate compliance reports with just a few clicks</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.firegauge.app/onboarding" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Setup</a>
          </div>
          
          <p>If you have any questions, our support team is here to help. Simply reply to this email or contact us at support@firegauge.com.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="text-align: center; color: #666; font-size: 14px;">
            FireGauge - Professional Digital Hose Testing Solutions<br>
            <a href="https://firegauge.com" style="color: #e11d48;">firegauge.com</a>
          </p>
        </body>
        </html>
      `,
      textContent: `Welcome to FireGauge, {{firstName}}!

Thank you for choosing FireGauge for your digital hose testing needs. We're excited to help you streamline your department's hose testing process and ensure compliance with the highest safety standards.

What's Next?
- Complete your department setup in the onboarding wizard
- Configure your testing schedules and parameters
- Start tracking your hose inventory and test results
- Generate compliance reports with just a few clicks

Complete your setup: https://app.firegauge.app/onboarding

If you have any questions, our support team is here to help. Simply reply to this email or contact us at support@firegauge.com.

FireGauge - Professional Digital Hose Testing Solutions
firegauge.com`
    },
    
    'onboarding-reminder': {
      id: 'onboarding-reminder',
      name: 'Onboarding Reminder',
      subject: 'Complete Your FireGauge Setup - {{departmentName}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://firegauge.com/logo.png" alt="FireGauge" style="max-width: 200px; height: auto;">
          </div>
          
          <h1 style="color: #e11d48;">Hi {{firstName}}, let's finish setting up {{departmentName}}</h1>
          
          <p>We noticed you haven't completed your FireGauge setup yet. It only takes a few minutes to get your department fully configured and ready to start testing.</p>
          
          <div style="background-color: #fef3f2; border-left: 4px solid #e11d48; padding: 20px; margin: 20px 0;">
            <h3 style="color: #e11d48; margin-top: 0;">Why complete your setup?</h3>
            <ul>
              <li><strong>Stay Compliant:</strong> Ensure your hose testing meets NFPA standards</li>
              <li><strong>Save Time:</strong> Automate testing schedules and report generation</li>
              <li><strong>Reduce Risk:</strong> Never miss a critical test date</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.firegauge.app/onboarding" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Setup Now</a>
          </div>
          
          <p>Need help? Schedule a quick call with our team: <a href="https://calendly.com/firegauge" style="color: #e11d48;">Book a Demo</a></p>
        </body>
        </html>
      `,
      textContent: `Hi {{firstName}}, let's finish setting up {{departmentName}}

We noticed you haven't completed your FireGauge setup yet. It only takes a few minutes to get your department fully configured and ready to start testing.

Why complete your setup?
- Stay Compliant: Ensure your hose testing meets NFPA standards
- Save Time: Automate testing schedules and report generation
- Reduce Risk: Never miss a critical test date

Complete your setup: https://app.firegauge.app/onboarding

Need help? Schedule a quick call with our team: https://calendly.com/firegauge`
    },
    
    'getting-started-guide': {
      id: 'getting-started-guide',
      name: 'Getting Started Guide',
      subject: 'Your FireGauge Quick Start Guide - {{planType}} Plan',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://firegauge.com/logo.png" alt="FireGauge" style="max-width: 200px; height: auto;">
          </div>
          
          <h1 style="color: #e11d48;">Welcome to FireGauge {{planType}}, {{firstName}}!</h1>
          
          <p>Congratulations on completing your setup! Here's your quick start guide to make the most of your FireGauge {{planType}} plan.</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">🚀 Quick Wins (First 7 Days)</h3>
            <ol style="padding-left: 20px;">
              <li><strong>Import Your Hose Inventory:</strong> Upload your existing hose data or add them manually</li>
              <li><strong>Set Testing Schedules:</strong> Configure automatic reminders based on NFPA guidelines</li>
              <li><strong>Run Your First Test:</strong> Complete a test and see how easy reporting can be</li>
            </ol>
          </div>
          
          <div style="background-color: #eff6ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">📚 Helpful Resources</h3>
            <ul style="padding-left: 20px;">
              <li><a href="https://firegauge.com/docs/getting-started" style="color: #0369a1;">Getting Started Guide</a></li>
              <li><a href="https://firegauge.com/docs/nfpa-compliance" style="color: #0369a1;">NFPA Compliance Checklist</a></li>
              <li><a href="https://firegauge.com/support" style="color: #0369a1;">Video Tutorials</a></li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.firegauge.app/dashboard" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">Open FireGauge App</a>
            <a href="https://calendly.com/firegauge" style="background-color: #f3f4f6; color: #374151; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; border: 1px solid #d1d5db;">Book Training</a>
          </div>
          
          <p>Questions? Reply to this email or contact us at support@firegauge.com. We're here to help!</p>
        </body>
        </html>
      `,
      textContent: `Welcome to FireGauge {{planType}}, {{firstName}}!

Congratulations on completing your setup! Here's your quick start guide to make the most of your FireGauge {{planType}} plan.

🚀 Quick Wins (First 7 Days)
1. Import Your Hose Inventory: Upload your existing hose data or add them manually
2. Set Testing Schedules: Configure automatic reminders based on NFPA guidelines
3. Run Your First Test: Complete a test and see how easy reporting can be

📚 Helpful Resources
- Getting Started Guide: https://firegauge.com/docs/getting-started
- NFPA Compliance Checklist: https://firegauge.com/docs/nfpa-compliance
- Video Tutorials: https://firegauge.com/support

Open FireGauge App: https://app.firegauge.app/dashboard
Book Training: https://calendly.com/firegauge

Questions? Reply to this email or contact us at support@firegauge.com. We're here to help!`
    },
    
    'feature-spotlight': {
      id: 'feature-spotlight',
      name: 'Feature Spotlight',
      subject: 'FireGauge Feature Spotlight: Automated Compliance Reports',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://firegauge.com/logo.png" alt="FireGauge" style="max-width: 200px; height: auto;">
          </div>
          
          <h1 style="color: #e11d48;">💡 Feature Spotlight: Automated Compliance Reports</h1>
          
          <p>Hi {{firstName}},</p>
          
          <p>Did you know that FireGauge can automatically generate and schedule your compliance reports? This feature can save {{departmentName}} hours of paperwork every month!</p>
          
          <div style="background-color: #fef3f2; border-left: 4px solid #e11d48; padding: 20px; margin: 20px 0;">
            <h3 style="color: #e11d48; margin-top: 0;">🎯 How it helps you:</h3>
            <ul>
              <li><strong>Save 5+ hours per month</strong> on report generation</li>
              <li><strong>Never miss deadlines</strong> with automatic scheduling</li>
              <li><strong>Stay audit-ready</strong> with professional, detailed reports</li>
              <li><strong>Reduce errors</strong> with automated data compilation</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.firegauge.app/reports/setup" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Set Up Auto Reports</a>
          </div>
          
          <p><strong>Pro Tip:</strong> Configure monthly reports to be sent to your fire marshal automatically. It's a great way to maintain open communication and demonstrate proactive compliance!</p>
          
          <p>Questions about setting up automated reports? Reply to this email - we're happy to help!</p>
        </body>
        </html>
      `,
      textContent: `💡 Feature Spotlight: Automated Compliance Reports

Hi {{firstName}},

Did you know that FireGauge can automatically generate and schedule your compliance reports? This feature can save {{departmentName}} hours of paperwork every month!

🎯 How it helps you:
- Save 5+ hours per month on report generation
- Never miss deadlines with automatic scheduling
- Stay audit-ready with professional, detailed reports
- Reduce errors with automated data compilation

Set Up Auto Reports: https://app.firegauge.app/reports/setup

Pro Tip: Configure monthly reports to be sent to your fire marshal automatically. It's a great way to maintain open communication and demonstrate proactive compliance!

Questions about setting up automated reports? Reply to this email - we're happy to help!`
    }
  };

  // Email Sequences Configuration
  private emailSequences: EmailSequence[] = [
    {
      id: 'welcome-sequence',
      name: 'Welcome Sequence',
      trigger: 'signup',
      delay: 0, // Send immediately
      templateId: 'welcome-email'
    },
    {
      id: 'onboarding-reminder-24h',
      name: 'Onboarding Reminder (24h)',
      trigger: 'signup',
      delay: 24,
      templateId: 'onboarding-reminder'
    },
    {
      id: 'getting-started-guide',
      name: 'Getting Started Guide',
      trigger: 'onboarding_complete',
      delay: 2, // 2 hours after onboarding
      templateId: 'getting-started-guide'
    },
    {
      id: 'feature-spotlight-week1',
      name: 'Feature Spotlight (Week 1)',
      trigger: 'onboarding_complete',
      delay: 168, // 1 week after onboarding
      templateId: 'feature-spotlight'
    }
  ];

  // Send individual email
  async sendEmail(to: string, templateId: string, personalData: ContactData): Promise<boolean> {
    if (!this.apiKey) {
      console.error('SendGrid API key not configured');
      return false;
    }

    const template = this.emailTemplates[templateId];
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return false;
    }

    try {
      const personalizedSubject = this.personalizeContent(template.subject, personalData);
      const personalizedHtml = this.personalizeContent(template.htmlContent, personalData);
      const personalizedText = this.personalizeContent(template.textContent, personalData);

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to, name: personalData.firstName || '' }],
            subject: personalizedSubject
          }],
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          content: [
            {
              type: 'text/plain',
              value: personalizedText
            },
            {
              type: 'text/html',
              value: personalizedHtml
            }
          ],
          tracking_settings: {
            click_tracking: { enable: true },
            open_tracking: { enable: true }
          }
        })
      });

      if (response.ok) {
        console.log(`Email sent successfully to ${to} using template ${templateId}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`Failed to send email: ${response.status}`, errorText);
        return false;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Trigger email sequence based on event
  async triggerEmailSequence(trigger: EmailSequence['trigger'], contactData: ContactData): Promise<void> {
    const sequencesToTrigger = this.emailSequences.filter(seq => seq.trigger === trigger);
    
    for (const sequence of sequencesToTrigger) {
      if (sequence.delay === 0) {
        // Send immediately
        await this.sendEmail(contactData.email, sequence.templateId, contactData);
      } else {
        // Schedule for later (in a real implementation, you'd use a job queue)
        this.scheduleEmail(contactData.email, sequence.templateId, contactData, sequence.delay);
      }
    }
  }

  // Schedule email (simplified version - in production, use a proper job queue)
  private scheduleEmail(to: string, templateId: string, personalData: ContactData, delayHours: number): void {
    setTimeout(async () => {
      await this.sendEmail(to, templateId, personalData);
    }, delayHours * 60 * 60 * 1000); // Convert hours to milliseconds
    
    console.log(`Email scheduled: ${templateId} to ${to} in ${delayHours} hours`);
  }

  // Personalize email content with contact data
  private personalizeContent(content: string, data: ContactData): string {
    let personalizedContent = content;
    
    Object.keys(data).forEach(key => {
      const value = data[key] || '';
      personalizedContent = personalizedContent.replace(
        new RegExp(`{{${key}}}`, 'g'),
        String(value)
      );
    });

    // Handle any remaining placeholder that weren't replaced
    personalizedContent = personalizedContent.replace(/{{[^}]+}}/g, '');
    
    return personalizedContent;
  }

  // Add contact to SendGrid marketing lists
  async addContactToList(contactData: ContactData, listIds: string[] = []): Promise<boolean> {
    if (!this.apiKey) {
      console.error('SendGrid API key not configured');
      return false;
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          list_ids: listIds,
          contacts: [{
            email: contactData.email,
            first_name: contactData.firstName || '',
            last_name: contactData.lastName || '',
            custom_fields: {
              department_name: contactData.departmentName || '',
              plan_type: contactData.planType || '',
              signup_date: contactData.signupDate || new Date().toISOString()
            }
          }]
        })
      });

      if (response.ok) {
        console.log(`Contact added to SendGrid: ${contactData.email}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`Failed to add contact: ${response.status}`, errorText);
        return false;
      }
    } catch (error) {
      console.error('Error adding contact to SendGrid:', error);
      return false;
    }
  }

  // Get email templates (for admin interface)
  getTemplates(): Record<string, EmailTemplate> {
    return this.emailTemplates;
  }

  // Get email sequences (for admin interface)
  getSequences(): EmailSequence[] {
    return this.emailSequences;
  }
}

export const emailService = new EmailService();