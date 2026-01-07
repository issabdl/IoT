## Lancer le bridge
```bash
cd bridge
npm install  
node server.js
```

## Lancer le front
```bash
cd front
npm install   # à faire une fois
npm run dev   # puis ouvrir http://localhost:5173
```
Le front se connecte au WebSocket et affiche température / humidité / batterie par device.

