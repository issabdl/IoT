# Topics MQTT

Préfixe: `classroom/<deviceId>`

Topics:
- `classroom/<deviceId>/telemetry` : données de télémétrie périodiques (ex: température, humidité)
- `classroom/<deviceId>/events` : événements ponctuels (ex: bouton pressé, alerte)
- `classroom/<deviceId>/cmd` : commandes envoyées au device (ex: LED on/off)
- `classroom/<deviceId>/status` : état du device (ex: en ligne, niveau batterie)
