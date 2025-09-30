# IoT Hardware Integration Roadmap for Krishi Sakhi

This document describes how to integrate on-field IoT sensors (soil moisture, temperature, humidity, pH, water level, etc.) with the Krishi Sakhi platform. It covers ingestion patterns, database schema, security, advisory logic, and a minimal rollout plan.

---

## 1) Ingestion Patterns (choose one or combine)

- HTTP Webhook (Gateway → API)
  - Edge device or gateway POSTs JSON to `/api/iot/ingest`.
  - Body signed with HMAC (X-Signature) using a per-device secret.
  - Simple to deploy over HTTPS; works on 2G/4G/5G/Wi‑Fi.

- MQTT (Broker ↔ Device)
  - Devices publish to topics like `farms/{farmId}/sensors/{deviceId}/data`.
  - A small subscriber service consumes the topics and writes to the DB.
  - Works well for fleets; can be EMQX, HiveMQ, or Mosquitto.

- LoRaWAN via TTN/ChirpStack
  - Use The Things Network/ChirpStack uplink webhooks to our `/api/iot/ttn`.
  - Decode payloads in the integration; map to our device IDs.

---

## 2) Data Model (Prisma – SensorDevice + SensorReading)

- SensorDevice
  - Links to `Farm`.
  - Stores type (soil_moisture, temp, humidity, ph, water_level), unit, connectivity, metadata, and lastSeenAt.
  - Keeps only a hash of the device API key for security.

- SensorReading
  - Time-series values with (deviceId, at, value, unit, quality, raw).
  - Indexed by (deviceId, at) for fast queries.

Example (schema intent):

- SensorDevice(id, farmId, name, type, unit, connectivity, metadata, apiKeyHash, lastSeenAt, createdAt, updatedAt)
- SensorReading(id, deviceId, at, value, unit, quality, raw)

---

## 3) HTTP Ingestion Endpoint (sketch)

- Endpoint: `POST /api/iot/ingest`
- Headers: `Content-Type: application/json`, `X-Signature: <hmac>`
- Body: `{ device_id, value, unit, at, ... }`
- Steps:
  1. Read raw body string.
  2. Lookup device by device_id; fetch per-device secret.
  3. Verify HMAC over raw body.
  4. Insert a SensorReading; update SensorDevice.lastSeenAt.
  5. Respond `{ ok: true }`.

---

## 4) MQTT Subscriber (sketch)

- Subscribe to `farms/+/sensors/+/data`.
- For each message: parse JSON → validate → insert SensorReading → update lastSeenAt.
- Deploy as a small Node service or serverless function.

---

## 5) LoRaWAN (TTN) Webhook (sketch)

- Endpoint: `POST /api/iot/ttn`.
- Extract `device_id`, `decoded_payload` & timestamp.
- Map to SensorDevice; create SensorReading.

---

## 6) Device Provisioning & Security

- Admin flow to register SensorDevice and bind to a Farm.
- Generate device API key (display once; store only hash in DB).
- Enforce TLS (HTTPS/MQTTS). Rotate keys periodically.
- Per-device rate limits and input validation (units, ranges).

---

## 7) Product Surfaces & Intelligence

- Dashboard widgets per farm: latest sensor values, last-seen time, sparklines (24–72h).
- Alerts: threshold rules (e.g., soil_moisture < 20% → “Irrigation advisable”).
- Chat context: include latest sensor snapshot so AI answers are situational ("Soil moisture is 18% at 09:20—irrigation advisable today").

---

## 8) Performance & Storage

- Index `(deviceId, at)` to speed reads.
- Optional: TimescaleDB for larger volumes; downsample old data (1-min → 10-min → hourly).
- Gateways can buffer and batch when offline.

---

## 9) Minimal Working Slice (1–2 days)

1. DB migration: add SensorDevice & SensorReading.
2. Build `/api/iot/ingest` with HMAC auth.
3. Admin: Register Sensor (bind to Farm), issue API key (QR code optional).
4. Ingest from a test ESP32/gateway via HTTP POST.
5. Dashboard: show latest soil moisture + last seen.
6. Advisory: trigger low-moisture alert.
7. Chat: include latest sensor snapshot in the Ask context.

---

## 10) Example Device Payload

```
{
  "device_id": "sensor-soil-kerala-farmA-01",
  "value": 17.6,
  "unit": "%",
  "at": "2025-09-30T10:17:00Z",
  "battery": 3.72
}
```

---

## 11) Why this approach

- Works with low-power, low-bandwidth field conditions.
- Pluggable ingestion (HTTP/MQTT/LoRaWAN) with a single normalized data model.
- Secure-by-design: device keys, HMAC, TLS, rate limits.
- Directly enhances advisories and chat quality—sensor-aware guidance, not generic tips.

---

This roadmap is implementation-ready and aligns with our current codebase (Next.js + Prisma + PWA).
- ✅ **Digital Literacy Friendly**: Simple, guided user interactions

### **2. Scalability**
- ✅ **Instant Distribution**: App store deployment reaches unlimited users
- ✅ **No Logistics**: No physical shipping or installation required
- ✅ **Rapid Updates**: Software improvements delivered automatically

### **3. Reliability**
- ✅ **No Hardware Failures**: Eliminates sensor malfunction issues
- ✅ **Weather Independent**: Functions during monsoons and extreme weather
- ✅ **Theft Resistant**: No valuable hardware to steal or damage

### **4. Cost Effectiveness**
- ✅ **No Upfront Investment**: Completely free to start using
- ✅ **No Maintenance Costs**: No battery replacement or device repairs
- ✅ **Scalable Economics**: Development costs shared across all users

---

## **Conclusion**

Krishi Mitra's **no-hardware approach** is a deliberate architectural decision that prioritizes:

1. **Farmer Accessibility** over technical sophistication
2. **Rapid Deployment** over comprehensive sensing
3. **Cost Effectiveness** over data precision
4. **Reliability** over advanced automation

This approach ensures that the application can immediately serve small and marginal farmers in Kerala without requiring additional investment, technical expertise, or infrastructure beyond their existing smartphone.

The software-first design creates a **sustainable, scalable, and accessible** agricultural advisory platform that delivers real value through intelligent data processing and expert advisory systems rather than expensive hardware sensing capabilities.

**Future hardware integration remains possible but will always be optional**, ensuring that the core application functionality remains accessible to all farmers regardless of their economic situation or technical capabilities.