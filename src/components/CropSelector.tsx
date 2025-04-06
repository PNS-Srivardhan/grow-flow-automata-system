
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crop } from '@/services/supabaseService';

interface CropSelectorProps {
  crops: Crop[];
  currentCrop: Crop | null;
  onCropChange: (cropId: string) => void;
  isLoading?: boolean;
}

const CropSelector = ({ crops, currentCrop, onCropChange, isLoading = false }: CropSelectorProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="crop">Current Crop</Label>
      <Select 
        value={currentCrop?.id} 
        onValueChange={onCropChange}
        disabled={isLoading}
      >
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
