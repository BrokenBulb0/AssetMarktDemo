// Analytics utility for tracking user events
// Replace with your analytics provider (Google Analytics, Mixpanel, etc.)

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

class Analytics {
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.NODE_ENV === 'production';
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.enabled) {
      console.log('[Analytics]', event, properties);
      return;
    }

    // TODO: Implement your analytics provider
    // Example: gtag('event', event, properties);
    // Example: mixpanel.track(event, properties);
  }

  page(name: string, properties?: Record<string, any>) {
    if (!this.enabled) {
      console.log('[Analytics] Page View:', name, properties);
      return;
    }

    // TODO: Implement page tracking
    // Example: gtag('config', 'GA_MEASUREMENT_ID', { page_path: name });
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (!this.enabled) {
      console.log('[Analytics] Identify:', userId, traits);
      return;
    }

    // TODO: Implement user identification
    // Example: gtag('set', { user_id: userId });
    // Example: mixpanel.identify(userId);
  }
}

export const analytics = new Analytics();

// Common event tracking functions
export const trackEvent = {
  assetViewed: (assetId: string, assetTitle: string) => {
    analytics.track('asset_viewed', { assetId, assetTitle });
  },

  assetAddedToCart: (assetId: string, assetTitle: string, price: string) => {
    analytics.track('asset_added_to_cart', { assetId, assetTitle, price });
  },

  assetRemovedFromCart: (assetId: string) => {
    analytics.track('asset_removed_from_cart', { assetId });
  },

  searchPerformed: (query: string, resultsCount: number) => {
    analytics.track('search_performed', { query, resultsCount });
  },

  categoryViewed: (categoryId: string, categoryName: string) => {
    analytics.track('category_viewed', { categoryId, categoryName });
  },

  checkoutStarted: (cartTotal: number, itemCount: number) => {
    analytics.track('checkout_started', { cartTotal, itemCount });
  },

  purchaseCompleted: (orderId: string, total: number, items: any[]) => {
    analytics.track('purchase_completed', { orderId, total, items });
  },

  userRegistered: (userId: string) => {
    analytics.track('user_registered', { userId });
  },

  userLoggedIn: (userId: string) => {
    analytics.track('user_logged_in', { userId });
  },
};
