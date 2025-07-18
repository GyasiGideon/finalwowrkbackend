import fs from 'fs';
import mqtt from 'mqtt';
import pool from './config/db.js'; // your PostgreSQL pool

// Load your CA certificate chain file (adjust the path)


const mqttOptions = {
  host: '06cdb0b6d26a4f9f87a08361178d270d.s1.eu.hivemq.cloud',
  port: 8883,
  protocol: 'mqtts',
  username: 'gyasigideon',
  password: 'Maryadjei0243001680',
  rejectUnauthorized: false,

};

const topicData = 'SanziRoll/dispenser/data';

console.log('Initializing MQTT client...');
const mqttClient = mqtt.connect(mqttOptions);

mqttClient.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  mqttClient.subscribe(topicData, (err) => {
    if (!err) {
      console.log(`📡 Subscribed to topic: ${topicData}`);
    } else {
      console.error('❌ Subscription error:', err);
    }
  });
});

mqttClient.on('error', (error) => {
  console.error('❌ MQTT Connection Error:', error);
});

mqttClient.on('message', async (topic, message) => {
  console.log('📩 MQTT Message Received:', message.toString());
  try {
    const payload = JSON.parse(message.toString());
    console.log('🔍 Parsed Payload:', payload);

    const { dispenser_uid, sanitizer_level, tissue_level, fault } = payload;

    if (!dispenser_uid) {
      console.error("⚠️ Missing dispenser_uid in message");
      return;
    }

    const dispenserRes = await pool.query(
      'SELECT id FROM dispensers WHERE dispenser_uid = $1',
      [dispenser_uid]
    );

    console.log('🔎 Dispenser Query Result:', dispenserRes.rows);

    if (dispenserRes.rows.length === 0) {
      console.warn(`⚠️ Dispenser UID ${dispenser_uid} not found`);
      return;
    }

    const dispenserId = dispenserRes.rows[0].id;

    await pool.query(
      `INSERT INTO reports (dispenser_id, sanitizer_level, tissue_level, fault)
       VALUES ($1, $2, $3, $4)`,
      [dispenserId, sanitizer_level, tissue_level, fault]
    );

    await pool.query(
      `UPDATE dispensers SET sanitizer_level = $1, tissue_level = $2 WHERE id = $3`,
      [sanitizer_level, tissue_level, dispenserId]
    );

    console.log(`✅ Data stored and updated for dispenser UID: ${dispenser_uid}`);
  } catch (err) {
    console.error("❌ Error processing MQTT message:", err.message);
  }
});

