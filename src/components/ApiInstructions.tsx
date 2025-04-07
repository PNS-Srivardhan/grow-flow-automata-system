
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
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="arduino">Arduino Code</TabsTrigger>
            <TabsTrigger value="esp8266">ESP8266 Relay Control</TabsTrigger>
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
const char* cropId = "YOUR_CROP_ID";  // Change to match the ID of your selected crop

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
          
          <TabsContent value="esp8266" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use this ESP8266 code to control relays based on sensor readings. This code automatically 
              turns devices on/off when readings go out of range.
            </p>
            
            <CodeBlock language="cpp" code={`
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Supabase project URL
const char* supabaseUrl = "https://lstmfefngokizyxqpbdo.supabase.co";
const char* supabaseKey = "YOUR_SUPABASE_ANON_KEY"; // Get from Supabase dashboard

// Device control relay pins
#define HEATER_RELAY_PIN D1      // Water heater relay
#define FAN_RELAY_PIN D2         // Fan relay
#define HUMIDIFIER_RELAY_PIN D3  // Humidifier relay
#define PUMP_RELAY_PIN D4        // Nutrient pump relay
#define PH_RELAY_PIN D5          // pH adjuster relay
#define LIGHT_RELAY_PIN D6       // Light relay

// Device states
bool heaterState = false;
bool fanState = false;
bool humidifierState = false;
bool pumpState = false;
bool phAdjusterState = false;
bool lightState = false;

// Time intervals
const unsigned long CHECK_INTERVAL = 5000;  // Check device status every 5 seconds
unsigned long lastCheckTime = 0;

void setup() {
  Serial.begin(115200);
  delay(100);
  
  // Set relay pins as outputs and initialize to OFF (depends on your relay type)
  pinMode(HEATER_RELAY_PIN, OUTPUT);
  pinMode(FAN_RELAY_PIN, OUTPUT);
  pinMode(HUMIDIFIER_RELAY_PIN, OUTPUT);
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  pinMode(PH_RELAY_PIN, OUTPUT);
  pinMode(LIGHT_RELAY_PIN, OUTPUT);
  
  // Initialize all relays to OFF (HIGH = OFF for most relay modules)
  digitalWrite(HEATER_RELAY_PIN, HIGH);
  digitalWrite(FAN_RELAY_PIN, HIGH);
  digitalWrite(HUMIDIFIER_RELAY_PIN, HIGH);
  digitalWrite(PUMP_RELAY_PIN, HIGH);
  digitalWrite(PH_RELAY_PIN, HIGH);
  digitalWrite(LIGHT_RELAY_PIN, HIGH);
  
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
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Check device status at specified interval
  if (currentMillis - lastCheckTime >= CHECK_INTERVAL) {
    lastCheckTime = currentMillis;
    
    // Get device states from Supabase
    checkDeviceStates();
  }
}

void checkDeviceStates() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    
    // Get device status from Supabase
    String url = String(supabaseUrl) + "/rest/v1/devices?select=id,name,device_type,is_on";
    
    http.begin(client, url);
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", "Bearer " + String(supabaseKey));
    
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Devices HTTP Response code: " + String(httpResponseCode));
      
      // Parse JSON response
      DynamicJsonDocument doc(2048);
      DeserializationError error = deserializeJson(doc, response);
      
      if (error) {
        Serial.print("JSON parsing failed: ");
        Serial.println(error.c_str());
      } else {
        // Process each device
        JsonArray devices = doc.as<JsonArray>();
        
        for (JsonObject device : devices) {
          String deviceType = device["device_type"].as<String>();
          bool isOn = device["is_on"].as<bool>();
          String name = device["name"].as<String>();
          
          // Update relay states based on device types
          if (deviceType == "heater") {
            updateRelay(HEATER_RELAY_PIN, isOn, name, heaterState);
            heaterState = isOn;
          } 
          else if (deviceType == "fan") {
            updateRelay(FAN_RELAY_PIN, isOn, name, fanState);
            fanState = isOn;
          } 
          else if (deviceType == "humidifier") {
            updateRelay(HUMIDIFIER_RELAY_PIN, isOn, name, humidifierState);
            humidifierState = isOn;
          } 
          else if (deviceType == "pump") {
            updateRelay(PUMP_RELAY_PIN, isOn, name, pumpState);
            pumpState = isOn;
          } 
          else if (deviceType == "ph_adjuster") {
            updateRelay(PH_RELAY_PIN, isOn, name, phAdjusterState);
            phAdjusterState = isOn;
          } 
          else if (deviceType == "light") {
            updateRelay(LIGHT_RELAY_PIN, isOn, name, lightState);
            lightState = isOn;
          }
        }
      }
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
    // Attempt to reconnect
    WiFi.begin(ssid, password);
  }
}

void updateRelay(int relayPin, bool isOn, String deviceName, bool currentState) {
  // Check if state has changed to avoid unnecessary updates
  if (currentState != isOn) {
    // NOTE: Most relay modules are active LOW, meaning:
    // LOW = relay ON, HIGH = relay OFF
    // Adjust based on your specific relay module
    
    digitalWrite(relayPin, isOn ? LOW : HIGH);
    
    Serial.print(deviceName);
    Serial.print(" is now ");
    Serial.println(isOn ? "ON" : "OFF");
  }
}

// Optional: Add a function to manually trigger a device status update
void manualUpdateDevice(String deviceId, bool newState) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    
    String url = String(supabaseUrl) + "/rest/v1/devices?id=eq." + deviceId;
    
    http.begin(client, url);
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", "Bearer " + String(supabaseKey));
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Prefer", "return=minimal");
    
    // Create JSON body
    String jsonBody = "{";
    jsonBody += "\\\"is_on\\\": " + String(newState ? "true" : "false") + ",";
    jsonBody += "\\\"last_updated\\\": \\\"" + String(getCurrentTimestamp()) + "\\\"";
    jsonBody += "}";
    
    int httpResponseCode = http.PATCH(jsonBody);
    
    if (httpResponseCode > 0) {
      Serial.println("Update HTTP Response code: " + String(httpResponseCode));
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  }
}

// Helper function to get a timestamp (simplified example)
String getCurrentTimestamp() {
  // In a real implementation, you would use an NTP client to get the actual time
  // This is just a placeholder
  return "2025-04-07T12:00:00Z";
}
`} />

            <div className="mt-4 p-3 border border-yellow-300 bg-yellow-50 rounded-md text-sm">
              <h4 className="font-medium text-amber-800">Important Notes:</h4>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-amber-700">
                <li>Most relay modules are <b>active LOW</b> (LOW = ON, HIGH = OFF)</li>
                <li>Ensure your ESP8266 has a stable power supply that can handle relay activation</li>
                <li>Consider adding a capacitor across the power supply to prevent voltage drops</li>
                <li>Use optocouplers or isolation between ESP8266 and relay circuits for safety</li>
                <li>Add the Supabase anon key from your project dashboard</li>
              </ul>
            </div>
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
  "crop_id": "YOUR_CROP_ID"  // Optional: ID of the crop to use for threshold comparison
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
    "created_at": "2025-04-06T12:00:00.000Z",
    "crop_id": "YOUR_CROP_ID"
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
