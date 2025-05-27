import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { handleIncomingMessage } from './handlers';

export const whatsappClient = new Client({
  authStrategy: new LocalAuth({ clientId: 'milkasa' }), // guarda sesión en .wwebjs_auth
  puppeteer: {
    headless: true,
    args: ['--no-sandbox'],
  },
});

export const startWhatsappBot = () => {
  whatsappClient.on('qr', (qr) => {
    console.log('[QR] Escanea este QR con WhatsApp:');
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp conectado y listo');
  });

  whatsappClient.on('message', async (message) => {
    await handleIncomingMessage(message);
  });

  whatsappClient.initialize();
};
