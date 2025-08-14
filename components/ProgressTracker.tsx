import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { PottyEvent } from '../App';

interface ProgressTrackerProps {
  events: PottyEvent[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ events }) => {
  const analytics = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // Daily success rate for last 7 days
    const dailyData = last7Days.map(date => {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate.toDateString() === date.toDateString();
      });
      
      const successes = dayEvents.filter(event => !event.isAccident).length;
      const accidents = dayEvents.filter(event => event.isAccident).length;
      const total = dayEvents.length;
      const successRate = total > 0 ? Math.round((successes / total) * 100) : 0;
      
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        successRate,
        successes,
        accidents,
        total
      };
    });

    // Overall stats
    const totalEvents = events.length;
    const successfulEvents = events.filter(event => !event.isAccident).length;
    const accidents = events.filter(event => event.isAccident).length;
    const overallSuccessRate = totalEvents > 0 ? Math.round((successfulEvents / totalEvents) * 100) : 0;

    // Event type breakdown
    const peeEvents = events.filter(event => event.type === 'pee').length;
    const poopEvents = events.filter(event => event.type === 'poop').length;
    const eventTypeData = [
      { name: 'Pee', value: peeEvents, color: '#3B82F6' },
      { name: 'Poop', value: poopEvents, color: '#10B981' }
    ];

    // Location analysis
    const locationStats = events.reduce((acc, event) => {
      const location = event.location || 'Unknown';
      if (!acc[location]) {
        acc[location] = { total: 0, accidents: 0 };
      }
      acc[location].total++;
      if (event.isAccident) {
        acc[location].accidents++;
      }
      return acc;
    }, {} as Record<string, { total: number; accidents: number }>);

    const locationData = Object.entries(locationStats).map(([location, stats]) => ({
      location,
      successRate: stats.total > 0 ? Math.round(((stats.total - stats.accidents) / stats.total) * 100) : 0,
      total: stats.total,
      accidents: stats.accidents
    })).sort((a, b) => b.total - a.total);

    // Current streak (accident-free days)
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate.toDateString() === checkDate.toDateString();
      });
      
      const hasAccident = dayEvents.some(event => event.isAccident);
      
      if (hasAccident) {
        break;
      } else if (dayEvents.length > 0) {
        currentStreak++;
      }
    }

    // Trend calculation (comparing last 3 days to previous 3 days)
    const last3Days = events.filter(event => {
      const daysDiff = Math.floor((Date.now() - event.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff < 3;
    });
    
    const previous3Days = events.filter(event => {
      const daysDiff = Math.floor((Date.now() - event.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 3 && daysDiff < 6;
    });
    
    const recentSuccessRate = last3Days.length > 0 ? 
      Math.round((last3Days.filter(e => !e.isAccident).length / last3Days.length) * 100) : 0;
    
    const previousSuccessRate = previous3Days.length > 0 ? 
      Math.round((previous3Days.filter(e => !e.isAccident).length / previous3Days.length) * 100) : 0;
    
    const trend = recentSuccessRate - previousSuccessRate;

    return {
      dailyData,
      overallSuccessRate,
      totalEvents,
      successfulEvents,
      accidents,
      eventTypeData,
      locationData,
      currentStreak,
      trend
    };
  }, [events]);

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Progress Tracker</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.overallSuccessRate}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
            {analytics.trend !== 0 && (
              <div className={`flex items-center justify-center gap-1 text-xs mt-1 ${getTrendColor(analytics.trend)}`}>
                {getTrendIcon(analytics.trend)}
                {Math.abs(analytics.trend)}% vs last 3 days
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
            <div className="text-xs text-gray-500 mt-1">Accident-free</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            7-Day Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value}%`, 'Success Rate']}
                  labelFormatter={(label) => `${label}`}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-blue-600">Success Rate: {data.successRate}%</p>
                          <p className="text-sm text-gray-600">
                            {data.successes} successes, {data.accidents} accidents
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="successRate" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Event Type Breakdown */}
      {analytics.eventTypeData.some(d => d.value > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Event Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.eventTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={60}
                      dataKey="value"
                    >
                      {analytics.eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 ml-4 space-y-2">
                {analytics.eventTypeData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <Badge variant="outline">{item.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Analysis */}
      {analytics.locationData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location Success Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.locationData.slice(0, 5).map(location => (
              <div key={location.location} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{location.location}</span>
                  {location.accidents > 0 && (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    {location.total} events
                  </div>
                  <Badge 
                    variant={location.successRate >= 80 ? 'default' : location.successRate >= 60 ? 'secondary' : 'destructive'}
                  >
                    {location.successRate}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-800 mb-3">📊 Training Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{analytics.totalEvents}</div>
              <div className="text-xs text-blue-700">Total Events</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{analytics.successfulEvents}</div>
              <div className="text-xs text-green-700">Successes</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{analytics.accidents}</div>
              <div className="text-xs text-orange-700">Accidents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {analytics.totalEvents === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No data to analyze yet</p>
            <p className="text-sm text-gray-400 mt-1">Start logging potty events to see progress insights!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};