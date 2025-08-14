import React from 'react';
import { Button } from './ui/button';
import { PawPrint, AlertTriangle } from 'lucide-react';
import { PottyEvent } from '../App';

interface QuickActionsProps {
  onAddEvent: (event: Omit<PottyEvent, 'id'>) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAddEvent }) => {
  const handleQuickLog = (type: 'pee' | 'poop', isAccident: boolean = false) => {
    onAddEvent({
      type,
      timestamp: new Date(),
      location: isAccident ? 'Inside' : 'Outside',
      isAccident,
      notes: ''
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Quick Log</h2>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => handleQuickLog('pee')}
          className="h-16 flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600"
        >
          <PawPrint className="w-6 h-6 mb-1" />
          <span className="text-sm">Pee Success</span>
        </Button>
        
        <Button
          onClick={() => handleQuickLog('poop')}
          className="h-16 flex flex-col items-center justify-center bg-green-500 hover:bg-green-600"
        >
          <PawPrint className="w-6 h-6 mb-1" />
          <span className="text-sm">Poop Success</span>
        </Button>
        
        <Button
          onClick={() => handleQuickLog('pee', true)}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          <AlertTriangle className="w-6 h-6 mb-1" />
          <span className="text-sm">Pee Accident</span>
        </Button>
        
        <Button
          onClick={() => handleQuickLog('poop', true)}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center border-red-300 text-red-600 hover:bg-red-50"
        >
          <AlertTriangle className="w-6 h-6 mb-1" />
          <span className="text-sm">Poop Accident</span>
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        Tap to quickly log your puppy's potty events
      </p>
    </div>
  );
};