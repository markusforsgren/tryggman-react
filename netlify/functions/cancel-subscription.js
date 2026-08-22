const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

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
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const { userId } = JSON.parse(event.body);
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.stripeSubscriptionId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No subscription found' }) };
    }

    // Avsluta vid periodens slut
    await stripe.subscriptions.update(userData.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch(e) {
    console.error(e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
