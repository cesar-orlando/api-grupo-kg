import Chat from "../models/chat.model";
import { getAIResponse } from "../services/ai";
import axios from "axios";

export const handleIncomingWhatsappMessage = async (message: any) => {
  console.log("Entró a handleIncomingWhatsappMessage:", message.from, message.body);

  // Log para ver todos los mensajes que llegan en tiempo real
  console.log(`[${new Date().toLocaleString()}] Mensaje recibido de ${message.from}: ${message.body}`);

  // Solo procesar mensajes del chat específico
  // if (message.from !== '5213322155070@c.us') {
  //   return;
  // }

  const phone = message.from;
  const name = message._data.notifyName || ""; // O usa otro campo si tienes el nombre
  const content = message.body;
  const timestamp = new Date(message.timestamp * 1000);

  let chat = await Chat.findOne({ phone });
  if (!chat) {
    chat = new Chat({
      phone,
      name,
      messages: [],
      conversationStart: timestamp,
    });
  }

  chat.messages.push({
    direction: "inbound",
    body: content,
    dateCreated: timestamp,
    respondedBy: "human",
  });

  // Llama a la IA
  const aiReply = await getAIResponse(content, phone);
  console.log("Respuesta de la IA:", aiReply);

  // Validar que la respuesta de la IA sea un string válido
  if (!aiReply || typeof aiReply !== 'string') {
    console.error("Error: Respuesta de IA inválida:", aiReply);
    await message.reply("Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.");
    return;
  }

  // Responde al usuario
  await message.reply(aiReply);

  chat.messages.push({
    direction: "outbound-bot",
    body: aiReply,
    dateCreated: new Date(),
    respondedBy: "bot",
  });

  try {
    await chat.save();
  } catch (error) {
    console.error("Error al guardar el chat:", error);
    // No enviamos mensaje al usuario aquí para evitar duplicados
  }
};
