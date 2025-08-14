# 🐶 Puppy Potty Trainer

A comprehensive React-based mobile app for puppy potty training with Stripe subscription integration. Help first-time puppy owners establish consistent potty routines and reduce accidents.

![Puppy Potty Trainer](https://img.shields.io/badge/React-18.2.0-blue) 
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Stripe](https://img.shields.io/badge/Stripe-Integrated-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.4-38bdf8)

## ✨ Features

### Free Tier
- ✅ Quick potty event logging (pee/poop, success/accident)
- ✅ Basic potty log with timestamps and locations
- ✅ Simple accident tracking
- ✅ Basic streak counter
- ✅ Up to 10 potty events

### Pro Subscription ($5/month)
- 🚀 **Unlimited potty logs** - Log as many events as needed
- 📊 **Advanced progress analytics** - Detailed charts and insights
- ⏰ **Custom reminder schedules** - Personalized timing for your puppy
- 🏠 **Multiple pet profiles** - Manage multiple puppies
- 📱 **Export training data** - Download your progress reports
- 🎯 **Priority customer support** - Get help when you need it

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI primitives with shadcn/ui
- **Charts**: Recharts for analytics visualization
- **Payment Processing**: Stripe Elements and Subscriptions
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Data Storage**: Local Storage (client-side)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Stripe account (for payment features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/knguyen-figma/puppy-potty-trainer-app.git
   cd puppy-potty-trainer-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Stripe**
   - Update `config/stripe.ts` with your Stripe publishable key:
   ```typescript
   export const STRIPE_CONFIG = {
     publishableKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE',
     // ... other config
   };
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the app.

## 🔧 Stripe Integration Setup

### Frontend Configuration

The app includes pre-configured Stripe product and pricing:
- **Product ID**: `prod_Srap6uhQtANEQP`
- **Price ID**: `price_1RvrdiGxgFKkRCAxjCkxFk8c`
- **Amount**: $5.00/month

### Backend Implementation

Refer to `api/stripe-example.js` for backend API endpoints:

1. **Required Endpoints**:
   - `POST /api/create-subscription` - Create new subscriptions
   - `GET /api/subscription-status` - Check subscription status
   - `POST /api/cancel-subscription` - Cancel subscriptions
   - `POST /api/webhook` - Handle Stripe webhooks

2. **Environment Variables**:
   ```env
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```

3. **Database Schema** (example):
   ```sql
   CREATE TABLE subscriptions (
     id SERIAL PRIMARY KEY,
     user_id INTEGER NOT NULL,
     stripe_customer_id VARCHAR(255),
     stripe_subscription_id VARCHAR(255),
     status VARCHAR(50),
     current_period_end TIMESTAMP,
     cancel_at_period_end BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## 📱 App Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   ├── QuickActions.tsx    # Quick logging buttons
│   ├── PottyLog.tsx        # Event history and management
│   ├── Reminders.tsx       # Notification settings (Pro)
│   ├── ProgressTracker.tsx # Analytics and charts (Pro)
│   ├── SubscriptionGate.tsx # Premium feature gates
│   ├── SubscriptionCheckout.tsx # Stripe payment form
│   ├── SubscriptionManagement.tsx # Account management
│   └── StripeProvider.tsx  # Stripe context wrapper
├── context/
│   └── SubscriptionContext.tsx # Subscription state management
├── config/
│   └── stripe.ts          # Stripe configuration
├── api/
│   └── stripe-example.js  # Backend API examples
└── App.tsx               # Main application component
```

## 🎯 Core Features

### Quick Actions
Fast logging with one-tap buttons for:
- Successful pee/poop events
- Accident tracking with location
- Automatic timestamp recording

### Progress Analytics (Pro)
- Weekly success rate charts
- Event type breakdown (pee vs poop)
- Location analysis for problem areas
- Accident-free streak tracking
- Trend comparisons

### Smart Reminders (Pro)
- Customizable interval reminders
- Post-meal and post-nap triggers
- Scheduled reminder times
- Browser notification support

### Subscription Management
- Secure Stripe payment processing
- Self-service subscription management
- Automatic feature unlocking
- Cancel anytime functionality

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm run build
   # Upload dist/ folder to Netlify
   ```

3. **Static Hosting**
   ```bash
   npm run build
   # Serve dist/ folder with any static hosting service
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Development Roadmap

- [ ] Backend API implementation
- [ ] User authentication system
- [ ] Multi-pet profiles
- [ ] Data export functionality
- [ ] Push notifications (mobile)
- [ ] Offline support with sync
- [ ] Training tips and guides
- [ ] Vet appointment reminders
- [ ] Social sharing features

## 🐛 Known Issues

- Stripe integration currently uses demo/mock mode
- Local storage only (no cloud sync)
- Limited to browser notifications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Stripe](https://stripe.com/) for payment processing
- [Recharts](https://recharts.org/) for data visualization
- [Lucide](https://lucide.dev/) for icons
- [Radix UI](https://www.radix-ui.com/) for accessible primitives

## 📞 Support

For support and questions:
- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/knguyen-figma/puppy-potty-trainer-app/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/knguyen-figma/puppy-potty-trainer-app/discussions)

---

**Made with ❤️ for puppy parents everywhere!** 🐕✨