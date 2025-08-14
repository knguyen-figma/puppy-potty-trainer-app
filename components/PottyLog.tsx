import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { PawPrint, MapPin, Clock, Edit, Trash2, Plus } from 'lucide-react';
import { PottyEvent } from '../App';

interface PottyLogProps {
  events: PottyEvent[];
  onUpdateEvent: (id: string, updates: Partial<PottyEvent>) => void;
  onDeleteEvent: (id: string) => void;
}

export const PottyLog: React.FC<PottyLogProps> = ({ events, onUpdateEvent, onDeleteEvent }) => {
  const [editingEvent, setEditingEvent] = useState<PottyEvent | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleSaveEdit = (updatedEvent: PottyEvent) => {
    onUpdateEvent(updatedEvent.id, updatedEvent);
    setEditingEvent(null);
  };

  const groupedEvents = events.reduce((groups, event) => {
    const dateKey = event.timestamp.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, PottyEvent[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Potty Log</h2>
        <Button
          onClick={() => setShowAddDialog(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      {Object.keys(groupedEvents).length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No potty events logged yet</p>
            <p className="text-sm text-gray-400 mt-1">Use the quick actions above to get started!</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedEvents)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([dateString, dayEvents]) => (
            <Card key={dateString}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {formatDate(new Date(dateString))}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dayEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.isAccident 
                        ? 'bg-red-100 text-red-600' 
                        : event.type === 'pee' 
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-green-100 text-green-600'
                    }`}>
                      <PawPrint className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium capitalize">
                          {event.type} {event.isAccident && '(Accident)'}
                        </span>
                        <span className="text-gray-500">•</span>
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500">{formatTime(event.timestamp)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                        {event.notes && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-32">{event.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingEvent(event)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteEvent(event.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
      )}

      {/* Edit Dialog */}
      {editingEvent && (
        <EventDialog
          event={editingEvent}
          onSave={handleSaveEdit}
          onCancel={() => setEditingEvent(null)}
          title="Edit Event"
        />
      )}

      {/* Add Dialog */}
      {showAddDialog && (
        <EventDialog
          event={{
            id: '',
            type: 'pee',
            timestamp: new Date(),
            location: 'Outside',
            isAccident: false,
            notes: ''
          }}
          onSave={(event) => {
            // This will be handled by the parent component's addPottyEvent
            setShowAddDialog(false);
          }}
          onCancel={() => setShowAddDialog(false)}
          title="Add Event"
          isNew
        />
      )}
    </div>
  );
};

// Event Dialog Component
interface EventDialogProps {
  event: PottyEvent;
  onSave: (event: PottyEvent) => void;
  onCancel: () => void;
  title: string;
  isNew?: boolean;
}

const EventDialog: React.FC<EventDialogProps> = ({ event, onSave, onCancel, title, isNew }) => {
  const [formData, setFormData] = useState(event);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={formData.type} onValueChange={(value: 'pee' | 'poop') => 
              setFormData(prev => ({ ...prev, type: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pee">Pee</SelectItem>
                <SelectItem value="poop">Poop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Date & Time</Label>
            <Input
              type="datetime-local"
              value={formData.timestamp.toISOString().slice(0, 16)}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                timestamp: new Date(e.target.value)
              }))}
            />
          </div>
          
          <div>
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Outside, Kitchen, Living room"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isAccident}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAccident: checked }))}
            />
            <Label>This was an accident</Label>
          </div>
          
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isNew ? 'Add' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};