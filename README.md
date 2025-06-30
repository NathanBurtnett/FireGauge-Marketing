# FireGauge Marketing Site

Professional marketing website for FireGauge equipment management system with integrated Stripe billing and Supabase authentication.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory with:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Stripe Configuration
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # API Configuration
   VITE_API_URL=your_api_url
   
   # Development
   NODE_ENV=development
   ```

3. **Development Server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   # or
   bun run build
   ```

## Features

- 🚀 **Modern Tech Stack**: Vite + React + TypeScript + Tailwind
- 🔐 **Authentication**: Supabase Auth with magic links
- 💳 **Billing**: Stripe integration with subscription and invoice options
- 🎨 **UI Components**: Shadcn/ui component library
- 📱 **Responsive**: Mobile-first design
- ⚡ **Performance**: Optimized bundle with lazy loading
- 🧪 **Testing**: Comprehensive test suite with Vitest

## Architecture

### Pages
- **Homepage** (`/`) - Marketing landing page
- **Pricing** (`/pricing`) - Plan selection and pricing
- **Onboarding** (`/onboarding`) - Complete setup wizard
- **Dashboard** (`/dashboard`) - Customer management portal

### Key Components
- `OnboardingWizard` - 5-step onboarding flow
- `Pricing` - Dynamic pricing with Stripe integration
- `CustomerDashboard` - Post-purchase management
- `AuthProvider` - Authentication state management

### Onboarding Flow
1. **Email Verification** - Magic link authentication
2. **Department Info** - Fire department details
3. **Plan & Billing** - Stripe payment processing
4. **Preferences** - Initial setup configuration
5. **User Accounts** - Admin/operator credential creation
6. **Completion** - Welcome and dashboard access

## Development

### Scripts
- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build
- `test` - Run test suite
- `lint` - Run ESLint

### Environment Variables
All environment variables must be prefixed with `VITE_` to be accessible in the browser.

Required variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `VITE_API_URL` - Main application API URL

### Testing
```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Render.com (Recommended)
Configuration is included in `render.yaml`. Set environment variables in Render dashboard.

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables
4. Ensure SPA routing is configured (all routes serve `index.html`)

## Configuration

### Stripe Setup
1. Create products and prices in Stripe Dashboard
2. Update price IDs in `src/config/stripe-config.ts`
3. Configure webhooks for subscription events

### Supabase Setup
1. Set up authentication with magic links
2. Configure email templates
3. Deploy edge functions for billing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

Private - All rights reserved 