<script>
  import { onMount } from 'svelte';
  let status = 'Connexion...';
  let devices = {};
  let ws;

  const cities = {
    'device-001': 'Paris',
    'device-002': 'Lyon',
    'device-003': 'Marseille',
    'device-004': 'Toulouse',
    'device-005': 'Bordeaux',
    'esp32-01': 'Nice',
    'esp32-02': 'Nantes',
    'esp32-03': 'Strasbourg',
    'esp32-04': 'Montpellier',
    'esp32-05': 'Lille',
    'esp32-06': 'Rennes',
    'esp32-07': 'Reims'
  };

  onMount(() => {
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      status = 'Connecté';
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        const deviceId = data.topic.split('/')[1];

        let payload = data.payload;
        if (typeof payload === 'string') {
          try { payload = JSON.parse(payload); } catch (e) { payload = {}; }
        }
        if (payload && payload.telemetry) payload = payload.telemetry;
        if (payload && payload.data) payload = payload.data;

        const temp = payload?.temperature ?? payload?.temp ?? payload?.t ?? payload?.tempC ?? payload?.tempF;
        const hum = payload?.humidity ?? payload?.hum ?? payload?.h ?? payload?.humPct ?? payload?.humidityPct;
        const bat = payload?.battery ?? payload?.bat ?? payload?.b ?? payload?.batteryPct;

        devices[deviceId] = {
          temperature: temp !== undefined ? parseFloat(temp).toFixed(1) : 'N/A',
          humidity: hum !== undefined ? parseFloat(hum).toFixed(1) : 'N/A',
          battery: bat !== undefined ? parseFloat(bat).toFixed(0) : 'N/A',
          city: cities[deviceId] || deviceId,
          lastUpdate: new Date(),
          online: true
        };
        devices = devices; // force reactivity
      } catch (e) {
        console.log('Erreur parsing:', e);
      }
    };

    ws.onclose = () => {
      status = 'Déconnecté';
    };

    // Vérifier les devices offline toutes les 30 secondes
    setInterval(() => {
      const now = new Date();
      Object.keys(devices).forEach(id => {
        const diff = (now - devices[id].lastUpdate) / 1000;
        devices[id].online = diff < 60; // offline si > 1 min
      });
      devices = devices;
    }, 30000);
  });

  function formatTime(date) {
    return date.toLocaleTimeString('fr-FR');
  }
</script>

<div class="container">
  <header>
    <h1>🌤️ Météo IoT</h1>
    <div class="status" class:connected={status === 'Connecté'}>
      {status}
    </div>
  </header>

  <main>
    {#if Object.keys(devices).length > 0}
      <div class="grid">
        {#each Object.entries(devices) as [id, device]}
          <div class="card" class:offline={!device.online}>
            <h2>{device.city}</h2>
            <div class="temp">{device.temperature}°C</div>
            <div class="info">
              <p>💧 Humidité: {device.humidity}{device.humidity !== 'N/A' ? '%' : ''}</p>
              <p>🔋 Batterie: {device.battery}{device.battery !== 'N/A' ? '%' : ''}</p>
              <p class="time">🕐 {formatTime(device.lastUpdate)}</p>
            </div>
            <div class="badge" class:online={device.online}>
              {device.online ? 'En ligne' : 'Hors ligne'}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="card waiting">
        <p>⏳ En attente de données...</p>
      </div>
    {/if}
  </main>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  header {
    text-align: center;
    margin-bottom: 40px;
  }

  h1 {
    color: #333;
    margin-bottom: 15px;
  }

  .status {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 20px;
    background: #f44336;
    color: white;
    font-size: 14px;
  }

  .status.connected {
    background: #4caf50;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    position: relative;
    transition: all 0.3s;
  }

  .card.offline {
    opacity: 0.6;
    background: #f5f5f5;
  }

  .card.waiting {
    text-align: center;
    color: #666;
    grid-column: 1 / -1;
  }

  h2 {
    margin: 0 0 10px 0;
    color: #2196f3;
    font-size: 20px;
  }

  .temp {
    font-size: 48px;
    font-weight: bold;
    color: #333;
    margin: 10px 0;
  }

  .info {
    margin: 15px 0;
    font-size: 14px;
    color: #666;
  }

  .info p {
    margin: 5px 0;
  }

  .time {
    font-size: 12px;
    color: #999;
  }

  .badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    background: #f44336;
    color: white;
  }

  .badge.online {
    background: #4caf50;
  }

  :global(body) {
    background: #f5f5f5;
    margin: 0;
  }
</style>
