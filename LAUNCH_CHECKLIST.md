
# 🚀 DailyCultivator Launch Checklist

Follow these steps to move from local development to a live URL.

## 1. Firebase Project Setup
- [ ] Create project in [Firebase Console](https://console.firebase.google.com/).
- [ ] Enable **Authentication** (Google & Email/Password).
- [ ] Initialize **Firestore** in "Production Mode".
- [ ] Enable **Cloud Functions** (Requires Blaze Pay-As-You-Go plan).
- [ ] Create a **Storage** bucket for user exports/reports.

## 2. Gemini API Security
- [ ] Move API calls to Firebase Cloud Functions to keep `process.env.API_KEY` hidden from the browser.
- [ ] Set `firebase functions:config:set gemini.key="YOUR_KEY"`.
- [ ] Set up **App Check** to prevent unauthorized API billing.

## 3. Production Deployment
- [ ] Build the app: `npm run build`.
- [ ] Deploy: `firebase deploy --only hosting,functions,firestore`.
- [ ] Connect a custom domain in Hosting settings.

## 4. Legal & Compliance
- [ ] Update `PrivacySettings.tsx` to link to a formal Privacy Policy.
- [ ] Ensure the "Everything Private by Default" rule is hardcoded into Firestore Security Rules.
- [ ] Implement a "Delete My Account" feature to satisfy GDPR/CCPA.

## 5. Analytics & Monitoring
- [ ] Enable Google Analytics for Firebase to track retention.
- [ ] Set up **Cloud Logging** alerts for AI service failures.
