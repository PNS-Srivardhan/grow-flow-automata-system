
import React from 'react';
import { Leaf } from 'lucide-react';
import CropSelector from './CropSelector';
import { CropConfig } from '@/context/HydroponicsContext';

interface DashboardHeaderProps {
  crops: CropConfig[];
  currentCrop: CropConfig | null;
  onCropChange: (cropId: string) => void;
}

const DashboardHeader = ({ crops, currentCrop, onCropChange }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6">
      <div className="flex items-center">
        <div className="bg-gradient-to-r from-hydroponics-teal to-hydroponics-green p-2 rounded-xl mr-3">
          <Leaf className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Hydroponics Control System</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage your growing environment</p>
        </div>
      </div>
      <div className="w-full md:w-48">
        <CropSelector 
          crops={crops} 
          currentCrop={currentCrop} 
          onCropChange={onCropChange} 
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
