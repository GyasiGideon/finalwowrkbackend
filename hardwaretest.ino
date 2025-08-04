#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// === Stepper Motor ===
#define DIR_PIN 26
#define STEP_PIN 27

// === Distance Sensor (HC-SR04) ===
#define TRIG_PIN 33
#define ECHO_PIN 32

long tissueLevel = 100; 

// -------------------- Wi-Fi Credentials --------------------
const char* ssid = "GOD IS NOT DEAD";
const char* password = "king1111";

// -------------------- MQTT Broker (HiveMQ Cloud) --------------------
const char* mqtt_server = "06cdb0b6d26a4f9f87a08361178d270d.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;

const char* mqtt_user = "gyasigideon";
const char* mqtt_pass = "Maryadjei0243001680";

// -------------------- MQTT Topics --------------------
String dispenser_uid = "895475dd-8d1c-46bb-99b4-59ec1f4c5012";
String topicData = "SanziRoll/dispenser/data";

// -------------------- DigiCert Root CA Chain --------------------
const char* root_ca = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIGCzCCBPOgAwIBAgIQDRKSAMIbTzW/NSnkNAxQ/jANBgkqhkiG9w0BAQsFADA8\n" \
"MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRwwGgYDVQQDExNBbWF6b24g\n" \
"UlNBIDIwNDggTTAyMB4XDTI0MDkxNTAwMDAwMFoXDTI1MTAxNTIzNTk1OVowHDEa\n" \
"MBgGA1UEAxMRbXF0dGRhc2hib2FyZC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IB\n" \
"DwAwggEKAoIBAQCvawXPXOMQ9UGAIqjmi2+ri3fRnvR5ss++8Zpg2RJwBSKL6zL+\n" \
"VsUcNd+fMPeRgAgyglJlOnU8XF0bc8p3KeK5aUrQ+YVdZYX28irxSqCIHBTtIfQf\n" \
"73AhIUDJ8fh1amG34cN/yiIidliueratIhkCCVmxVrn1F+yWErfzPvQJmUzR0FAK\n" \
"90stUZKypniTljFO8ROjuapNqqHTQpxirKVWydBWemqPtwvPohFeX1aMf418ErMd\n" \
"g3Ke/uj5rqHuLZ4yxDOAUCgvOc949OcfxRs7yrzjWxJXdYvXd2CmfEtDDS1+HjHP\n" \
"z7ShKLiMGjphXGrtKTL1WkgT6TiclaQ5NcR9AgMBAAGjggMnMIIDIzAfBgNVHSME\n" \
"GDAWgBTAMVLNWlDDgnx0cc7L6Zz5euuC4jAdBgNVHQ4EFgQU5wgnGf5iEaQH+TAj\n" \
"dNxg86PmTwUwWwYDVR0RBFQwUoIRbXF0dGRhc2hib2FyZC5jb22CEWJyb2tlci5o\n" \
"aXZlbXEuY29tghZ3d3cubXF0dC1kYXNoYm9hcmQuY29tghJtcXR0LWRhc2hib2Fy\n" \
"ZC5jb20wEwYDVR0gBAwwCjAIBgZngQwBAgEwDgYDVR0PAQH/BAQDAgWgMB0GA1Ud\n" \
"JQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjA7BgNVHR8ENDAyMDCgLqAshipodHRw\n" \
"Oi8vY3JsLnIybTAyLmFtYXpvbnRydXN0LmNvbS9yMm0wMi5jcmwwdQYIKwYBBQUH\n" \
"AQEEaTBnMC0GCCsGAQUFBzABhiFodHRwOi8vb2NzcC5yMm0wMi5hbWF6b250cnVz\n" \
"dC5jb20wNgYIKwYBBQUHMAKGKmh0dHA6Ly9jcnQucjJtMDIuYW1hem9udHJ1c3Qu\n" \
"Y29tL3IybTAyLmNlcjAMBgNVHRMBAf8EAjAAMIIBfAYKKwYBBAHWeQIEAgSCAWwE\n" \
"ggFoAWYAdQDd3Mo0ldfhFgXnlTL6x5/4PRxQ39sAOhQSdgosrLvIKgAAAZHzEAZZ\n" \
"AAAEAwBGMEQCIDRJeP8nONubaRSWNBxoxO1xOAs7jRBJlb3ynAivsH93AiBCEDAc\n" \
"jE70Y4p8vOYNjLSJ+aiBJFczu59DVQrsKoNGQgB2AH1ZHhLheCp7HGFnfF79+NCH\n" \
"XBSgTpWeuQMv2Q6MLnm4AAABkfMQBlcAAAQDAEcwRQIhAO9WTzEWgkPPS6EmV4OT\n" \
"xXzYltKn3PV0CVQFxkT1GYeXAiA4CbK66ybBLmavJHBx6adlr6tKsDIKgpakSe9u\n" \
"b6+z9wB1AObSMWNAd4zBEEEG13G5zsHSQPaWhIb7uocyHf0eN45QAAABkfMQBmoA\n" \
"AAQDAEYwRAIgHcsfX59qB9t3x47yCWGSObl8wXv1EqdOIhy0JurHPIsCIFppfMus\n" \
"IsDgujj6hfcbYi76er/7hor+Vu4HF5U1iQ8GMA0GCSqGSIb3DQEBCwUAA4IBAQCJ\n" \
"FUgDmMfGJq8CBDfe9Hv3uQH33cNw7VWJhfAMxZxq5dp6OWUHuntxXN3ZpSxBfEdS\n" \
"VqqW//vQ/C3cEnNO5jqj5uW8x4AscwG6El354jSpD3zCFdWe9zDEA0gln4BWJyWH\n" \
"vJCwzELamkVllYEc/GIaf9mbrAYGAL3KGcapV2DqLBPo2atA1nwSrV4Z4qyTA6hi\n" \
"CWTbShTiwFD3LHYHnBYCqdSExup/Ff0r1jifcWpmae2E/H0k5RNuguwRD7thcjgt\n" \
"oKKG1qg3mSuKHNwgURzvZXgUOB3Dqeaf/btSWpmwGpNuxlmfR+4PPQvioCoErfLV\n" \
"lII54TbyfPxUtjQLfCd2\n" \
"-----END CERTIFICATE-----\n";

// -------------------- Secure Client & MQTT --------------------
WiFiClientSecure espSecureClient;
PubSubClient client(espSecureClient);

// -------------------- WiFi Connection --------------------
void connectToWiFi() {
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println(" connected!");
}

// -------------------- NTP Time Sync --------------------
void syncTime() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("Syncing time...");
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println(" synced!");
}

// -------------------- MQTT Secure Connection --------------------
void connectToMQTT() {
  client.setServer(mqtt_server, mqtt_port);
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println(" connected!");
      client.subscribe(topicData.c_str());
    } else {
      Serial.print(" failed, rc=");
      Serial.println(client.state());
      delay(5000);
    }
  }
}

// -------------------- Handle Incoming MQTT Messages --------------------
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on topic: ");
  Serial.println(topic);
  // Optionally parse payload here
}

// -------------------- Measure Distance --------------------
float measureDistanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = duration * 0.034 / 2; // cm
  return distance;
}

// -------------------- Run Motor --------------------
void runMotorSteps(int steps) {
  digitalWrite(DIR_PIN, HIGH); // direction
  for (int i = 0; i < steps; i++) {
    digitalWrite(STEP_PIN, HIGH);
    delayMicroseconds(500); // Adjust speed
    digitalWrite(STEP_PIN, LOW);
    delayMicroseconds(500);
  }
}

// -------------------- Publish Dispenser Data --------------------
void publishData() {
  StaticJsonDocument<256> doc;
  doc["dispenser_uid"] = dispenser_uid;
  doc["sanitizer_level"] = random(50, 100); // Simulated reading
  doc["tissue_level"] = tissueLevel;    // Simulated reading
  doc["fault"] = "hELLO WORLD";             // Test status

  char buffer[256];
  size_t len = serializeJson(doc, buffer);
  client.publish(topicData.c_str(), buffer, len);
  Serial.println("Published data:");
  Serial.println(buffer);
}

// -------------------- Arduino Setup --------------------
void setup() {
// Disable brownout detector
  Serial.begin(115200);
  delay(2000);
  connectToWiFi();
  syncTime();

   // Pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(DIR_PIN, OUTPUT);
  pinMode(STEP_PIN, OUTPUT);
  
  // Load TLS certificate
  espSecureClient.setCACert(root_ca);

  client.setCallback(callback);
  connectToMQTT();
}

// -------------------- Arduino Main Loop --------------------
void loop() {
  if (!client.connected()) {
    connectToMQTT();
  }
  client.loop();
    float distance = measureDistanceCM();
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  if (distance > 0 && distance < 10 && tissueLevel > 0) { // hand detected
    runMotorSteps(200); // Adjust steps as needed
    tissueLevel = max(0L, tissueLevel - 10);  // 0L is a long literal
 // reduce tissue level
    delay(2000); // avoid double trigger
  }

  publishData();
  delay(10000); // every 10s
}
