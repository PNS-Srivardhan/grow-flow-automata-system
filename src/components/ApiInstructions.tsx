
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/CodeBlock";

const ApiInstructions = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Instructions</CardTitle>
        <CardDescription>
          How to connect sensors and devices to your hydroponics system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="arduino">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="arduino">Arduino Code</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
          </TabsList>
          
          <TabsContent value="arduino" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use this Arduino code as a starting point to connect your sensors to the system.
              Adjust for your specific hardware setup.
            </p>
            
            <CodeBlock language="cpp" code={`
#include <Arduino.h>
#include <WiFi.h>        // For ESP32. Use <ESP8266WiFi.h> for ESP8266
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Supabase Edge Function URL (replace with your actual URL)
const char* serverUrl = "https://lstmfefngokizyxqpbdo.supabase.co/functions/v1/add-sensor-reading";

// Crop ID from your dashboard (ensures comparing with the correct crop thresholds)
const char* cropId = "lettuce";  // Change to match the ID of your selected crop

// Sensor pins
#define ONE_WIRE_BUS 4          // DS18B20 temperature sensors (water temp)
#define AIR_TEMP_PIN A0         // Air temperature analog sensor
#define HUMIDITY_PIN A1         // Humidity analog sensor
#define PH_SENSOR_PIN A2        // pH sensor
#define TDS_SENSOR_PIN A3       // TDS sensor

// Initialize sensors
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensors(&oneWire);

// Calibration values (adjust based on your sensors)
const float PH_CALIBRATION_VALUE = 3.5;      // pH sensor calibration
const float TDS_CALIBRATION_VALUE = 0.5;     // TDS sensor calibration
const float AIR_TEMP_CALIBRATION = 0.0;      // Air temp sensor calibration
const float HUMIDITY_CALIBRATION = 0.0;      // Humidity sensor calibration

// Time intervals
const unsigned long READING_INTERVAL = 60000;  // Send readings every 60 seconds
unsigned long lastReadingTime = 0;

void setup() {
  Serial.begin(115200);
  delay(100);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
  
  // Initialize temperature sensors
  tempSensors.begin();
  
  // Initialize analog pins
  pinMode(AIR_TEMP_PIN, INPUT);
  pinMode(HUMIDITY_PIN, INPUT);
  pinMode(PH_SENSOR_PIN, INPUT);
  pinMode(TDS_SENSOR_PIN, INPUT);
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Send readings at specified interval
  if (currentMillis - lastReadingTime >= READING_INTERVAL) {
    lastReadingTime = currentMillis;
    
    // Read all sensors
    float waterTemp = readWaterTemperature();
    float airTemp = readAirTemperature();
    float humidity = readHumidity();
    float ph = readPH();
    float tds = readTDS(waterTemp);  // TDS readings are temperature compensated
    
    // Send data to server
    sendSensorData(airTemp, waterTemp, humidity, ph, tds);
  }
}

float readWaterTemperature() {
  tempSensors.requestTemperatures();
  float tempC = tempSensors.getTempCByIndex(0);
  
  Serial.print("Water Temperature: ");
  Serial.print(tempC);
  Serial.println("°C");
  
  return tempC;
}

float readAirTemperature() {
  // This is a simple example - adjust for your specific air temperature sensor
  int rawValue = analogRead(AIR_TEMP_PIN);
  float voltage = rawValue * (3.3 / 1023.0);  // Convert to voltage (3.3V reference)
  float temperature = (voltage - 0.5) * 100 + AIR_TEMP_CALIBRATION;  // LM35 conversion (adjust for your sensor)
  
  Serial.print("Air Temperature: ");
  Serial.print(temperature);
  Serial.println("°C");
  
  return temperature;
}

float readHumidity() {
  // Simple example - adjust for your specific humidity sensor
  int rawValue = analogRead(HUMIDITY_PIN);
  float voltage = rawValue * (3.3 / 1023.0);
  float humidity = (voltage / 3.3) * 100 + HUMIDITY_CALIBRATION;  // Simple conversion (adjust for your sensor)
  
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println("%");
  
  return humidity;
}

float readPH() {
  // Simple example - adjust for your specific pH sensor
  int rawValue = analogRead(PH_SENSOR_PIN);
  float voltage = rawValue * (3.3 / 1023.0);
  float phValue = 3.5 * voltage + PH_CALIBRATION_VALUE;  // Simple conversion (adjust for your sensor)
  
  Serial.print("pH: ");
  Serial.println(phValue);
  
  return phValue;
}

float readTDS(float temperature) {
  // Simple example - adjust for your specific TDS sensor
  int rawValue = analogRead(TDS_SENSOR_PIN);
  float voltage = rawValue * (3.3 / 1023.0);
  
  // Temperature compensation
  float compensationCoefficient = 1.0 + 0.02 * (temperature - 25.0);
  float compensationVoltage = voltage / compensationCoefficient;
  
  // Convert to TDS value (adjust formula for your sensor)
  float tdsValue = (133.42 * compensationVoltage * compensationVoltage * compensationVoltage - 
                   255.86 * compensationVoltage * compensationVoltage + 
                   857.39 * compensationVoltage) * TDS_CALIBRATION_VALUE;
  
  Serial.print("TDS: ");
  Serial.print(tdsValue);
  Serial.println(" ppm");
  
  return tdsValue;
}

void sendSensorData(float airTemp, float waterTemp, float humidity, float ph, float tds) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Create a JSON document
    StaticJsonDocument<200> doc;
    doc["air_temp"] = airTemp;
    doc["water_temp"] = waterTemp;
    doc["humidity"] = humidity;
    doc["ph"] = ph;
    doc["tds"] = tds;
    doc["crop_id"] = cropId;  // Send the crop ID to ensure correct threshold comparison
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Begin HTTP POST request
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Send HTTP POST request
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response code: " + String(httpResponseCode));
      Serial.println(response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    
    // Free resources
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
    // Attempt to reconnect
    WiFi.begin(ssid, password);
  }
}
`} />
          </TabsContent>
          
          <TabsContent value="api">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add Sensor Reading Endpoint</h3>
              <p className="text-sm text-muted-foreground">
                Send sensor readings to the system with this endpoint:
              </p>
              
              <div className="text-sm bg-muted p-2 rounded-md">
                <code>POST https://lstmfefngokizyxqpbdo.supabase.co/functions/v1/add-sensor-reading</code>
              </div>
              
              <h4 className="font-medium">Request Body</h4>
              <CodeBlock language="json" code={`
{
  "air_temp": 25.5,
  "water_temp": 22.3,
  "humidity": 65,
  "ph": 6.2,
  "tds": 750,
  "crop_id": "lettuce"  // Optional: ID of the crop to use for threshold comparison
}
`} />
              
              <h4 className="font-medium">Response</h4>
              <CodeBlock language="json" code={`
{
  "data": {
    "id": "uuid",
    "air_temp": 25.5,
    "water_temp": 22.3,
    "humidity": 65,
    "ph": 6.2,
    "tds": 750,
    "status": {
      "airTemp": "normal",
      "waterTemp": "normal",
      "humidity": "normal",
      "ph": "normal",
      "tds": "normal"
    },
    "created_at": "2025-04-06T12:00:00.000Z"
  },
  "status": "success"
}
`} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ApiInstructions;
