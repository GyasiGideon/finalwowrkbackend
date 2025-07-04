// mqttClient.js
import mqtt from 'mqtt';
import pool from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}`, {
  port: process.env.MQTT_PORT,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});


client.on('connect', () => {
  console.log('Connected to MQTT Broker');
  client.subscribe(process.env.MQTT_TOPIC, (err) => {
    if (err) {
      console.error('❌ Subscription error:', err);
    } else {
      console.log(`📡 Subscribed to ${process.env.MQTT_TOPIC}`);
    }
  });
});

client.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log('📥 Received data:', data);

    const {
      dispenser_id,
      sanitizer_level,
      tissue_level,
      tamper_detected, 
      fault,           
    } = data;

    // Build fault string from tamper if not provided
    const faultText = fault ?? (tamper_detected ? 'Tamper Detected' : null);

    const query = `
      INSERT INTO reports (dispenser_id, sanitizer_level, tissue_level, fault)
      VALUES ($1, $2, $3, $4)
    `
    await pool.query(query, [
      dispenser_id,
      sanitizer_level,
      tissue_level,
      faultText,
    ]);

    console.log('✅ Report saved to database');
  } catch (err) {
    console.error('❌ Error processing MQTT message:', err);
  }
});

export default client;
