import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Crown, Calendar, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

export const SubscriptionManagement: React.FC = () => {
  const { subscriptionStatus, updateSubscriptionStatus } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    
    // Simulate API call to cancel subscription
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateSubscriptionStatus({
      ...subscriptionStatus,
      cancelAtPeriodEnd: true,
    });
    
    setIsLoading(false);
  };

  const handleReactivateSubscription = async () => {
    setIsLoading(true);
    
    // Simulate API call to reactivate subscription
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateSubscriptionStatus({
      ...subscriptionStatus,
      cancelAtPeriodEnd: false,
    });
    
    setIsLoading(false);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card className="border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-purple-600" />
              <CardTitle>Pro Subscription</CardTitle>
            </div>
            <Badge className={getStatusColor(subscriptionStatus.status)}>
              {subscriptionStatus.status || 'inactive'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {subscriptionStatus.isSubscribed && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Plan</span>
                <span className="font-semibold">Puppy Potty Trainer Pro</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price</span>
                <span className="font-semibold">$5.00 / month</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Next billing date</span>
                <span className="font-semibold">
                  {formatDate(subscriptionStatus.currentPeriodEnd)}
                </span>
              </div>

              {subscriptionStatus.cancelAtPeriodEnd && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription className="text-orange-800">
                    Your subscription will end on{' '}
                    {formatDate(subscriptionStatus.currentPeriodEnd)}.
                    You'll keep access to Pro features until then.
                  </AlertDescription>
                </Alert>
              )}

              {subscriptionStatus.status === 'active' && !subscriptionStatus.cancelAtPeriodEnd && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription className="text-green-800">
                    Your subscription is active and will automatically renew.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Pro Features</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                'Unlimited potty logs',
                'Advanced progress analytics',
                'Custom reminder schedules',
                'Multiple pet profiles',
                'Export training data',
                'Priority customer support'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {subscriptionStatus.isSubscribed && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Subscription Actions</span>
              </div>
              
              {subscriptionStatus.cancelAtPeriodEnd ? (
                <Button
                  onClick={handleReactivateSubscription}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Processing...' : 'Reactivate Subscription'}
                </Button>
              ) : (
                <Button
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isLoading ? 'Processing...' : 'Cancel Subscription'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};