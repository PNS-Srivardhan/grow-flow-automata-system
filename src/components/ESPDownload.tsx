
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/CodeBlock";

const ESPDownload = () => {
  const esp8266Code = `
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Supabase project URL
const char* supabaseUrl = "https://lstmfefngokizyxqpbdo.supabase.co";
const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdG1mZWZuZ29raXp5eHFwYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NjE5MDEsImV4cCI6MjA1OTUzNzkwMX0.6plt7vnykRNGri4_ymbMgvMCxX6LSHS7tCwkRkmzXtk";

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
`;

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([esp8266Code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "ESP8266_Relay_Control.ino";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>ESP8266 Relay Control Code</CardTitle>
        <CardDescription>
          Download and upload this code to your ESP8266 to control relays based on your hydroponics system data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This code connects to your Supabase project and automatically controls your relays based on device states in the database.
        </p>
        
        <div className="bg-muted p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Before uploading:</h3>
          <ul className="list-disc pl-5 text-xs space-y-1 text-muted-foreground">
            <li>Replace <code>YOUR_WIFI_SSID</code> with your WiFi network name</li>
            <li>Replace <code>YOUR_WIFI_PASSWORD</code> with your WiFi password</li>
            <li>Make sure you have the Arduino IDE with ESP8266 support installed</li>
            <li>Install the required libraries: ArduinoJson, ESP8266WiFi, ESP8266HTTPClient</li>
            <li>Set the correct board type in Arduino IDE (NodeMCU 1.0 or similar)</li>
          </ul>
        </div>
        
        <CodeBlock language="cpp" code={esp8266Code} showCopyButton={true} />
        
        <Button 
          onClick={handleDownload} 
          className="w-full bg-hydroponics-teal text-white hover:bg-hydroponics-teal/90"
        >
          Download ESP8266 Code
        </Button>
      </CardContent>
    </Card>
  );
};

export default ESPDownload;
