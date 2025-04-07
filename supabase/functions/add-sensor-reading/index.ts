
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get the request data
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Only handle POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the request body
    const requestData = await req.json()
    const { air_temp, water_temp, humidity, ph, tds, crop_id } = requestData;

    // Validate the required sensor data
    if (
      air_temp === undefined || air_temp === null ||
      water_temp === undefined || water_temp === null ||
      humidity === undefined || humidity === null ||
      ph === undefined || ph === null ||
      tds === undefined || tds === null
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required sensor fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }    

    // Query the selected crop or the default (first) crop
    let cropQuery = supabaseClient.from('crops').select('*');
    
    // If a specific crop_id was provided, use that one
    if (crop_id) {
      cropQuery = cropQuery.eq('id', crop_id);
    }
    
    const { data: crops } = await cropQuery.limit(1);

    // Ensure we have at least one crop to compare against
    if (!crops || crops.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No crops found for threshold comparison' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use the first crop to determine status
    const crop = crops[0];
    
    // Determine status based on reading values and crop thresholds
    let status = {
      airTemp: "normal",
      waterTemp: "normal",
      humidity: "normal",
      ph: "normal",
      tds: "normal"
    };

    // Helper function to determine status
    const getStatus = (value, min, max) => {
      if (value < min - (min * 0.1) || value > max + (max * 0.1)) return "critical";
      if (value < min || value > max) return "warning";
      return "normal";
    };

    // Determine status for each reading
    status = {
      airTemp: getStatus(air_temp, crop.min_air_temp, crop.max_air_temp),
      waterTemp: getStatus(water_temp, crop.min_water_temp, crop.max_water_temp),
      humidity: getStatus(humidity, crop.min_humidity, crop.max_humidity),
      ph: getStatus(ph, crop.min_ph, crop.max_ph),
      tds: getStatus(tds, crop.min_tds, crop.max_tds)
    };

    // Create alerts for non-normal conditions
    const createAlerts = async () => {
      const alerts = [];
      
      if (status.airTemp !== "normal") {
        alerts.push({
          message: `Air temperature (${air_temp}°C) ${status.airTemp === "warning" ? "approaching" : "exceeds"} limits for ${crop.name}`,
          sensor_type: "airTemp",
          type: status.airTemp
        });
      }
      
      if (status.waterTemp !== "normal") {
        alerts.push({
          message: `Water temperature (${water_temp}°C) ${status.waterTemp === "warning" ? "approaching" : "exceeds"} limits for ${crop.name}`,
          sensor_type: "waterTemp",
          type: status.waterTemp
        });
      }
      
      if (status.humidity !== "normal") {
        alerts.push({
          message: `Humidity (${humidity}%) ${status.humidity === "warning" ? "approaching" : "exceeds"} limits for ${crop.name}`,
          sensor_type: "humidity",
          type: status.humidity
        });
      }
      
      if (status.ph !== "normal") {
        alerts.push({
          message: `pH level (${ph}) ${status.ph === "warning" ? "approaching" : "exceeds"} limits for ${crop.name}`,
          sensor_type: "ph",
          type: status.ph
        });
      }
      
      if (status.tds !== "normal") {
        alerts.push({
          message: `Nutrient level (${tds}ppm) ${status.tds === "warning" ? "approaching" : "exceeds"} limits for ${crop.name}`,
          sensor_type: "tds",
          type: status.tds
        });
      }
      
      // Create alerts in the database
      if (alerts.length > 0) {
        const { error } = await supabaseClient.from('alerts').insert(alerts);
        if (error) console.error('Error creating alerts:', error);
      }
    };
    
    // Create alerts in the background
    createAlerts();

    // Insert the reading into the database
    const { data, error } = await supabaseClient
      .from('sensor_readings')
      .insert({
        air_temp,
        water_temp,
        humidity,
        ph,
        tds,
        status,
        crop_id: crop_id || crop.id, // Store which crop was used for threshold comparisons
      })
      .select()
      .single()

    if (error) throw error;

    // Auto control devices based on readings
    const autoControlDevices = async () => {
      try {
        // Get all available devices
        const { data: devices, error: devicesError } = await supabaseClient
          .from('devices')
          .select('*');
        
        if (devicesError) {
          console.error('Error fetching devices:', devicesError);
          return;
        }

        // Helper to find device by type
        const findDevice = (type) => devices.find(d => d.device_type === type);
        
        // Control water heater based on water temperature
        const heater = findDevice('heater');
        if (heater) {
          const shouldBeOn = water_temp < crop.min_water_temp;
          if (heater.is_on !== shouldBeOn) {
            await supabaseClient
              .from('devices')
              .update({ is_on: shouldBeOn, last_updated: new Date().toISOString() })
              .eq('id', heater.id);
            console.log(`Water heater turned ${shouldBeOn ? 'ON' : 'OFF'} - water temp: ${water_temp}°C, threshold: ${crop.min_water_temp}°C`);
          }
        }
        
        // Control humidifier based on humidity level
        const humidifier = findDevice('humidifier');
        if (humidifier) {
          const shouldBeOn = humidity < crop.min_humidity;
          if (humidifier.is_on !== shouldBeOn) {
            await supabaseClient
              .from('devices')
              .update({ is_on: shouldBeOn, last_updated: new Date().toISOString() })
              .eq('id', humidifier.id);
            console.log(`Humidifier turned ${shouldBeOn ? 'ON' : 'OFF'} - humidity: ${humidity}%, threshold: ${crop.min_humidity}%`);
          }
        }
        
        // Control fan based on air temperature
        const fan = findDevice('fan');
        if (fan) {
          const shouldBeOn = air_temp > crop.max_air_temp;
          if (fan.is_on !== shouldBeOn) {
            await supabaseClient
              .from('devices')
              .update({ is_on: shouldBeOn, last_updated: new Date().toISOString() })
              .eq('id', fan.id);
            console.log(`Fan turned ${shouldBeOn ? 'ON' : 'OFF'} - air temp: ${air_temp}°C, threshold: ${crop.max_air_temp}°C`);
          }
        }
        
        // Control nutrient pump based on TDS level
        const nutrientPump = findDevice('pump');
        if (nutrientPump) {
          const shouldBeOn = tds < crop.min_tds;
          if (nutrientPump.is_on !== shouldBeOn) {
            await supabaseClient
              .from('devices')
              .update({ is_on: shouldBeOn, last_updated: new Date().toISOString() })
              .eq('id', nutrientPump.id);
            console.log(`Nutrient pump turned ${shouldBeOn ? 'ON' : 'OFF'} - TDS: ${tds}ppm, threshold: ${crop.min_tds}ppm`);
          }
        }
        
        // Control pH adjuster (if available)
        const phAdjuster = findDevice('ph_adjuster');
        if (phAdjuster) {
          // Determine if pH is too high or too low
          const pHIsTooLow = ph < crop.min_ph;
          const pHIsTooHigh = ph > crop.max_ph;
          const shouldBeOn = pHIsTooLow || pHIsTooHigh;
          
          if (phAdjuster.is_on !== shouldBeOn) {
            await supabaseClient
              .from('devices')
              .update({ 
                is_on: shouldBeOn, 
                last_updated: new Date().toISOString() 
              })
              .eq('id', phAdjuster.id);
            console.log(`pH adjuster turned ${shouldBeOn ? 'ON' : 'OFF'} - pH: ${ph}, thresholds: ${crop.min_ph}-${crop.max_ph}`);
          }
        }
        
        // Control lights based on time of day or schedule (simplified logic for now)
        const light = findDevice('light');
        if (light) {
          // Get current hour
          const currentHour = new Date().getHours();
          // Example: lights on from 6am to 8pm (6-20)
          const shouldBeOn = currentHour >= 6 && currentHour < 20;
          
          if (light.is_on !== shouldBeOn) {
            await supabaseClient
              .from('devices')
              .update({ 
                is_on: shouldBeOn, 
                last_updated: new Date().toISOString() 
              })
              .eq('id', light.id);
            console.log(`Lights turned ${shouldBeOn ? 'ON' : 'OFF'} - current hour: ${currentHour}`);
          }
        }
      } catch (error) {
        console.error('Error in auto-control devices:', error);
      }
    };
    
    // Run auto control in the background
    autoControlDevices();

    return new Response(
      JSON.stringify({ data, status: 'success' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
