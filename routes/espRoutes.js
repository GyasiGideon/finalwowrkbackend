import express from "express";
import { mqttClient } from '../mqttClient.js';
const router = express.Router();

let espStatus = "idle"; // default status

// Handle ESP status updates via MQTT
mqttClient.on("message", (topic, message) => {
  if (topic === "SanziRoll/dispenser/status") {
    try {
      const { status } = JSON.parse(message.toString());
      espStatus = status; // "connected" | "failed"
      console.log("🔄 ESP Status updated:", espStatus);
    } catch (err) {
      console.error("❌ Failed to parse ESP status:", err);
    }
  }
});

// Send Wi-Fi credentials
router.post("/wifi-config", (req, res) => {
  const { ssid, password } = req.body;
  if (!ssid || !password)
    return res.status(400).json({ error: "SSID and password required" });

  const payload = JSON.stringify({ ssid, password });
  mqttClient.publish("SanziRoll/dispenser/config", payload, { qos: 1 });

  espStatus = "connecting";
  res.json({ message: "Wi-Fi config published to dispenser" });
});

// Endpoint for frontend polling
router.get("/status", (req, res) => {
  res.json({ status: espStatus });
});

export default router;
