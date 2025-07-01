# Customer Dashboard Implementation Guide

**Note:** The customer dashboard has been removed from the marketing site. Account management now occurs within the main FireGauge application. The information below is retained for historical reference.

## Overview

The FireGauge Customer Dashboard provided a comprehensive post-purchase account management interface for fire departments. It integrated subscription management, usage analytics, billing portal access, and support resources in a unified, user-friendly interface.

## Features Implemented

### ✅ Account Overview
- **Contact Information Display**: Customer name, email, phone
- **Department Information**: Department name, type, member since date
- **Visual Design**: Clean, professional layout with icons and proper spacing

### ✅ Subscription Management
- **Plan Details**: Current plan name, status, billing amount and cycle
- **Billing Information**: Current period dates, next billing date
- **Status Badges**: Color-coded status indicators (Active, Trialing, Past Due, Canceled)
- **Stripe Billing Portal Integration**: Direct access to manage payment methods and billing

### ✅ Usage Analytics
- **Equipment Tracking**: Current vs. limit with progress bars
- **Storage Usage**: GB used vs. available with visual indicators
- **Activity Metrics**: Tests completed this month, active users count
- **Visual Progress Bars**: Easy-to-understand usage visualization

### ✅ Quick Actions
- **FireGauge App Access**: Direct link to main application
- **Report Downloads**: Quick access to compliance reports
- **Notification Settings**: Manage alerts and communications

### ✅ Support Resources
- **Email Support**: Direct mailto link to support team
- **Knowledge Base**: Link to searchable documentation
- **Sales Contact**: Upgrade and consultation options
- **Account Status**: Compliance, backup, and security indicators

## Technical Implementation

### Component Architecture
```
CustomerDashboard.tsx
├── Account Overview Section
├── Subscription Details Section
├── Usage Analytics Section
└── Sidebar
    ├── Quick Actions Card
    ├── Support Resources Card
    └── Account Status Card
```

### Data Interfaces
```typescript
interface SubscriptionData {
  id: string;
  planName: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  amount: number;
  currency: string;
  billing_cycle: 'month' | 'year';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  customer_id: string;
}

interface UsageData {
  equipmentTracked: number;
  equipmentLimit: number;
  testsCompleted: number;
  usersActive: number;
  storageUsed: number; // in MB
  storageLimit: number; // in MB
}

interface CustomerInfo {
  id: string;
  email: string;
  name: string;
  department_name: string;
  department_type: string;
  phone?: string;
  created_at: string;
}
```

### API Integration
The dashboard integrates with several API endpoints:

#### Billing Portal Integration
```typescript
// Create Stripe billing portal session
POST /api/create-billing-portal-session
{
  "customer_id": "cust_123",
  "return_url": "https://app.firegauge.app"
}

// Response
{
  "url": "https://billing.stripe.com/p/session/...",
  "session_id": "bps_..."
}
```

#### Customer Data
```typescript
// Get customer information
GET /api/customers/{customer_id}
Authorization: Bearer {auth_token}

// Update customer information
PATCH /api/customers/{customer_id}
{
  "phone": "(555) 123-4567",
  "department_name": "Updated Department Name"
}
```

## Stripe Billing Portal Setup

### Prerequisites
1. **Stripe Account**: Active Stripe account with billing portal enabled
2. **Customer Portal Configuration**: Set up return URLs and allowed features
3. **Backend Integration**: Server-side endpoint to create portal sessions

### Backend Implementation (Node.js/Express Example)
```javascript
app.post('/api/create-billing-portal-session', async (req, res) => {
  const { customer_id, return_url } = req.body;
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: return_url || 'https://app.firegauge.app',
    });
    
    res.json({ url: session.url, session_id: session.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Security Considerations
- **Authentication**: Verify user owns the customer_id before creating sessions
- **Return URL Validation**: Only allow whitelisted return URLs
- **Rate Limiting**: Implement rate limits to prevent abuse
- **Logging**: Log all billing portal access for audit trails

## Usage Analytics Integration

### Data Sources
The dashboard expects usage data from your backend systems:

```typescript
// Example API response for usage data
GET /api/usage/{customer_id}
{
  "equipmentTracked": 147,
  "equipmentLimit": 500,
  "testsCompleted": 89,
  "usersActive": 12,
  "storageUsed": 2150, // MB
  "storageLimit": 10240 // MB
}
```

### Real-time Updates
Consider implementing WebSocket connections or periodic polling for real-time usage updates:

```typescript
// WebSocket example
const ws = new WebSocket('wss://api.firegauge.app/usage-updates');
ws.onmessage = (event) => {
  const usageUpdate = JSON.parse(event.data);
  setUsageData(usageUpdate);
};
```

## Routing and Navigation

### Route Configuration
The dashboard was previously accessible at `/dashboard` within the marketing site. This route has been removed and the functionality now lives in the main FireGauge application.

### Authentication Flow (Legacy)
1. **Post-Purchase Redirect**: Users were redirected to `/onboarding` after payment.
2. **Onboarding Completion**: The wizard redirected to `/dashboard` after setup.
3. **Direct Access**: Authenticated users could access `/dashboard` directly.
4. **Authentication Check**: Auth guards ensured only authenticated users accessed the dashboard.

## Responsive Design

### Breakpoints
- **Desktop**: Full 3-column layout with sidebar
- **Tablet**: 2-column layout with stacked sidebar
- **Mobile**: Single column with card stacking

### Key Responsive Features
```css
/* Grid layout adjusts based on screen size */
grid-cols-1 lg:grid-cols-3

/* Cards stack on smaller screens */
md:grid-cols-2

/* Text and spacing optimize for mobile */
text-sm md:text-base
```

## Testing Checklist

### Functionality Testing
- [ ] Account information displays correctly
- [ ] Subscription details show accurate data
- [ ] Usage progress bars calculate percentages correctly
- [ ] Billing portal opens in new tab
- [ ] Quick action buttons navigate correctly
- [ ] Support links function properly

### Integration Testing
- [ ] API calls return expected data structures
- [ ] Error handling works for failed API calls
- [ ] Loading states display appropriately
- [ ] Toast notifications appear for user actions

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Accessibility Testing
- [ ] Screen reader compatibility
- [ ] Keyboard navigation support
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators are visible
- [ ] Alt text for all icons and images

## Deployment Considerations

### Environment Variables
```env
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
API_BASE_URL=https://api.firegauge.app
```

### Performance Optimization
- **Code Splitting**: Lazy load dashboard component if not immediately needed
- **Image Optimization**: Compress and optimize any dashboard images
- **Bundle Analysis**: Monitor bundle size impact of added dependencies

### Monitoring
- **Error Tracking**: Implement error tracking for API failures
- **Performance Monitoring**: Track page load times and user interactions
- **Usage Analytics**: Monitor which dashboard features are used most

## Future Enhancements

### Planned Features
- **Real-time Notifications**: In-app alerts for important updates
- **Advanced Analytics**: Detailed charts and trends
- **Team Management**: Add/remove department users
- **Custom Branding**: Department-specific theming options
- **Mobile App Integration**: Deep linking to mobile app features

### Technical Improvements
- **Caching Strategy**: Implement efficient data caching
- **Offline Support**: Basic functionality when offline
- **Progressive Web App**: PWA features for mobile-like experience
- **Dark Mode**: Theme toggle for user preference

## Support and Maintenance

### Documentation Updates
Keep this documentation updated when:
- New features are added to the dashboard
- API endpoints change
- User interface updates are made
- Integration requirements evolve

### User Feedback Integration
- Monitor support tickets for dashboard-related issues
- Collect user feedback through in-app surveys
- Track usage patterns to identify improvement opportunities
- Regular user testing sessions for UX validation

---

## Quick Start Guide for Developers

1. **Install Dependencies**: Ensure all required packages are installed
2. **Configure Environment**: Set up API endpoints and authentication
3. **Test Billing Integration**: Verify Stripe billing portal works in test mode
4. **Customize Styling**: Adjust theme and branding as needed
5. **Deploy and Monitor**: Deploy to production and monitor for issues

The Customer Dashboard is now ready for production use and provides a comprehensive post-purchase experience for FireGauge customers. 