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

exports.handler = async function(event) {
  const userId = event.queryStringParameters?.userId;
  if (!userId) return { statusCode: 400, body: JSON.stringify({ isPremium: false }) };

  try {
    const db = admin.firestore();
    const doc = await db.collection('users').doc(userId).get();
    const data = doc.data();
    return {
      statusCode: 200,
      body: JSON.stringify({ isPremium: data?.isPremium || false })
    };
  } catch (err) {
    return { statusCode: 200, body: JSON.stringify({ isPremium: false }) };
  }
};
