
import React from 'react';
import { AlertItem } from '@/context/HydroponicsContext';
import { Bell, CheckCircle2, Thermometer, Droplet, Wind, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface AlertDisplayProps {
  alerts: AlertItem[];
  onDismiss: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const AlertDisplay = ({ alerts, onDismiss, onMarkAllAsRead }: AlertDisplayProps) => {
  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  const getSensorIcon = (sensorType: AlertItem['sensorType']) => {
    switch (sensorType) {
      case 'airTemp':
        return <Thermometer className="h-4 w-4" />;
      case 'waterTemp':
        return <Droplet className="h-4 w-4" />;
      case 'humidity':
        return <Wind className="h-4 w-4" />;
      case 'ph':
      case 'tds':
        return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-hydroponics-teal" />
          <h3 className="font-medium">Alerts</h3>
          {unreadCount > 0 && (
            <div className="bg-hydroponics-teal text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </div>
          )}
        </div>
        {alerts.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[300px]">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            No alerts
          </div>
        ) : (
          <div className="divide-y">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 hover:bg-gray-50 transition-colors ${alert.isRead ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${
                    alert.type === 'critical' 
                      ? 'bg-hydroponics-critical/10 text-hydroponics-critical' 
                      : 'bg-hydroponics-warning/10 text-hydroponics-warning'
                  }`}>
                    {getSensorIcon(alert.sensorType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  {!alert.isRead && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="p-1 h-auto" 
                      onClick={() => onDismiss(alert.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default AlertDisplay;
