# LayoffScore Web App

A mobile-optimized web application for assessing AI job displacement risk, built with Next.js and Mantine UI.

## Features

- **Landing Page**: Beautiful gradient hero section with call-to-action
- **Quiz Flow**: 12-question assessment to evaluate AI replacement risk
- **Unlock Score**: Payment screen with Stripe, Google Pay, and Apple Pay integration
- **Results Dashboard**: Dynamic risk score visualization with:
  - Animated donut chart showing risk percentage
  - Color-coded risk levels (Low, Moderate, Elevated, High)
  - Dynamic gradient backgrounds based on risk level
  - Personalized tips and recommendations

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Mantine UI** for components
- **CSS Modules** for styling (no Tailwind)
- **Axios** for API calls

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running at `http://localhost:8000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/              # Next.js app directory
│   ├── layout.tsx    # Root layout with header
│   ├── page.tsx      # Landing page
│   ├── quiz/         # Quiz page
│   ├── unlock-score/ # Unlock score payment page
│   └── results/      # Results page
├── components/       # Reusable components
│   ├── Header.tsx    # Site header
│   └── ScoreDonut.tsx # Score visualization
├── constants/        # App constants
│   └── quiz.ts       # Quiz questions
├── utils/           # Utility functions
│   ├── api.ts       # API calls
│   └── colors.ts    # Color utilities
└── styles/          # Global styles
    └── globals.css  # Global CSS
```

## Design Features

- **Dark Theme**: Consistent dark background with gradient overlays
- **Gradient Effects**: Dynamic gradients that change based on risk level
- **Responsive Design**: Mobile-first approach, optimized for all screen sizes
- **Smooth Animations**: Subtle transitions and hover effects
- **Modular Architecture**: Clean separation of concerns with utilities and components

## API Integration

The app connects to the backend API at `http://localhost:8000` for:

- Creating anonymous users
- Calculating quiz scores
- Retrieving personalized recommendations

Falls back to local calculation if API is unavailable.

## Payment Integration

The unlock score page features full payment integration with Stripe, including support for Apple Pay on iOS devices and Google Pay on Chrome browsers. A standard card payment option is available as a universal fallback.

## Color Scheme

- **Primary**: #FF6B6B (Red)
- **Background**: #1A1A1A to #2D1F1F gradient
- **Risk Levels**:
  - Low: Green (#22C55E)
  - Moderate: Yellow (#FACC15)
  - Elevated: Orange (#FFB020)
  - High: Red (#FF5A5F)

## Future Enhancements

- [ ] Integrate real payment processing (Stripe/PayPal)
- [ ] Add user authentication
- [ ] Save quiz results to user profile
- [ ] Add social sharing functionality
- [ ] Implement email capture
- [ ] Add more detailed action plans
- [ ] Create admin dashboard

## License

Private - All rights reserved
