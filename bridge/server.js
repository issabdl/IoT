import mqtt from 'mqtt';
import { WebSocketServer } from 'ws';

const MQTT_BROKER = 'mqtt://captain.dev0.pandor.cloud:1884';
const WS_PORT = 8080;

const mqttClient = mqtt.connect(MQTT_BROKER);
const wss = new WebSocketServer({ port: WS_PORT });

let wsClients = new Set();

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('classroom/+/telemetry', (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log('Subscribed to classroom/+/telemetry');
    }
  });
});

mqttClient.on('message', (topic, message) => {
  let payload = message.toString();
  try {
    payload = JSON.parse(payload);
  } catch (e) {
  }

  const data = {
    topic,
    payload,
    timestamp: Date.now()
  };
  
  const jsonData = JSON.stringify(data);
  console.log('MQTT message:', jsonData);
  
  wsClients.forEach(client => {
    if (client.readyState === 1) {
      client.send(jsonData);
    }
  });
});

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  wsClients.add(ws);
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    wsClients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsClients.delete(ws);
  });
});

console.log(`WebSocket server listening on ws://localhost:${WS_PORT}`);