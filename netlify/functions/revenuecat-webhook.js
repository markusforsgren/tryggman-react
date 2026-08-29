const admin = require('firebase-admin');

// Initiera Firebase Admin om inte redan gjort
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Mappa RevenueCats entitlement-ID mot era interna plan-namn.
// Sätt upp entitlements i RevenueCat-dashboarden med exakt dessa ID:n: "bas" och "premium".
const ENTITLEMENT_TO_PLAN = {
  premium: 'premium',
  bas: 'bas',
};

exports.handler = async (event) => {
  // RevenueCat skickar en Authorization-header om ni satt "Authorization header value"
  // i webhook-inställningarna i RevenueCat-dashboarden. Rekommenderas starkt.
  const authHeader = event.headers['authorization'];
  if (process.env.REVENUECAT_WEBHOOK_SECRET && authHeader !== `Bearer ${process.env.REVENUECAT_WEBHOOK_SECRET}`) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body).event;
  } catch (err) {
    return { statusCode: 400, body: 'Invalid payload' };
  }

  const userId = payload.app_user_id;
  if (!userId) {
    return { statusCode: 200, body: 'No app_user_id, ignoring' };
  }

  try {
    switch (payload.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
      case 'PRODUCT_CHANGE': {
        const entitlementId = payload.entitlement_ids?.[0];
        const plan = ENTITLEMENT_TO_PLAN[entitlementId] || 'bas';

        await db.collection('users').doc(userId).set({
          plan,
          playStoreEntitlement: entitlementId || null,
          planActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
          planExpiresAt: payload.expiration_at_ms
            ? admin.firestore.Timestamp.fromMillis(payload.expiration_at_ms)
            : null,
          billingProvider: 'google_play',
        }, { merge: true });

        console.log(`User ${userId} activated plan ${plan} via Google Play`);
        break;
      }

      case 'CANCELLATION':
        // Notera: vid CANCELLATION har användaren oftast fortsatt tillgång fram till
        // periodens slut. Sätt bara plan=free vid EXPIRATION för att inte klippa av
        // tillgång i förtid.
        break;

      case 'EXPIRATION': {
        await db.collection('users').doc(userId).set({
          plan: 'free',
          playStoreEntitlement: null,
        }, { merge: true });
        console.log(`User ${userId} downgraded to free (expired)`);
        break;
      }

      case 'BILLING_ISSUE':
        console.warn(`Billing issue for user ${userId}`);
        break;

      default:
        console.log(`Unhandled RevenueCat event type: ${payload.type}`);
    }

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('RevenueCat webhook error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};