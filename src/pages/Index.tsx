
import React, { useState } from 'react';
import { 
  useHydroponics, 
  HydroponicsProvider
} from '@/context/HydroponicsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SensorCard from '@/components/SensorCard';
import DeviceControl from '@/components/DeviceControl';
import AlertDisplay from '@/components/AlertDisplay';
import SensorChart from '@/components/SensorChart';
import SystemStatus from '@/components/SystemStatus';
import DashboardHeader from '@/components/DashboardHeader';
import CropSettings from '@/components/CropSettings';
import ThresholdDisplay from '@/components/ThresholdDisplay';

const Dashboard = () => {
  const { 
    sensors, 
    devices, 
    toggleDevice, 
    currentCrop, 
    crops, 
    setCurrentCrop,
    alerts,
    dismissAlert,
    markAllAlertsAsRead,
    historicalData,
    isConnected,
    lastUpdated,
    updateCropConfig,
  } = useHydroponics();

  return (
    <div className="px-4 py-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">
      <DashboardHeader 
        crops={crops} 
        currentCrop={currentCrop} 
        onCropChange={setCurrentCrop} 
      />
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Sensor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <SensorCard 
              title="Air Temperature" 
              reading={sensors.airTemp} 
              type="temperature"
            />
            <SensorCard 
              title="Water Temperature" 
              reading={sensors.waterTemp} 
              type="water"
            />
            <SensorCard 
              title="Humidity" 
              reading={sensors.humidity} 
              type="humidity"
            />
            <SensorCard 
              title="pH Level" 
              reading={sensors.ph} 
              type="ph"
            />
            <SensorCard 
              title="TDS Level" 
              reading={sensors.tds} 
              type="tds"
            />
          </div>

          {/* Status and Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SystemStatus isConnected={isConnected} lastUpdated={lastUpdated} />
              <ThresholdDisplay crop={currentCrop} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {devices.slice(0, 6).map((device) => (
                <DeviceControl 
                  key={device.id} 
                  device={device} 
                  onToggle={toggleDevice} 
                />
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <SensorChart 
                data={historicalData} 
                sensorType="airTemp" 
                title="Air Temperature History" 
                color="#0EA5E9" 
              />
              <SensorChart 
                data={historicalData} 
                sensorType="waterTemp" 
                title="Water Temperature History" 
                color="#0369A1" 
              />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <SensorChart 
                data={historicalData} 
                sensorType="humidity" 
                title="Humidity History" 
                color="#10B981" 
              />
              <SensorChart 
                data={historicalData} 
                sensorType="ph" 
                title="pH Level History" 
                color="#8B5CF6" 
              />
            </div>
          </div>

          {/* Alerts */}
          <div>
            <AlertDisplay 
              alerts={alerts} 
              onDismiss={dismissAlert} 
              onMarkAllAsRead={markAllAlertsAsRead} 
            />
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {devices.map((device) => (
              <DeviceControl 
                key={device.id} 
                device={device} 
                onToggle={toggleDevice} 
              />
            ))}
          </div>
          
          <div>
            <SensorChart 
              data={historicalData} 
              sensorType="tds" 
              title="Nutrient Level History" 
              color="#F97316" 
            />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CropSettings 
                crop={currentCrop} 
                onUpdate={updateCropConfig} 
              />
            </div>
            <div>
              <AlertDisplay 
                alerts={alerts} 
                onDismiss={dismissAlert} 
                onMarkAllAsRead={markAllAlertsAsRead} 
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Index = () => (
  <HydroponicsProvider>
    <Dashboard />
  </HydroponicsProvider>
);

export default Index;
