
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Fan, Droplet, Thermometer, CloudSun, LampDesk } from "lucide-react";
import { DeviceStatus } from '@/context/HydroponicsContext';

interface DeviceControlProps {
  device: DeviceStatus;
  onToggle: (id: string) => void;
}

const DeviceControl = ({ device, onToggle }: DeviceControlProps) => {
  const getIcon = () => {
    switch (device.type) {
      case 'pump':
        return <Droplet className="h-5 w-5" />;
      case 'fan':
        return <Fan className="h-5 w-5" />;
      case 'heater':
        return <Thermometer className="h-5 w-5" />;
      case 'humidifier':
        return <CloudSun className="h-5 w-5" />;
      case 'light':
        return <LampDesk className="h-5 w-5" />;
      default:
        return <Droplet className="h-5 w-5" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className={`p-1 rounded-full ${device.isOn ? 'bg-hydroponics-teal/20' : 'bg-gray-200'}`}>
            <div className={device.isOn ? 'text-hydroponics-teal' : 'text-gray-500'}>
              {getIcon()}
            </div>
          </div>
          {device.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 flex justify-between items-center">
        <div className={`text-sm ${device.isOn ? 'text-hydroponics-teal font-medium' : 'text-gray-500'}`}>
          {device.isOn ? 'Running' : 'Off'}
        </div>
        <Switch
          checked={device.isOn}
          onCheckedChange={() => onToggle(device.id)}
          className="data-[state=checked]:bg-hydroponics-teal"
        />
      </CardContent>
    </Card>
  );
};

export default DeviceControl;
