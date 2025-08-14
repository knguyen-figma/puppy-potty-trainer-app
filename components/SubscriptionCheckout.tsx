import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, Check, Zap } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { STRIPE_CONFIG } from '../config/stripe';

interface SubscriptionCheckoutProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { updateSubscriptionStatus } = useSubscription();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      // In a real application, you would:
      // 1. Create a customer on your backend
      // 2. Create a payment method
      // 3. Create a subscription
      // 4. Handle the payment confirmation
      
      // For demo purposes, we'll simulate a successful subscription
      const { error: cardError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name,
          email,
        },
      });

      if (cardError) {
        setError(cardError.message || 'An error occurred');
        setIsProcessing(false);
        return;
      }

      // Simulate API call to create subscription
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful subscription creation
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

      updateSubscriptionStatus({
        isSubscribed: true,
        status: 'active',
        currentPeriodEnd: subscriptionEndDate,
        cancelAtPeriodEnd: false,
      });

      onSuccess?.();
    } catch (err) {
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-2 border-blue-200">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Upgrade to Pro</CardTitle>
          <div className="text-3xl font-bold text-blue-600 mt-2">$5/month</div>
          <p className="text-gray-600 mt-2">Unlock premium features for better training results</p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Features List */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Pro Features:</h3>
            <div className="space-y-2">
              {[
                'Unlimited potty logs',
                'Advanced progress analytics',
                'Custom reminder schedules',
                'Multiple pet profiles',
                'Export training data',
                'Priority customer support'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <Label>Card Information</Label>
              <div className="mt-1 p-3 border border-gray-300 rounded-md">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Secure payment powered by Stripe</p>
            <p>Cancel anytime. No hidden fees.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};