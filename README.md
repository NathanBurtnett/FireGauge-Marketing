# FireGauge Marketing Site

A professional marketing website for FireGauge equipment management system with integrated Stripe billing, Supabase authentication, and customer onboarding.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (see Environment Setup below)
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠 Environment Setup

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Optional: Analytics
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

## ✨ Features

- **Modern Stack**: Vite + React + TypeScript + Tailwind CSS
- **Authentication**: Supabase Auth with magic links
- **Payments**: Stripe integration with subscription management
- **UI Components**: Shadcn/ui component library
- **Analytics**: Google Analytics 4 integration
- **Responsive**: Mobile-first design
- **Testing**: Comprehensive test suite

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── lib/                # Utilities and configurations
├── api/                # API integration layer
└── hooks/              # Custom React hooks
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run test suite
- `npm run lint` - Run ESLint

## 🚀 Deployment

The project is configured for deployment on Render.com using the included `render.yaml` configuration.

### Render Deployment
1. Connect your GitHub repository to Render
2. Set environment variables in the Render dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Run `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables
4. Ensure SPA routing is configured

## 📚 Documentation

Detailed documentation is available in the `/docs` directory:

- [Setup Guides](docs/) - Complete setup instructions
- [API Documentation](docs/) - API integration details
- [Deployment Guide](docs/) - Production deployment steps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Private - All rights reserved

---

**Built with** ❤️ **for fire departments everywhere** 