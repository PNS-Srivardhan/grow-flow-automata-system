
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoricalData } from '@/context/HydroponicsContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

interface SensorChartProps {
  data: HistoricalData[];
  sensorType: 'airTemp' | 'waterTemp' | 'humidity' | 'ph' | 'tds';
  title: string;
  color: string;
}

const SensorChart = ({ data, sensorType, title, color }: SensorChartProps) => {
  const formatData = () => {
    return data.map(item => ({
      time: format(new Date(item.timestamp), 'HH:mm'),
      value: item[sensorType],
      fullTime: item.timestamp
    }));
  };

  const getYAxisFormatter = () => {
    switch (sensorType) {
      case 'airTemp':
      case 'waterTemp':
        return (value: number) => `${value}°C`;
      case 'humidity':
        return (value: number) => `${value}%`;
      case 'ph':
        return (value: number) => `${value}`;
      case 'tds':
        return (value: number) => `${value}`;
    }
  };

  const getTooltipFormatter = (value: number) => {
    switch (sensorType) {
      case 'airTemp':
      case 'waterTemp':
        return `${value}°C`;
      case 'humidity':
        return `${value}%`;
      case 'ph':
        return `${value} pH`;
      case 'tds':
        return `${value} ppm`;
    }
  };

  const getYAxisDomain = () => {
    switch (sensorType) {
      case 'airTemp':
        return [15, 35];
      case 'waterTemp':
        return [15, 30];
      case 'humidity':
        return [40, 90];
      case 'ph':
        return [4.5, 7.5];
      case 'tds':
        return [500, 1800];
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formatData()} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${sensorType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }} 
                tickCount={6} 
                minTickGap={15}
                tickFormatter={(value) => value}
              />
              <YAxis 
                domain={getYAxisDomain()}
                tickFormatter={getYAxisFormatter()} 
                tick={{ fontSize: 10 }} 
                width={40}
              />
              <Tooltip 
                formatter={(value: number) => [getTooltipFormatter(value), title]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                fillOpacity={1}
                fill={`url(#gradient-${sensorType})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorChart;
