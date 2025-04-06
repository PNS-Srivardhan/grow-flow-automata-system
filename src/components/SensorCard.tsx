
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Thermometer, Wind, Zap } from "lucide-react";
import { cn } from '@/lib/utils';
import { SensorReading } from '@/context/HydroponicsContext';

interface SensorCardProps {
  title: string;
  reading: SensorReading;
  type: 'temperature' | 'water' | 'humidity' | 'ph' | 'tds';
  className?: string;
}

const SensorCard = ({ title, reading, type, className }: SensorCardProps) => {
  const getIcon = () => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="h-6 w-6" />;
      case 'water':
        return <Droplet className="h-6 w-6" />;
      case 'humidity':
        return <Wind className="h-6 w-6" />;
      case 'ph':
      case 'tds':
        return <Zap className="h-6 w-6" />;
    }
  };

  const getStatusColor = () => {
    switch (reading.status) {
      case 'normal':
        return 'text-hydroponics-green';
      case 'warning':
        return 'text-hydroponics-warning';
      case 'critical':
        return 'text-hydroponics-critical';
    }
  };

  const getBorderColor = () => {
    switch (reading.status) {
      case 'normal':
        return 'border-hydroponics-green';
      case 'warning':
        return 'border-hydroponics-warning';
      case 'critical':
        return 'border-hydroponics-critical';
    }
  };

  return (
    <Card className={cn("transition-all", 
      reading.status !== 'normal' && 'animate-pulse-slow',
      reading.status === 'critical' && 'border-2',
      getBorderColor(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className={cn("p-1 rounded-full", 
          reading.status === 'normal' && 'bg-hydroponics-green/10',
          reading.status === 'warning' && 'bg-hydroponics-warning/10',
          reading.status === 'critical' && 'bg-hydroponics-critical/10'
        )}>
          <div className={cn(getStatusColor())}>
            {getIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-end gap-1">
          {reading.value}
          <span className="text-sm text-muted-foreground ml-1">{reading.unit}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorCard;
