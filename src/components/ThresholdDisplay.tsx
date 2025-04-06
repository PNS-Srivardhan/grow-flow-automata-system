
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CropConfig } from '@/context/HydroponicsContext';

interface ThresholdDisplayProps {
  crop: CropConfig | null;
}

const ThresholdDisplay = ({ crop }: ThresholdDisplayProps) => {
  if (!crop) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Current Thresholds: {crop.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Air Temp:</span>
            <span className="font-medium">{crop.minAirTemp}-{crop.maxAirTemp} °C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Water Temp:</span>
            <span className="font-medium">{crop.minWaterTemp}-{crop.maxWaterTemp} °C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Humidity:</span>
            <span className="font-medium">{crop.minHumidity}-{crop.maxHumidity} %</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">pH:</span>
            <span className="font-medium">{crop.minPH}-{crop.maxPH}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">TDS:</span>
            <span className="font-medium">{crop.minTDS}-{crop.maxTDS} ppm</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThresholdDisplay;
