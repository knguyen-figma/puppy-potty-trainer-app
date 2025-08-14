import React, { createContext, useContext, useState, useEffect } from 'react';

interface SubscriptionStatus {
  isSubscribed: boolean;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus;
  updateSubscriptionStatus: (status: SubscriptionStatus) => void;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptionStatus: {
    isSubscribed: false,
    status: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  },
  updateSubscriptionStatus: () => {},
  isLoading: true,
});

export const useSubscription = () => useContext(SubscriptionContext);

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    status: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check subscription status from localStorage for demo purposes
    // In a real app, you'd fetch this from your backend
    const savedStatus = localStorage.getItem('puppyAppSubscription');
    if (savedStatus) {
      const parsed = JSON.parse(savedStatus);
      setSubscriptionStatus({
        ...parsed,
        currentPeriodEnd: parsed.currentPeriodEnd ? new Date(parsed.currentPeriodEnd) : null,
      });
    }
    setIsLoading(false);
  }, []);

  const updateSubscriptionStatus = (status: SubscriptionStatus) => {
    setSubscriptionStatus(status);
    localStorage.setItem('puppyAppSubscription', JSON.stringify(status));
  };

  return (
    <SubscriptionContext.Provider value={{
      subscriptionStatus,
      updateSubscriptionStatus,
      isLoading,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};