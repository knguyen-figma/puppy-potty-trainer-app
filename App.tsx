import React, { useState, useEffect } from 'react';
import { Calendar, Clock, PawPrint, TrendingUp, Crown, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Dialog, DialogContent } from './components/ui/dialog';
import { PottyLog } from './components/PottyLog';
import { Reminders } from './components/Reminders';
import { ProgressTracker } from './components/ProgressTracker';
import { QuickActions } from './components/QuickActions';
import { SubscriptionGate } from './components/SubscriptionGate';
import { SubscriptionCheckout } from './components/SubscriptionCheckout';
import { SubscriptionManagement } from './components/SubscriptionManagement';
import { StripeProvider } from './components/StripeProvider';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';

export interface PottyEvent {
  id: string;
  type: 'pee' | 'poop';
  timestamp: Date;
  location: string;
  isAccident: boolean;
  notes: string;
}

export interface ReminderSettings {
  regularInterval: number; // in minutes
  postMealReminder: boolean;
  postNapReminder: boolean;
  reminderTimes: string[];
}

const AppContent: React.FC = () => {
  const { subscriptionStatus } = useSubscription();
  const [pottyEvents, setPottyEvents] = useState<PottyEvent[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    regularInterval: 120, // 2 hours
    postMealReminder: true,
    postNapReminder: true,
    reminderTimes: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
  });
  const [activeTab, setActiveTab] = useState('log');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('puppyPottyEvents');
    const savedSettings = localStorage.getItem('puppyReminderSettings');
    
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }));
      setPottyEvents(parsedEvents);
    }
    
    if (savedSettings) {
      setReminderSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save data to localStorage whenever events or settings change
  useEffect(() => {
    localStorage.setItem('puppyPottyEvents', JSON.stringify(pottyEvents));
  }, [pottyEvents]);

  useEffect(() => {
    localStorage.setItem('puppyReminderSettings', JSON.stringify(reminderSettings));
  }, [reminderSettings]);

  const addPottyEvent = (event: Omit<PottyEvent, 'id'>) => {
    // Limit free users to 10 events
    if (!subscriptionStatus.isSubscribed && pottyEvents.length >= 10) {
      setShowUpgrade(true);
      return;
    }

    const newEvent: PottyEvent = {
      ...event,
      id: Date.now().toString()
    };
    setPottyEvents(prev => [newEvent, ...prev]);
  };

  const updatePottyEvent = (id: string, updates: Partial<PottyEvent>) => {
    setPottyEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deletePottyEvent = (id: string) => {
    setPottyEvents(prev => prev.filter(event => event.id !== id));
  };

  // Calculate streak of accident-free days
  const calculateStreak = () => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const dayEvents = pottyEvents.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate.toDateString() === checkDate.toDateString();
      });
      
      const hasAccident = dayEvents.some(event => event.isAccident);
      
      if (hasAccident) {
        break;
      } else if (dayEvents.length > 0) {
        streak++;
      }
    }
    
    return streak;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl mb-1">🐶 Puppy Potty Trainer</h1>
                <p className="text-blue-100">Building good habits together</p>
              </div>
              {subscriptionStatus.isSubscribed && (
                <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  PRO
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="text-3xl">🔥</div>
                <div className="text-sm">
                  {calculateStreak()} day streak
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => subscriptionStatus.isSubscribed ? setShowAccount(true) : setShowUpgrade(true)}
                className="text-white hover:bg-white/20"
              >
                {subscriptionStatus.isSubscribed ? <Settings className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <QuickActions onAddEvent={addPottyEvent} />
        </div>

        {/* Free User Event Limit Warning */}
        {!subscriptionStatus.isSubscribed && pottyEvents.length >= 8 && (
          <div className="px-4 pb-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
              <p className="text-orange-800">
                You've logged {pottyEvents.length}/10 events. 
                <Button
                  variant="link"
                  className="p-0 ml-1 text-orange-600 underline"
                  onClick={() => setShowUpgrade(true)}
                >
                  Upgrade to Pro
                </Button>
                {' '}for unlimited logging!
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="log" className="flex items-center gap-2">
              <PawPrint className="w-4 h-4" />
              Log
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="mt-4">
            <PottyLog 
              events={pottyEvents}
              onUpdateEvent={updatePottyEvent}
              onDeleteEvent={deletePottyEvent}
            />
          </TabsContent>

          <TabsContent value="reminders" className="mt-4">
            {subscriptionStatus.isSubscribed ? (
              <Reminders 
                settings={reminderSettings}
                onUpdateSettings={setReminderSettings}
              />
            ) : (
              <SubscriptionGate 
                feature="Custom Reminders"
                description="Set up personalized reminder schedules and special triggers for optimal training results."
              >
                <Reminders 
                  settings={reminderSettings}
                  onUpdateSettings={setReminderSettings}
                />
              </SubscriptionGate>
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-4">
            {subscriptionStatus.isSubscribed ? (
              <ProgressTracker events={pottyEvents} />
            ) : (
              <SubscriptionGate 
                feature="Detailed Analytics"
                description="Get comprehensive insights with charts, trends, and problem area identification."
              >
                <ProgressTracker events={pottyEvents} />
              </SubscriptionGate>
            )}
          </TabsContent>
        </Tabs>

        {/* Upgrade Dialog */}
        <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
          <DialogContent className="sm:max-w-lg p-0">
            <SubscriptionCheckout
              onSuccess={() => setShowUpgrade(false)}
              onCancel={() => setShowUpgrade(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Account Management Dialog */}
        <Dialog open={showAccount} onOpenChange={setShowAccount}>
          <DialogContent className="sm:max-w-lg p-0">
            <SubscriptionManagement />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StripeProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </StripeProvider>
  );
}