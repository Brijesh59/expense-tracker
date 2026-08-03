# Luma Pricing Notes

## Recommended Plans

### Free

Price: Rs. 0 forever

Use this as the generous local-first plan:

- Fully offline mobile experience
- Data stored locally on the user's device
- Unlimited expenses, categories, budgets, and core insights
- No login required
- No forced cloud sync

### Luma Plus

India pricing:

- Rs. 299/month
- Rs. 2,999/year

Suggested US/global pricing:

- $4.99/month
- $49.99/year

Use Plus for features that create ongoing cost or require an account:

- Secure server sync across mobile devices
- AI questions and AI expense entry
- Login/account support
- Member invites
- Shared/collaborative workspaces

## Rationale

Rs. 149/month is only about $1.50 at recent USD/INR exchange rates. After App Store or Play Store fees, backend sync, AI usage, support, and maintenance, that leaves very little room for the product to be sustainable.

Rs. 299/month is still accessible for India, while being more realistic for a paid plan that includes sync, AI, and collaboration. The free offline plan remains complete enough that paid does not need to be artificially cheap.

## Implementation Notes

- Use country-specific pricing instead of converting one Indian price globally.
- India can use Rs. 299/month and Rs. 2,999/year.
- US can use $4.99/month and $49.99/year.
- Keep the annual plan near 10 months of monthly pricing. This gives users a clear reason to choose annual while keeping the offer simple.
- Paid features should be tied to account-based capabilities: sync, AI, and collaboration.
- Offline local-only tracking should continue working without an account.

## References

- Apple auto-renewable subscriptions: https://developer.apple.com/app-store/subscriptions/
- Apple App Store pricing setup: https://developer.apple.com/help/app-store-connect/manage-app-pricing/set-a-price/
- Google Play country and region pricing: https://support.google.com/googleplay/android-developer/answer/6334373
- Google Play subscription price changes: https://developer.android.com/google/play/billing/price-changes
- USD/INR exchange-rate context: https://wise.com/us/currency-converter/usd-to-inr-rate/history
