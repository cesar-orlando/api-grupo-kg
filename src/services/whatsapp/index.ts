import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { handleIncomingWhatsappMessage } from '../../controllers/whatsapp.controller';

export const whatsappClient = new Client({
  authStrategy: new LocalAuth({ clientId: 'grupokg' }), // guarda sesión en .wwebjs_auth
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

  whatsappClient.on('ready', async () => {
    console.log('✅ WhatsApp conectado y listo');
    const start = Date.now();
    setTimeout(async () => {
      const chats = await whatsappClient.getChats();
      const elapsed = (Date.now() - start) / 1000;
      console.log(`⏱️ Tiempo en traer los chats: ${elapsed.toFixed(2)} segundos`);
      console.log('Chats disponibles:');
      chats.forEach(chat => {
        const tipo = chat.isGroup ? 'Grupo' : 'Privado';
        const nombre = chat.name || chat.id.user || chat.id._serialized;
        const id = chat.id._serialized;
        const unread = chat.unreadCount || 0;
        // console.log(`- [${tipo}] ${nombre} (ID: ${id}) | No leídos: ${unread}`);
      });
      const chatId = '5213322155070@c.us';
      const chat = await whatsappClient.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit: 20 });
      console.log(`Mensajes recientes con ${chat.name}:`);
      messages.forEach(msg => {
        console.log(`[${new Date(msg.timestamp * 1000).toLocaleString()}] ${msg.fromMe ? 'Yo' : msg.author || msg.from}: ${msg.body}`);
      });
    }, 2000);
  });

    // ESTE ES EL EVENTO QUE FALTA:
    whatsappClient.on('message', async (message) => {
      // Solo responder a chats privados
      if (!message.from.endsWith("@c.us")) {
        console.log("entra aqui");
        return; // Ignora grupos, status, etc.
      }

      // Lista negra de números a los que NO debe responder la IA
      const blacklist = [
        "5213322155070@c.us", // Ejemplo: tu número
        // Agrega aquí los números que quieras excluir
      ];

      if (blacklist.includes(message.from)) {
        console.log("No respondo a este número");
        // Si el número está en la blacklist, no respondas
        return;
      }

      // Aquí sí puedes procesar el mensaje con IA
      await handleIncomingWhatsappMessage(message);
    });

  whatsappClient.initialize();
};
