import mqtt from 'mqtt';
import pool from './config/db.js';

// MQTT connection options
const mqttOptions = {
  host: '06cdb0b6d26a4f9f87a08361178d270d.s1.eu.hivemq.cloud',
  port: 8883,
  protocol: 'mqtts',
  username: 'gyasigideon',
  password: 'Maryadjei0243001680',
  rejectUnauthorized: false,
};

const topicData = 'SanziRoll/dispenser/data';

console.log('🚀 Initializing MQTT client...');
const mqttClient = mqtt.connect(mqttOptions);

// Handle connection
mqttClient.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  mqttClient.subscribe(topicData, (err) => {
    if (err) {
      console.error('❌ Subscription error:', err);
    } else {
      console.log(`📡 Subscribed to topic: ${topicData}`);
    }
  });
});

// Handle errors
mqttClient.on('error', (error) => {
  console.error('❌ MQTT Connection Error:', error.message);
});

// Handle messages
mqttClient.on('message', async (topic, message) => {
  console.log('📩 MQTT Message Received:', message.toString());

  try {
    const payload = JSON.parse(message.toString());
    console.log('🔍 Parsed Payload:', payload);

    const { 
      dispenser_uid, 
      sanitizer_level, 
      tissue_level, 
      fault = "Available", 
      system_status = "OFF", 
      connection_status = "OFFLINE"
    } = payload;

    if (!dispenser_uid) {
      console.error("⚠️ Missing dispenser_uid in message");
      return;
    }

    // Round values before saving
    const roundedSanitizer = Math.round(Number(sanitizer_level));
    const roundedTissue = Math.round(Number(tissue_level));
    console.log(`🔄 Rounded Values -> Sanitizer: ${roundedSanitizer}, Tissue: ${roundedTissue}`);

    // Find dispenser
    const dispenserRes = await pool.query(
      'SELECT id FROM dispensers WHERE dispenser_uid = $1',
      [dispenser_uid]
    );

    if (dispenserRes.rows.length === 0) {
      console.warn(`⚠️ Dispenser UID ${dispenser_uid} not found in dispensers table`);
      return;
    }

    const dispenserId = dispenserRes.rows[0].id;
    console.log(`🔑 Found Dispenser ID: ${dispenserId}`);

    // Check if report exists for this dispenser
    const reportCheck = await pool.query(
      'SELECT id FROM reports WHERE dispenser_id = $1 LIMIT 1',
      [dispenserId]
    );

    if (reportCheck.rows.length > 0) {
      // Update existing report
      const updateReportRes = await pool.query(
        `UPDATE reports
           SET sanitizer_level = $1,
               tissue_level = $2,
               fault = $3,
               system_status = $4,
               connection_status = $5
         WHERE dispenser_id = $6
         RETURNING id`,
        [roundedSanitizer, roundedTissue, fault, system_status, connection_status, dispenserId]
      );
      console.log(`♻️ Report Updated -> ID: ${updateReportRes.rows[0]?.id}`);
    } else {
      // Insert new report
      const insertReportRes = await pool.query(
        `INSERT INTO reports 
           (dispenser_id, sanitizer_level, tissue_level, fault, system_status, connection_status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [dispenserId, roundedSanitizer, roundedTissue, fault, system_status, connection_status]
      );
      console.log("🆕 Report Inserted with ID:", insertReportRes.rows[0]?.id);
    }

    // Always update dispenser's latest status
    try {
      const updateRes = await pool.query(
        `UPDATE dispensers 
           SET sanitizer_level = $1, 
               tissue_level = $2, 
               tamper_detected = $3
         WHERE id = $4
         RETURNING id`,
        [
          roundedSanitizer, 
          roundedTissue, 
          fault === "Tamper detected", 
          dispenserId
        ]
      );
      console.log(`♻️ Dispenser Updated -> ID: ${updateRes.rows[0]?.id}`);
    } catch (updateErr) {
      console.error("❌ Update dispensers failed:", updateErr.message);
      return;
    }

    console.log(`✅ Report stored/updated & dispenser updated for UID: ${dispenser_uid}`);

  } catch (err) {
    console.error("❌ Error processing MQTT message:", err.message);
  }
});

export { mqttClient };
