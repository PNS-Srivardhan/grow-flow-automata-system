
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crop } from '@/services/supabaseService';
import { Skeleton } from '@/components/ui/skeleton';

interface ThresholdDisplayProps {
  crop: Crop | null;
  isLoading?: boolean;
}

const ThresholdDisplay = ({ crop, isLoading = false }: ThresholdDisplayProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Current Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
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
            <span className="font-medium">{crop.min_air_temp}-{crop.max_air_temp} °C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Water Temp:</span>
            <span className="font-medium">{crop.min_water_temp}-{crop.max_water_temp} °C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Humidity:</span>
            <span className="font-medium">{crop.min_humidity}-{crop.max_humidity} %</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">pH:</span>
            <span className="font-medium">{crop.min_ph}-{crop.max_ph}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">TDS:</span>
            <span className="font-medium">{crop.min_tds}-{crop.max_tds} ppm</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThresholdDisplay;
