import dotenv from 'dotenv';
dotenv.config(); // 👈 Esto carga las variables del archivo .env

import { startWhatsappBot } from './src/services/whatsapp';

startWhatsappBot();
