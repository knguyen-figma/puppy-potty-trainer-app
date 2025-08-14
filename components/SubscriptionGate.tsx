import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Crown, Lock, Zap } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { SubscriptionCheckout } from './SubscriptionCheckout';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  children,
  feature,
  description,
}) => {
  const { subscriptionStatus } = useSubscription();
  const [showCheckout, setShowCheckout] = useState(false);

  if (subscriptionStatus.isSubscribed && subscriptionStatus.status === 'active') {
    return <>{children}</>;
  }

  return (
    <>
      <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">
            <Lock className="w-5 h-5 inline mr-2" />
            Pro Feature: {feature}
          </h3>
          
          {description && (
            <p className="text-gray-600 mb-4">{description}</p>
          )}
          
          <div className="mb-4">
            <div className="text-2xl font-bold text-purple-600">$5/month</div>
            <div className="text-sm text-gray-500">Cancel anytime</div>
          </div>
          
          <Button
            onClick={() => setShowCheckout(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            <Zap className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
          
          <div className="mt-4 text-xs text-gray-500">
            Unlock this feature and all other Pro benefits
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-lg p-0">
          <SubscriptionCheckout
            onSuccess={() => setShowCheckout(false)}
            onCancel={() => setShowCheckout(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};