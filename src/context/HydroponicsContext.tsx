
import React, { createContext, useContext, useState, useEffect } from "react";

export type SensorReading = {
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
};

export type DeviceStatus = {
  id: string;
  name: string;
  isOn: boolean;
  type: "pump" | "fan" | "heater" | "humidifier" | "light" | "other";
};

export type CropConfig = {
  id: string;
  name: string;
  minAirTemp: number;
  maxAirTemp: number;
  minWaterTemp: number;
  maxWaterTemp: number;
  minHumidity: number;
  maxHumidity: number;
  minPH: number;
  maxPH: number;
  minTDS: number;
  maxTDS: number;
};

export type AlertItem = {
  id: string;
  message: string;
  timestamp: Date;
  type: "warning" | "critical";
  sensorType: "airTemp" | "waterTemp" | "humidity" | "ph" | "tds";
  isRead: boolean;
};

export type HistoricalData = {
  timestamp: Date;
  airTemp: number;
  waterTemp: number;
  humidity: number;
  ph: number;
  tds: number;
};

interface HydroponicsContextType {
  sensors: {
    airTemp: SensorReading;
    waterTemp: SensorReading;
    humidity: SensorReading;
    ph: SensorReading;
    tds: SensorReading;
  };
  devices: DeviceStatus[];
  currentCrop: CropConfig | null;
  crops: CropConfig[];
  alerts: AlertItem[];
  historicalData: HistoricalData[];
  isConnected: boolean;
  lastUpdated: Date | null;
  toggleDevice: (id: string) => void;
  updateCropConfig: (config: CropConfig) => void;
  setCurrentCrop: (cropId: string) => void;
  dismissAlert: (id: string) => void;
  markAllAlertsAsRead: () => void;
}

const defaultCrops: CropConfig[] = [
  {
    id: "lettuce",
    name: "Lettuce",
    minAirTemp: 15,
    maxAirTemp: 24,
    minWaterTemp: 18,
    maxWaterTemp: 23,
    minHumidity: 50,
    maxHumidity: 70,
    minPH: 5.5,
    maxPH: 6.5,
    minTDS: 560,
    maxTDS: 840
  },
  {
    id: "basil",
    name: "Basil",
    minAirTemp: 18,
    maxAirTemp: 30,
    minWaterTemp: 20,
    maxWaterTemp: 25,
    minHumidity: 60,
    maxHumidity: 80,
    minPH: 5.5,
    maxPH: 6.5,
    minTDS: 700,
    maxTDS: 1120
  },
  {
    id: "strawberry",
    name: "Strawberry",
    minAirTemp: 18,
    maxAirTemp: 26,
    minWaterTemp: 18,
    maxWaterTemp: 22,
    minHumidity: 65,
    maxHumidity: 75,
    minPH: 5.5,
    maxPH: 6.2,
    minTDS: 840,
    maxTDS: 1260
  },
  {
    id: "tomato",
    name: "Tomato",
    minAirTemp: 20,
    maxAirTemp: 30,
    minWaterTemp: 20,
    maxWaterTemp: 26,
    minHumidity: 60,
    maxHumidity: 80,
    minPH: 5.8,
    maxPH: 6.3,
    minTDS: 1120,
    maxTDS: 1540
  }
];

// Initialize default devices
const defaultDevices: DeviceStatus[] = [
  { id: "nutrient-pump", name: "Nutrient Pump", isOn: false, type: "pump" },
  { id: "water-pump", name: "Water Circulation", isOn: true, type: "pump" },
  { id: "fan", name: "Ventilation Fan", isOn: true, type: "fan" },
  { id: "heater", name: "Water Heater", isOn: false, type: "heater" },
  { id: "humidifier", name: "Humidifier", isOn: false, type: "humidifier" },
  { id: "grow-light", name: "Grow Light", isOn: true, type: "light" },
];

const HydroponicsContext = createContext<HydroponicsContextType | undefined>(undefined);

export const HydroponicsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sensors, setSensors] = useState({
    airTemp: { value: 23.5, unit: "°C", status: "normal" as const },
    waterTemp: { value: 21.2, unit: "°C", status: "normal" as const },
    humidity: { value: 65, unit: "%", status: "normal" as const },
    ph: { value: 6.1, unit: "pH", status: "normal" as const },
    tds: { value: 750, unit: "ppm", status: "normal" as const },
  });
  
  const [devices, setDevices] = useState<DeviceStatus[]>(defaultDevices);
  const [crops, setCrops] = useState<CropConfig[]>(defaultCrops);
  const [currentCrop, setCurrentCrop] = useState<CropConfig | null>(defaultCrops[0]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  // Simulate data updates
  useEffect(() => {
    // Generate initial historical data (past 24 hours)
    const generateInitialHistoricalData = () => {
      const data: HistoricalData[] = [];
      const now = new Date();
      
      for (let i = 24; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        const baseAirTemp = 22 + Math.sin(i/4) * 3;
        const baseWaterTemp = 20 + Math.sin(i/8) * 2;
        const baseHumidity = 65 + Math.sin(i/6) * 8;
        const basePh = 6.0 + Math.sin(i/12) * 0.4;
        const baseTds = 800 + Math.sin(i/6) * 150;
        
        data.push({
          timestamp,
          airTemp: parseFloat(baseAirTemp.toFixed(1)),
          waterTemp: parseFloat(baseWaterTemp.toFixed(1)),
          humidity: parseFloat(baseHumidity.toFixed(0)),
          ph: parseFloat(basePh.toFixed(1)),
          tds: parseFloat(baseTds.toFixed(0)),
        });
      }
      
      setHistoricalData(data);
    };
    
    generateInitialHistoricalData();
    
    // Update sensors data every 2 seconds with random variations
    const updateInterval = setInterval(() => {
      const now = new Date();
      
      // Add small random variations to sensor values
      setSensors(prev => {
        const newAirTemp = Math.max(15, Math.min(35, prev.airTemp.value + (Math.random() - 0.5) * 0.3));
        const newWaterTemp = Math.max(15, Math.min(30, prev.waterTemp.value + (Math.random() - 0.5) * 0.2));
        const newHumidity = Math.max(40, Math.min(90, prev.humidity.value + (Math.random() - 0.5) * 2));
        const newPh = Math.max(4.5, Math.min(7.5, prev.ph.value + (Math.random() - 0.5) * 0.1));
        const newTds = Math.max(500, Math.min(1800, prev.tds.value + (Math.random() - 0.5) * 20));
        
        // Determine status based on thresholds from current crop
        const getStatus = (
          value: number, 
          min: number, 
          max: number
        ): "normal" | "warning" | "critical" => {
          if (!currentCrop) return "normal";
          if (value < min - (min * 0.1) || value > max + (max * 0.1)) return "critical";
          if (value < min || value > max) return "warning";
          return "normal";
        };
        
        const airTempStatus = currentCrop 
          ? getStatus(newAirTemp, currentCrop.minAirTemp, currentCrop.maxAirTemp) 
          : "normal";
        
        const waterTempStatus = currentCrop 
          ? getStatus(newWaterTemp, currentCrop.minWaterTemp, currentCrop.maxWaterTemp) 
          : "normal";
        
        const humidityStatus = currentCrop 
          ? getStatus(newHumidity, currentCrop.minHumidity, currentCrop.maxHumidity) 
          : "normal";
        
        const phStatus = currentCrop 
          ? getStatus(newPh, currentCrop.minPH, currentCrop.maxPH) 
          : "normal";
        
        const tdsStatus = currentCrop 
          ? getStatus(newTds, currentCrop.minTDS, currentCrop.maxTDS) 
          : "normal";
        
        return {
          airTemp: { value: parseFloat(newAirTemp.toFixed(1)), unit: "°C", status: airTempStatus },
          waterTemp: { value: parseFloat(newWaterTemp.toFixed(1)), unit: "°C", status: waterTempStatus },
          humidity: { value: parseFloat(newHumidity.toFixed(0)), unit: "%", status: humidityStatus },
          ph: { value: parseFloat(newPh.toFixed(1)), unit: "pH", status: phStatus },
          tds: { value: parseFloat(newTds.toFixed(0)), unit: "ppm", status: tdsStatus },
        };
      });
      
      setLastUpdated(now);
      
      // Periodically add to historical data (every 1 hour)
      if (now.getMinutes() === 0 && now.getSeconds() < 2) {
        setHistoricalData(prev => {
          const newData = [...prev];
          if (newData.length > 24) {
            newData.shift();
          }
          newData.push({
            timestamp: now,
            airTemp: sensors.airTemp.value,
            waterTemp: sensors.waterTemp.value,
            humidity: sensors.humidity.value,
            ph: sensors.ph.value,
            tds: sensors.tds.value,
          });
          return newData;
        });
      }
    }, 2000);
    
    // Check conditions and generate alerts every minute
    const alertInterval = setInterval(() => {
      if (!currentCrop) return;
      
      const newAlerts: AlertItem[] = [];
      
      if (sensors.airTemp.status !== "normal") {
        newAlerts.push({
          id: `air-temp-${Date.now()}`,
          message: `Air temperature (${sensors.airTemp.value}°C) ${sensors.airTemp.status === "warning" ? "approaching" : "exceeds"} limits for ${currentCrop.name}`,
          timestamp: new Date(),
          type: sensors.airTemp.status,
          sensorType: "airTemp",
          isRead: false,
        });
      }
      
      if (sensors.waterTemp.status !== "normal") {
        newAlerts.push({
          id: `water-temp-${Date.now()}`,
          message: `Water temperature (${sensors.waterTemp.value}°C) ${sensors.waterTemp.status === "warning" ? "approaching" : "exceeds"} limits for ${currentCrop.name}`,
          timestamp: new Date(),
          type: sensors.waterTemp.status,
          sensorType: "waterTemp",
          isRead: false,
        });
      }
      
      if (sensors.humidity.status !== "normal") {
        newAlerts.push({
          id: `humidity-${Date.now()}`,
          message: `Humidity (${sensors.humidity.value}%) ${sensors.humidity.status === "warning" ? "approaching" : "exceeds"} limits for ${currentCrop.name}`,
          timestamp: new Date(),
          type: sensors.humidity.status,
          sensorType: "humidity",
          isRead: false,
        });
      }
      
      if (sensors.ph.status !== "normal") {
        newAlerts.push({
          id: `ph-${Date.now()}`,
          message: `pH level (${sensors.ph.value}) ${sensors.ph.status === "warning" ? "approaching" : "exceeds"} limits for ${currentCrop.name}`,
          timestamp: new Date(),
          type: sensors.ph.status,
          sensorType: "ph",
          isRead: false,
        });
      }
      
      if (sensors.tds.status !== "normal") {
        newAlerts.push({
          id: `tds-${Date.now()}`,
          message: `Nutrient level (${sensors.tds.value}ppm) ${sensors.tds.status === "warning" ? "approaching" : "exceeds"} limits for ${currentCrop.name}`,
          timestamp: new Date(),
          type: sensors.tds.status,
          sensorType: "tds",
          isRead: false,
        });
      }
      
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev.slice(0, 20)]);
      }
    }, 60000);
    
    // Simulate occasional connection issues
    const connectionInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 3000 + Math.random() * 5000);
      }
    }, 30000);
    
    return () => {
      clearInterval(updateInterval);
      clearInterval(alertInterval);
      clearInterval(connectionInterval);
    };
  }, [currentCrop, sensors]);

  const toggleDevice = (id: string) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === id 
          ? { ...device, isOn: !device.isOn } 
          : device
      )
    );
  };

  const updateCropConfig = (config: CropConfig) => {
    setCrops(prev => 
      prev.map(crop => 
        crop.id === config.id 
          ? config 
          : crop
      )
    );
    
    if (currentCrop && currentCrop.id === config.id) {
      setCurrentCrop(config);
    }
  };

  const setActiveCrop = (cropId: string) => {
    const crop = crops.find(c => c.id === cropId);
    setCurrentCrop(crop || null);
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, isRead: true } 
          : alert
      )
    );
  };

  const markAllAlertsAsRead = () => {
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, isRead: true }))
    );
  };

  return (
    <HydroponicsContext.Provider 
      value={{
        sensors,
        devices,
        currentCrop,
        crops,
        alerts,
        historicalData,
        isConnected,
        lastUpdated,
        toggleDevice,
        updateCropConfig,
        setCurrentCrop: setActiveCrop,
        dismissAlert,
        markAllAlertsAsRead,
      }}
    >
      {children}
    </HydroponicsContext.Provider>
  );
};

export const useHydroponics = () => {
  const context = useContext(HydroponicsContext);
  if (context === undefined) {
    throw new Error('useHydroponics must be used within a HydroponicsProvider');
  }
  return context;
};
