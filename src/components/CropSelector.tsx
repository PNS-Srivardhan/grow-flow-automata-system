
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CropConfig } from '@/context/HydroponicsContext';

interface CropSelectorProps {
  crops: CropConfig[];
  currentCrop: CropConfig | null;
  onCropChange: (cropId: string) => void;
}

const CropSelector = ({ crops, currentCrop, onCropChange }: CropSelectorProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="crop">Current Crop</Label>
      <Select value={currentCrop?.id} onValueChange={onCropChange}>
        <SelectTrigger id="crop" className="bg-white">
          <SelectValue placeholder="Select crop" />
        </SelectTrigger>
        <SelectContent>
          {crops.map((crop) => (
            <SelectItem key={crop.id} value={crop.id}>
              {crop.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CropSelector;
