
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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the first crop to use its thresholds
    const { data: crops } = await supabaseClient
      .from('crops')
      .select('*')
      .limit(1)

    if (!crops || crops.length === 0) {
      throw new Error('No crops found in the database');
    }

    const crop = crops[0];

    // Generate a random reading within or slightly outside the thresholds
    const generateReading = (min: number, max: number, variance = 0.2) => {
      // Generate a value potentially outside the threshold by the variance percentage
      const range = max - min;
      const extendedMin = min - (range * variance);
      const extendedMax = max + (range * variance);
      
      return parseFloat((Math.random() * (extendedMax - extendedMin) + extendedMin).toFixed(1));
    };

    // Generate the reading values
    const air_temp = generateReading(crop.min_air_temp, crop.max_air_temp);
    const water_temp = generateReading(crop.min_water_temp, crop.max_water_temp);
    const humidity = parseFloat(generateReading(crop.min_humidity, crop.max_humidity).toFixed(0));
    const ph = generateReading(crop.min_ph, crop.max_ph);
    const tds = parseFloat(generateReading(crop.min_tds, crop.max_tds).toFixed(0));

    // Determine status for each reading
    const getStatus = (value: number, min: number, max: number) => {
      if (value < min - (min * 0.1) || value > max + (max * 0.1)) return "critical";
      if (value < min || value > max) return "warning";
      return "normal";
    };

    const status = {
      airTemp: getStatus(air_temp, crop.min_air_temp, crop.max_air_temp),
      waterTemp: getStatus(water_temp, crop.min_water_temp, crop.max_water_temp),
      humidity: getStatus(humidity, crop.min_humidity, crop.max_humidity),
      ph: getStatus(ph, crop.min_ph, crop.max_ph),
      tds: getStatus(tds, crop.min_tds, crop.max_tds)
    };

    // Insert the generated reading
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
      .single();

    if (error) throw error;

    // Create alerts for non-normal conditions
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
    
    // Insert alerts if any
    if (alerts.length > 0) {
      await supabaseClient.from('alerts').insert(alerts);
    }

    return new Response(
      JSON.stringify({ 
        data, 
        status: 'success',
        message: 'Sample data generated successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating sample data:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
