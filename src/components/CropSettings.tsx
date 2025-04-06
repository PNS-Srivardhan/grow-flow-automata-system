
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CropConfig } from '@/context/HydroponicsContext';

interface CropSettingsProps {
  crop: CropConfig | null;
  onUpdate: (config: CropConfig) => void;
}

const CropSettings = ({ crop, onUpdate }: CropSettingsProps) => {
  const [config, setConfig] = useState<CropConfig | null>(crop);

  useEffect(() => {
    setConfig(crop);
  }, [crop]);

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crop Settings</CardTitle>
          <CardDescription>No crop selected</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig({
      ...config,
      [name]: parseFloat(value)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config) {
      onUpdate(config);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Crop Settings: {config.name}</CardTitle>
        <CardDescription>Configure optimal growing conditions for {config.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAirTemp">Min Air Temp (°C)</Label>
              <Input
                id="minAirTemp"
                name="minAirTemp"
                type="number"
                step="0.1"
                value={config.minAirTemp}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAirTemp">Max Air Temp (°C)</Label>
              <Input
                id="maxAirTemp"
                name="maxAirTemp"
                type="number"
                step="0.1"
                value={config.maxAirTemp}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minWaterTemp">Min Water Temp (°C)</Label>
              <Input
                id="minWaterTemp"
                name="minWaterTemp"
                type="number"
                step="0.1"
                value={config.minWaterTemp}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxWaterTemp">Max Water Temp (°C)</Label>
              <Input
                id="maxWaterTemp"
                name="maxWaterTemp"
                type="number"
                step="0.1"
                value={config.maxWaterTemp}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minHumidity">Min Humidity (%)</Label>
              <Input
                id="minHumidity"
                name="minHumidity"
                type="number"
                value={config.minHumidity}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxHumidity">Max Humidity (%)</Label>
              <Input
                id="maxHumidity"
                name="maxHumidity"
                type="number"
                value={config.maxHumidity}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minPH">Min pH</Label>
              <Input
                id="minPH"
                name="minPH"
                type="number"
                step="0.1"
                value={config.minPH}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPH">Max pH</Label>
              <Input
                id="maxPH"
                name="maxPH"
                type="number"
                step="0.1"
                value={config.maxPH}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minTDS">Min TDS (ppm)</Label>
              <Input
                id="minTDS"
                name="minTDS"
                type="number"
                value={config.minTDS}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTDS">Max TDS (ppm)</Label>
              <Input
                id="maxTDS"
                name="maxTDS"
                type="number"
                value={config.maxTDS}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-hydroponics-teal hover:bg-hydroponics-blue-dark">
            Update Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CropSettings;
