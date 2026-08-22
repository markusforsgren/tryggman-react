const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        const userId = session.client_reference_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (userId) {
          // Hämta subscription för att få plan
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0].price.id;

          const plan = priceId === process.env.PRICE_PREMIUM ? 'premium' : 'bas';

          await db.collection('users').doc(userId).set({
            plan,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            planActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
            planExpiresAt: null,
          }, { merge: true });

          console.log(`User ${userId} upgraded to ${plan}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object;
        const customerId = subscription.customer;

        // Hitta användaren via customerId
        const usersSnap = await db.collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get();

        if (!usersSnap.empty) {
          const userId = usersSnap.docs[0].id;
          await db.collection('users').doc(userId).update({
            plan: 'free',
            stripeSubscriptionId: null,
          });
          console.log(`User ${userId} downgraded to free`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0].price.id;
        const plan = priceId === process.env.PRICE_PREMIUM ? 'premium' : 'bas';

        const usersSnap = await db.collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get();

        if (!usersSnap.empty) {
          const userId = usersSnap.docs[0].id;
          await db.collection('users').doc(userId).update({ plan });
          console.log(`User ${userId} updated to ${plan}`);
        }
        break;
      }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Webhook handler error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
