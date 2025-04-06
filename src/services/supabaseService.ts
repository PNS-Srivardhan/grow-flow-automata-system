
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export type Crop = {
  id: string;
  name: string;
  min_air_temp: number;
  max_air_temp: number;
  min_water_temp: number;
  max_water_temp: number;
  min_humidity: number;
  max_humidity: number;
  min_ph: number;
  max_ph: number;
  min_tds: number;
  max_tds: number;
};

export type Device = {
  id: string;
  name: string;
  device_type: string;
  is_on: boolean;
  last_updated: string;
};

export type SensorReading = {
  id: string;
  air_temp: number;
  water_temp: number;
  humidity: number;
  ph: number;
  tds: number;
  status: {
    airTemp: "normal" | "warning" | "critical";
    waterTemp: "normal" | "warning" | "critical";
    humidity: "normal" | "warning" | "critical";
    ph: "normal" | "warning" | "critical";
    tds: "normal" | "warning" | "critical";
  };
  created_at: string;
};

export type Alert = {
  id: string;
  message: string;
  sensor_type: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

// Fetch all crops
export const useCrops = () => {
  return useQuery({
    queryKey: ['crops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Crop[];
    },
  });
};

// Fetch latest sensor readings
export const useLatestSensorReading = () => {
  return useQuery({
    queryKey: ['sensorReading', 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data[0] as SensorReading;
    },
    refetchInterval: 2000, // Poll every 2 seconds
  });
};

// Fetch historical sensor readings
export const useHistoricalReadings = (limit = 24) => {
  return useQuery({
    queryKey: ['sensorReadings', 'historical', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as SensorReading[];
    },
  });
};

// Fetch all devices
export const useDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*');
      
      if (error) throw error;
      return data as Device[];
    },
  });
};

// Toggle device status
export const useToggleDevice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (deviceId: string) => {
      // First get the current state
      const { data: device, error: fetchError } = await supabase
        .from('devices')
        .select('is_on')
        .eq('id', deviceId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Toggle the state
      const { data, error } = await supabase
        .from('devices')
        .update({ is_on: !device.is_on, last_updated: new Date().toISOString() })
        .eq('id', deviceId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast({
        title: "Device Updated",
        description: `${data.name} is now ${data.is_on ? 'on' : 'off'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update device status",
        variant: "destructive",
      });
      console.error(error);
    },
  });
};

// Fetch alerts
export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Alert[];
    },
  });
};

// Dismiss alert
export const useDismissAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

// Mark all alerts as read
export const useMarkAllAlertsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('is_read', false)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

// Update crop settings
export const useUpdateCrop = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (crop: Crop) => {
      const { data, error } = await supabase
        .from('crops')
        .update({
          name: crop.name,
          min_air_temp: crop.min_air_temp,
          max_air_temp: crop.max_air_temp,
          min_water_temp: crop.min_water_temp,
          max_water_temp: crop.max_water_temp,
          min_humidity: crop.min_humidity,
          max_humidity: crop.max_humidity,
          min_ph: crop.min_ph,
          max_ph: crop.max_ph,
          min_tds: crop.min_tds,
          max_tds: crop.max_tds,
        })
        .eq('id', crop.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      toast({
        title: "Crop Updated",
        description: `${data.name} settings have been updated`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update crop settings",
        variant: "destructive",
      });
      console.error(error);
    },
  });
};

// Add a new crop
export const useAddCrop = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (crop: Omit<Crop, 'id'>) => {
      const { data, error } = await supabase
        .from('crops')
        .insert({
          name: crop.name,
          min_air_temp: crop.min_air_temp,
          max_air_temp: crop.max_air_temp,
          min_water_temp: crop.min_water_temp,
          max_water_temp: crop.max_water_temp,
          min_humidity: crop.min_humidity,
          max_humidity: crop.max_humidity,
          min_ph: crop.min_ph,
          max_ph: crop.max_ph,
          min_tds: crop.min_tds,
          max_tds: crop.max_tds,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      toast({
        title: "Crop Added",
        description: `${data.name} has been added to the database`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add new crop",
        variant: "destructive",
      });
      console.error(error);
    },
  });
};

// Add a new sensor reading (typically called from IoT devices)
export const useAddSensorReading = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reading: Omit<SensorReading, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('sensor_readings')
        .insert({
          air_temp: reading.air_temp,
          water_temp: reading.water_temp,
          humidity: reading.humidity,
          ph: reading.ph,
          tds: reading.tds,
          status: reading.status,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensorReading', 'latest'] });
      queryClient.invalidateQueries({ queryKey: ['sensorReadings', 'historical'] });
    },
  });
};

// Subscribe to real-time updates
export const subscribeToSensorUpdates = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('sensor-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToDeviceUpdates = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('device-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'devices',
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToAlertUpdates = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('alert-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
