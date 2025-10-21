/**
 * Centralized pricing configuration
 * Change the price here and it updates everywhere
 */

// Price in cents (Stripe uses cents)
export const PRICE_CENTS = 99; // $0.99

// Formatted price for display
export const PRICE_DISPLAY = `$${(PRICE_CENTS / 100).toFixed(2)}`;

// Original price for strikethrough
export const ORIGINAL_PRICE = "$9.99";
