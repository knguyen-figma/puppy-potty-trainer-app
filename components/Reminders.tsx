import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Bell, Plus, Trash2, Clock } from 'lucide-react';
import { ReminderSettings } from '../App';

interface RemindersProps {
  settings: ReminderSettings;
  onUpdateSettings: (settings: ReminderSettings) => void;
}

export const Reminders: React.FC<RemindersProps> = ({ settings, onUpdateSettings }) => {
  const [newReminderTime, setNewReminderTime] = useState('');
  const [nextReminder, setNextReminder] = useState<Date | null>(null);

  // Calculate next reminder time
  useEffect(() => {
    const calculateNextReminder = () => {
      const now = new Date();
      const today = now.toDateString();
      
      // Find the next reminder time today
      const todayReminders = settings.reminderTimes
        .map(time => {
          const [hours, minutes] = time.split(':').map(Number);
          const reminderDate = new Date();
          reminderDate.setHours(hours, minutes, 0, 0);
          return reminderDate;
        })
        .filter(date => date > now)
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (todayReminders.length > 0) {
        setNextReminder(todayReminders[0]);
      } else if (settings.reminderTimes.length > 0) {
        // Next reminder is tomorrow's first reminder
        const [hours, minutes] = settings.reminderTimes[0].split(':').map(Number);
        const tomorrowReminder = new Date();
        tomorrowReminder.setDate(tomorrowReminder.getDate() + 1);
        tomorrowReminder.setHours(hours, minutes, 0, 0);
        setNextReminder(tomorrowReminder);
      } else {
        setNextReminder(null);
      }
    };

    calculateNextReminder();
    const interval = setInterval(calculateNextReminder, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [settings.reminderTimes]);

  const addReminderTime = () => {
    if (newReminderTime && !settings.reminderTimes.includes(newReminderTime)) {
      const updatedTimes = [...settings.reminderTimes, newReminderTime]
        .sort()
        .slice(0, 10); // Limit to 10 reminders
      
      onUpdateSettings({
        ...settings,
        reminderTimes: updatedTimes
      });
      
      setNewReminderTime('');
    }
  };

  const removeReminderTime = (timeToRemove: string) => {
    onUpdateSettings({
      ...settings,
      reminderTimes: settings.reminderTimes.filter(time => time !== timeToRemove)
    });
  };

  const formatTimeUntilNext = (date: Date | null) => {
    if (!date) return null;
    
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Puppy Potty Reminder', {
          body: 'Time for a potty break! 🐶',
          icon: '/favicon.ico'
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Reminders</h2>
        {nextReminder && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Next: {formatTimeUntilNext(nextReminder)}
          </Badge>
        )}
      </div>

      {/* Enable Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Browser Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Get notified when it's time for a potty break
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {Notification.permission === 'granted' ? 'Enabled' : 
                 Notification.permission === 'denied' ? 'Blocked - Please enable in browser settings' :
                 'Click to enable'}
              </p>
            </div>
            <Button
              onClick={requestNotificationPermission}
              disabled={Notification.permission === 'granted'}
              size="sm"
            >
              {Notification.permission === 'granted' ? 'Enabled' : 'Enable'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Regular Interval */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Regular Interval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Remind every (minutes)</Label>
            <Input
              type="number"
              min="30"
              max="480"
              step="30"
              value={settings.regularInterval}
              onChange={(e) => onUpdateSettings({
                ...settings,
                regularInterval: parseInt(e.target.value) || 120
              })}
              className="w-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              Currently set to {Math.floor(settings.regularInterval / 60)}h {settings.regularInterval % 60}m
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Special Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Special Triggers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>After meals</Label>
              <p className="text-xs text-gray-500">Remind 15-30 minutes after eating</p>
            </div>
            <Switch
              checked={settings.postMealReminder}
              onCheckedChange={(checked) => onUpdateSettings({
                ...settings,
                postMealReminder: checked
              })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>After naps</Label>
              <p className="text-xs text-gray-500">Remind immediately after waking up</p>
            </div>
            <Switch
              checked={settings.postNapReminder}
              onCheckedChange={(checked) => onUpdateSettings({
                ...settings,
                postNapReminder: checked
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Times */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scheduled Times</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="time"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              placeholder="Add time"
            />
            <Button
              onClick={addReminderTime}
              disabled={!newReminderTime || settings.reminderTimes.length >= 10}
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {settings.reminderTimes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {settings.reminderTimes.map(time => {
                const [hours, minutes] = time.split(':');
                const displayTime = new Date(`2000-01-01T${time}:00`).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
                
                return (
                  <Badge
                    key={time}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {displayTime}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReminderTime(time)}
                      className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="w-2 h-2" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No scheduled reminders</p>
          )}
          
          <p className="text-xs text-gray-500">
            {settings.reminderTimes.length}/10 reminders added
          </p>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-800 mb-2">💡 Reminder Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Young puppies (8-12 weeks) need breaks every 1-2 hours</li>
            <li>• Always take them out first thing in the morning</li>
            <li>• Set reminders for 15-30 minutes after meals</li>
            <li>• Last potty break should be right before bed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};