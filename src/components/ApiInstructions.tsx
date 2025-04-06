
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ApiInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Endpoints</CardTitle>
        <CardDescription>
          Use these endpoints to send sensor data from your IoT devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sensors">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sensors">Sensor Data</TabsTrigger>
            <TabsTrigger value="devices">Device Control</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sensors" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Send Sensor Readings</h3>
              <p className="text-xs text-muted-foreground mt-1">
                POST to this endpoint to send sensor readings from your IoT devices
              </p>
              <pre className="bg-secondary p-2 rounded-md text-xs mt-2 overflow-x-auto">
                {`POST https://lstmfefngokizyxqpbdo.supabase.co/rest/v1/sensor_readings

Headers:
apikey: ${import.meta.env.VITE_SUPABASE_ANON_KEY || '[your-supabase-anon-key]'}
Content-Type: application/json

Body:
{
  "air_temp": 23.5,
  "water_temp": 21.2,
  "humidity": 65,
  "ph": 6.1,
  "tds": 750,
  "status": {
    "airTemp": "normal",
    "waterTemp": "normal",
    "humidity": "normal",
    "ph": "normal",
    "tds": "normal"
  }
}`}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="devices">
            <div>
              <h3 className="text-sm font-medium">Get Device Status</h3>
              <p className="text-xs text-muted-foreground mt-1">
                GET this endpoint to retrieve the status of all devices
              </p>
              <pre className="bg-secondary p-2 rounded-md text-xs mt-2 overflow-x-auto">
                {`GET https://lstmfefngokizyxqpbdo.supabase.co/rest/v1/devices?select=*

Headers:
apikey: ${import.meta.env.VITE_SUPABASE_ANON_KEY || '[your-supabase-anon-key]'}`}
              </pre>
              
              <h3 className="text-sm font-medium mt-4">Update Device Status</h3>
              <p className="text-xs text-muted-foreground mt-1">
                PATCH this endpoint to update a device's status
              </p>
              <pre className="bg-secondary p-2 rounded-md text-xs mt-2 overflow-x-auto">
                {`PATCH https://lstmfefngokizyxqpbdo.supabase.co/rest/v1/devices?id=eq.[device-id]

Headers:
apikey: ${import.meta.env.VITE_SUPABASE_ANON_KEY || '[your-supabase-anon-key]'}
Content-Type: application/json

Body:
{
  "is_on": true,
  "last_updated": "2025-04-06T12:00:00.000Z"
}`}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ApiInstructions;
