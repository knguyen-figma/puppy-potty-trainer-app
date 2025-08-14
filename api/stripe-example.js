// Example backend API endpoints for Stripe integration
// This would typically be implemented in Node.js/Express, Next.js API routes, or similar

const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY_HERE'); // Replace with your secret key

// POST /api/create-subscription
const createSubscription = async (req, res) => {
  try {
    const { email, name, paymentMethodId } = req.body;

    // 1. Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({ email });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // 2. Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // 3. Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: 'price_1RvrdiGxgFKkRCAxjCkxFk8c', // Your price ID
      }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(400).json({ error: error.message });
  }
};

// GET /api/subscription-status
const getSubscriptionStatus = async (req, res) => {
  try {
    const { customerId } = req.query;

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.json({ isSubscribed: false });
    }

    const subscription = subscriptions.data[0];
    
    res.json({
      isSubscribed: subscription.status === 'active',
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(400).json({ error: error.message });
  }
};

// POST /api/cancel-subscription
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(400).json({ error: error.message });
  }
};

// POST /api/webhook
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = 'whsec_YOUR_WEBHOOK_SECRET';

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Payment succeeded for invoice:', invoice.id);
      // Update user's subscription status in your database
      break;
    
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('Payment failed for invoice:', failedInvoice.id);
      // Handle failed payment, notify user, etc.
      break;
    
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('Subscription canceled:', deletedSubscription.id);
      // Update user's subscription status in your database
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

module.exports = {
  createSubscription,
  getSubscriptionStatus,
  cancelSubscription,
  handleWebhook,
};

/* 
To implement this in your app:

1. Replace the publishable key in /config/stripe.ts with your actual Stripe publishable key
2. Set up these API endpoints on your backend
3. Replace the mock API calls in SubscriptionCheckout.tsx with actual fetch calls
4. Set up Stripe webhooks to handle subscription events
5. Store subscription status in your database and sync with your frontend

Example frontend API call:
```javascript
const response = await fetch('/api/create-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email,
    name,
    paymentMethodId: paymentMethod.id,
  }),
});
```
*/