
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SensorCard from '@/components/SensorCard';
import DeviceControl from '@/components/DeviceControl';
import AlertDisplay from '@/components/AlertDisplay';
import SensorChart from '@/components/SensorChart';
import SystemStatus from '@/components/SystemStatus';
import DashboardHeader from '@/components/DashboardHeader';
import CropSettings from '@/components/CropSettings';
import ThresholdDisplay from '@/components/ThresholdDisplay';
import AddCropForm from '@/components/AddCropForm';
import ApiInstructions from '@/components/ApiInstructions';
import GenerateDataButton from '@/components/GenerateDataButton';
import { useToast } from '@/hooks/use-toast';

import { 
  useCrops, 
  useLatestSensorReading, 
  useHistoricalReadings,
  useDevices,
  useToggleDevice,
  useAlerts,
  useDismissAlert,
  useMarkAllAlertsRead,
  useUpdateCrop,
  subscribeToSensorUpdates,
  subscribeToDeviceUpdates,
  subscribeToAlertUpdates
} from '@/services/supabaseService';

const Dashboard = () => {
  const { toast } = useToast();
  const { data: crops = [], isLoading: isLoadingCrops } = useCrops();
  const { data: latestReading, isLoading: isLoadingSensor } = useLatestSensorReading();
  const { data: historicalData = [], isLoading: isLoadingHistorical } = useHistoricalReadings();
  const { data: devices = [], isLoading: isLoadingDevices } = useDevices();
  const { data: alerts = [], isLoading: isLoadingAlerts } = useAlerts();
  const toggleDevice = useToggleDevice();
  const dismissAlert = useDismissAlert();
  const markAllAsRead = useMarkAllAlertsRead();
  const updateCrop = useUpdateCrop();
  
  const [currentCropId, setCurrentCropId] = React.useState<string | null>(null);
  const [isConnected, setIsConnected] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  // Initialize current crop once data is loaded
  useEffect(() => {
    if (crops.length > 0 && !currentCropId) {
      setCurrentCropId(crops[0].id);
    }
  }, [crops, currentCropId]);

  // Get the current crop object
  const currentCrop = React.useMemo(() => {
    return crops.find(crop => crop.id === currentCropId) || null;
  }, [crops, currentCropId]);

  // Format latest reading for display
  const formatSensorReading = (value: number, unit: string, status: "normal" | "warning" | "critical"): { value: number, unit: string, status: "normal" | "warning" | "critical" } => {
    return { value, unit, status };
  };

  // Format sensors data
  const sensors = React.useMemo(() => {
    if (!latestReading) {
      return {
        airTemp: formatSensorReading(0, "°C", "normal"),
        waterTemp: formatSensorReading(0, "°C", "normal"),
        humidity: formatSensorReading(0, "%", "normal"),
        ph: formatSensorReading(0, "pH", "normal"),
        tds: formatSensorReading(0, "ppm", "normal")
      };
    }
    
    return {
      airTemp: formatSensorReading(latestReading.air_temp, "°C", latestReading.status.airTemp),
      waterTemp: formatSensorReading(latestReading.water_temp, "°C", latestReading.status.waterTemp),
      humidity: formatSensorReading(latestReading.humidity, "%", latestReading.status.humidity),
      ph: formatSensorReading(latestReading.ph, "pH", latestReading.status.ph),
      tds: formatSensorReading(latestReading.tds, "ppm", latestReading.status.tds)
    };
  }, [latestReading]);

  // Format historical data for charts
  const formattedHistoricalData = React.useMemo(() => {
    return historicalData.map(reading => ({
      timestamp: new Date(reading.created_at),
      airTemp: reading.air_temp,
      waterTemp: reading.water_temp,
      humidity: reading.humidity,
      ph: reading.ph,
      tds: reading.tds
    })).reverse();
  }, [historicalData]);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to new sensor readings
    const unsubscribeSensor = subscribeToSensorUpdates((payload) => {
      setLastUpdated(new Date());
      if (payload.new) {
        toast({
          title: "New Sensor Reading",
          description: "Sensor data has been updated",
        });
      }
    });

    // Subscribe to device updates
    const unsubscribeDevice = subscribeToDeviceUpdates((payload) => {
      if (payload.new) {
        toast({
          title: "Device Updated",
          description: `${payload.new.name} is now ${payload.new.is_on ? 'on' : 'off'}`,
        });
      }
    });

    // Subscribe to new alerts
    const unsubscribeAlert = subscribeToAlertUpdates((payload) => {
      if (payload.new && payload.new.type === 'critical') {
        toast({
          title: "Critical Alert",
          description: payload.new.message,
          variant: "destructive",
        });
      }
    });

    // Simulate occasional connection issues
    const connectionInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 3000 + Math.random() * 5000);
      }
    }, 30000);

    return () => {
      unsubscribeSensor();
      unsubscribeDevice();
      unsubscribeAlert();
      clearInterval(connectionInterval);
    };
  }, [toast]);

  // Handle device toggle
  const handleToggleDevice = (id: string) => {
    toggleDevice.mutate(id);
  };

  // Handle crop update
  const handleUpdateCrop = (config: any) => {
    updateCrop.mutate(config);
  };

  // Handle alert dismiss
  const handleDismissAlert = (id: string) => {
    dismissAlert.mutate(id);
  };

  // Mark all alerts as read
  const handleMarkAllAlertsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <div className="px-4 py-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">
      <DashboardHeader 
        crops={crops} 
        currentCrop={currentCrop} 
        onCropChange={setCurrentCropId}
        isLoading={isLoadingCrops}
      />
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Generate Data Button for Testing */}
          <div className="flex justify-end">
            <GenerateDataButton />
          </div>
          
          {/* Sensor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <SensorCard 
              title="Air Temperature" 
              reading={sensors.airTemp} 
              type="temperature"
              isLoading={isLoadingSensor}
            />
            <SensorCard 
              title="Water Temperature" 
              reading={sensors.waterTemp} 
              type="water"
              isLoading={isLoadingSensor}
            />
            <SensorCard 
              title="Humidity" 
              reading={sensors.humidity} 
              type="humidity"
              isLoading={isLoadingSensor}
            />
            <SensorCard 
              title="pH Level" 
              reading={sensors.ph} 
              type="ph"
              isLoading={isLoadingSensor}
            />
            <SensorCard 
              title="TDS Level" 
              reading={sensors.tds} 
              type="tds"
              isLoading={isLoadingSensor}
            />
          </div>

          {/* Status and Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SystemStatus isConnected={isConnected} lastUpdated={lastUpdated} />
              <ThresholdDisplay crop={currentCrop} isLoading={isLoadingCrops} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {devices.slice(0, 6).map((device) => (
                <DeviceControl 
                  key={device.id} 
                  device={{
                    id: device.id,
                    name: device.name,
                    isOn: device.is_on,
                    type: device.device_type
                  }}
                  onToggle={handleToggleDevice}
                  isLoading={isLoadingDevices || toggleDevice.isPending}
                />
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <SensorChart 
                data={formattedHistoricalData} 
                sensorType="airTemp" 
                title="Air Temperature History" 
                color="#0EA5E9"
                isLoading={isLoadingHistorical}
              />
              <SensorChart 
                data={formattedHistoricalData} 
                sensorType="waterTemp" 
                title="Water Temperature History" 
                color="#0369A1"
                isLoading={isLoadingHistorical}
              />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <SensorChart 
                data={formattedHistoricalData} 
                sensorType="humidity" 
                title="Humidity History" 
                color="#10B981"
                isLoading={isLoadingHistorical}
              />
              <SensorChart 
                data={formattedHistoricalData} 
                sensorType="ph" 
                title="pH Level History" 
                color="#8B5CF6"
                isLoading={isLoadingHistorical}
              />
            </div>
          </div>

          {/* Alerts */}
          <div>
            <AlertDisplay 
              alerts={alerts.map(alert => ({
                id: alert.id,
                message: alert.message,
                timestamp: new Date(alert.created_at),
                type: alert.type as "warning" | "critical",
                sensorType: alert.sensor_type as any,
                isRead: alert.is_read
              }))} 
              onDismiss={handleDismissAlert} 
              onMarkAllAsRead={handleMarkAllAlertsRead}
              isLoading={isLoadingAlerts}
            />
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {devices.map((device) => (
              <DeviceControl 
                key={device.id} 
                device={{
                  id: device.id,
                  name: device.name,
                  isOn: device.is_on,
                  type: device.device_type
                }}
                onToggle={handleToggleDevice}
                isLoading={isLoadingDevices || toggleDevice.isPending}
              />
            ))}
          </div>
          
          <div>
            <SensorChart 
              data={formattedHistoricalData} 
              sensorType="tds" 
              title="Nutrient Level History" 
              color="#F97316"
              isLoading={isLoadingHistorical}
            />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Crop Settings</h2>
                <AddCropForm />
              </div>
              
              {currentCrop && (
                <CropSettings 
                  crop={{
                    id: currentCrop.id,
                    name: currentCrop.name,
                    minAirTemp: currentCrop.min_air_temp,
                    maxAirTemp: currentCrop.max_air_temp,
                    minWaterTemp: currentCrop.min_water_temp,
                    maxWaterTemp: currentCrop.max_water_temp,
                    minHumidity: currentCrop.min_humidity,
                    maxHumidity: currentCrop.max_humidity,
                    minPH: currentCrop.min_ph,
                    maxPH: currentCrop.max_ph,
                    minTDS: currentCrop.min_tds,
                    maxTDS: currentCrop.max_tds
                  }} 
                  onUpdate={(updatedCrop) => {
                    handleUpdateCrop({
                      id: updatedCrop.id,
                      name: updatedCrop.name,
                      min_air_temp: updatedCrop.minAirTemp,
                      max_air_temp: updatedCrop.maxAirTemp,
                      min_water_temp: updatedCrop.minWaterTemp,
                      max_water_temp: updatedCrop.maxWaterTemp,
                      min_humidity: updatedCrop.minHumidity,
                      max_humidity: updatedCrop.maxHumidity,
                      min_ph: updatedCrop.minPH,
                      max_ph: updatedCrop.maxPH,
                      min_tds: updatedCrop.minTDS,
                      max_tds: updatedCrop.maxTDS
                    });
                  }}
                  isLoading={isLoadingCrops || updateCrop.isPending}
                />
              )}
              
              <ApiInstructions />
            </div>
            <div>
              <AlertDisplay 
                alerts={alerts.map(alert => ({
                  id: alert.id,
                  message: alert.message,
                  timestamp: new Date(alert.created_at),
                  type: alert.type as "warning" | "critical",
                  sensorType: alert.sensor_type as any,
                  isRead: alert.is_read
                }))} 
                onDismiss={handleDismissAlert} 
                onMarkAllAsRead={handleMarkAllAlertsRead}
                isLoading={isLoadingAlerts}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Index = () => (
  <Dashboard />
);

export default Index;
