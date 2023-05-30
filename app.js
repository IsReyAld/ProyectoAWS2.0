const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mqtt = require('mqtt');
const fs = require('fs');
const Chart = require('chart.js');

// Configuración de conexión MQTT
const mqttHost = 'mqtt://a20ym1t6s3bseb-ats.iot.us-east-1.amazonaws.com';
const mqttCert = fs.readFileSync('data/DeviceCertificate.crt');
const mqttKey = fs.readFileSync('data/PrivateKey.key');
const mqttCa = fs.readFileSync('data/AmazonRootCA1.pem');

// Conexión al broker MQTT
const client = mqtt.connect(mqttHost, {
  cert: mqttCert,
  key: mqttKey,
  ca: mqttCa
});

// Conexión al cliente Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Suscribirse a los topics "outTopic" y "sobranteVacasTopic" para recibir mensajes
  client.subscribe('outTopic');
  client.subscribe('sobranteVacasTopic');

  // Cuando se reciba un mensaje MQTT
  client.on('message', (topic, message) => {
    console.log('Mensaje recibido:', message.toString());

    // Enviar el mensaje al cliente Socket.IO
    socket.emit('mqttMessage', { topic, message: message.toString() });
  });

  // Manejar la desconexión del cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });

  // Enviar mensaje mediante MQTT
  socket.on('sendMessage', (message) => {
    client.publish('inTopic', message);
  });
  
});

// Configuración del servidor web
app.use(express.static('public'));

// Iniciar el servidor HTTP
const port = 3000;
http.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
