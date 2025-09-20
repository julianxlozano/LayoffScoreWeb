# Payment Setup Guide

## Overview

This app uses Stripe's Express Checkout Element for payment processing with automatic support for:

- **Apple Pay**: iOS Safari, Chrome/Edge on macOS
- **Google Pay**: Chrome browsers on any platform  
- **Link**: Stripe's one-click payment method
- **PayPal**: Where enabled and supported
- **Klarna**: Buy now, pay later option
- **Amazon Pay**: For Amazon customers
- **Card Payment**: Universal fallback via Stripe Checkout

## Setup Instructions

### 1. Create Stripe Account

1. Sign up at https://stripe.com
2. Get your API keys from the Stripe Dashboard:
   - Publishable key: `pk_test_...` (for frontend)
   - Secret key: `sk_test_...` (for backend)

### 2. Configure Backend (.env)

```bash
# In layoff-proof-backend/.env
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET  # Set up webhook first
FRONTEND_URL=http://localhost:3000  # Or your production URL
```

### 3. Configure Frontend (.env.local)

```bash
# In layoff-score-web/.env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api  # Or your production API
```

### 4. Set Up Stripe Webhook (Production)

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-backend.com/api/payments/webhook/`
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `checkout.session.completed`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Enable Payment Methods in Stripe

1. Go to Stripe Dashboard > Settings > Payment methods
2. Enable:
   - Card payments (enabled by default)
   - Apple Pay (automatic when using Payment Request API)
   - Google Pay (automatic when using Payment Request API)

### 6. Test Payments

#### Test Card Numbers

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

#### Test Apple Pay (iOS Safari)

1. Use a real iOS device or simulator
2. Must be on HTTPS (localhost works)
3. Add test card to Wallet app

#### Test Google Pay (Chrome Browser)

1. Use Chrome on any device (desktop or mobile)
2. Must be on HTTPS (localhost works)
3. Have Google Pay set up with test card in your Google account

## Payment Flow

1. User completes quiz
2. Redirected to unlock score page
3. Payment options shown based on browser/device:
   - Chrome (any device): Google Pay button + Card button
   - Safari/iOS: Apple Pay button + Card button
   - Other browsers: Card button only
4. Payment processed via:
   - Native wallet (Apple/Google Pay) → Payment Request API
   - Card → Stripe Checkout redirect
5. Success page verifies payment
6. User redirected to results

## Production Deployment

### Heroku Environment Variables

#### Backend

```bash
heroku config:set STRIPE_SECRET_KEY=sk_live_YOUR_KEY --app your-backend-app
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY --app your-backend-app
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET --app your-backend-app
heroku config:set FRONTEND_URL=https://www.layoffscore.ai --app your-backend-app
```

#### Frontend

```bash
heroku config:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY --app your-frontend-app
heroku config:set NEXT_PUBLIC_API_BASE_URL=https://your-backend.herokuapp.com/api --app your-frontend-app
```

## Security Notes

1. **Never commit API keys** - Use environment variables
2. **Verify webhooks** - Always validate Stripe webhook signatures
3. **HTTPS required** - Payment methods require secure connection
4. **PCI Compliance** - Stripe handles card data, never store it yourself
5. **Test thoroughly** - Use Stripe test mode before going live

## Troubleshooting

### Apple Pay not showing

- Check iOS version (requires iOS 10+)
- Verify HTTPS connection
- Ensure domain is verified in Apple Pay settings

### Google Pay not showing

- Check Android Chrome version
- Verify HTTPS connection
- Check Google Pay availability in region

### Payment verification fails

- Check webhook configuration
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check backend logs for webhook errors

## Support

- Stripe Documentation: https://stripe.com/docs
- Apple Pay Web: https://developer.apple.com/apple-pay/
- Google Pay Web: https://developers.google.com/pay/api/web
