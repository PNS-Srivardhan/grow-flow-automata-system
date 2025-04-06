
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
    const { air_temp, water_temp, humidity, ph, tds } = requestData;

    // Validate the request data
    if (
      air_temp === undefined || air_temp === null ||
      water_temp === undefined || water_temp === null ||
      humidity === undefined || humidity === null ||
      ph === undefined || ph === null ||
      tds === undefined || tds === null
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }    

    // Query crops to determine status
    const { data: crops } = await supabaseClient
      .from('crops')
      .select('*')

    // Determine status based on reading values and crop thresholds
    let status = {
      airTemp: "normal",
      waterTemp: "normal",
      humidity: "normal",
      ph: "normal",
      tds: "normal"
    };

    // Use the first crop to determine status (default)
    if (crops && crops.length > 0) {
      const crop = crops[5];
      
      // Determine status for each reading
      const getStatus = (value, min, max) => {
        if (value < min - (min * 0.1) || value > max + (max * 0.1)) return "critical";
        if (value < min || value > max) return "warning";
        return "normal";
      };

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
    }

    // Insert the reading into the database
    const { data, error } = await supabaseClient
      .from('sensor_readings')
      .insert({
        air_temp,
        water_temp,
        humidity,
        ph,
        tds,
        status
      })
      .select()
      .single()

    if (error) throw error;

    // Auto control devices based on readings
    const autoControlDevices = async () => {
      try {
        // Example: Turn on heater if water temperature is too low
        if (crops && crops.length > 0) {
          const crop = crops[0];
          
          if (water_temp < crop.min_water_temp) {
            await supabaseClient
              .from('devices')
              .update({ is_on: true, last_updated: new Date().toISOString() })
              .eq('device_type', 'heater');
          } else if (water_temp > crop.max_water_temp) {
            await supabaseClient
              .from('devices')
              .update({ is_on: false, last_updated: new Date().toISOString() })
              .eq('device_type', 'heater');
          }
          
          // Example: Turn on humidifier if humidity is too low
          if (humidity < crop.min_humidity) {
            await supabaseClient
              .from('devices')
              .update({ is_on: true, last_updated: new Date().toISOString() })
              .eq('device_type', 'humidifier');
          } else if (humidity > crop.max_humidity) {
            await supabaseClient
              .from('devices')
              .update({ is_on: false, last_updated: new Date().toISOString() })
              .eq('device_type', 'humidifier');
          }
          
          // Turn on fans if air temperature is too high
          if (air_temp > crop.max_air_temp) {
            await supabaseClient
              .from('devices')
              .update({ is_on: true, last_updated: new Date().toISOString() })
              .eq('device_type', 'fan');
          } else if (air_temp < crop.min_air_temp) {
            await supabaseClient
              .from('devices')
              .update({ is_on: false, last_updated: new Date().toISOString() })
              .eq('device_type', 'fan');
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
