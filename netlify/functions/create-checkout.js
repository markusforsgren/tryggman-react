const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const { priceId, userId, userEmail } = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: 'https://regal-licorice-6b2dd1.netlify.app/konto.html?success=true',
      cancel_url: 'https://regal-licorice-6b2dd1.netlify.app/priser.html',
      metadata: { userId },
      locale: 'sv'
    });

    return { statusCode: 200, headers, body: JSON.stringify({ url: session.url }) };

  } catch(e) {
    console.error(e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
