import { openai } from "../services/openai";
import { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat";
import { searchProperties as searchPropertiesController, searchCommission as searchCommissionController } from "../controllers/record.controller";
import { DynamicRecord } from "../models/record.model";
import Chat from "../models/chat.model";

const SYSTEM_PROMPT = `
Eres Sophie, la recepcionista inteligente y estratega comercial de Grupo KG Bienes Raíces.
Tienes un trato cálido, directo y muy humano. Tu tono es profesional pero relajado, como el de una persona de confianza que lleva años trabajando en el ramo inmobiliario de Jalisco.

Tu misión no es solo responder dudas, sino guiar con seguridad al cliente para obtener su información, ofrecerle opciones reales y agendar una cita con un asesor humano.

# Personality

Eres Sophie, la recepcionista inteligente y estratega comercial de Grupo KG Bienes Raíces.  
Tienes un trato cálido, directo y muy humano. Tu tono es profesional pero relajado, como el de una persona de confianza que lleva años trabajando en el ramo inmobiliario de Jalisco.

Tu misión no es solo responder dudas, sino guiar con seguridad al cliente para obtener su información, ofrecerle opciones reales y agendar una cita con un asesor humano.

Sabes cómo hablar con personas que vieron un letrero en la calle, buscan por internet o simplemente están explorando. Entiendes cómo se expresa la gente en México y reconoces cuando un cliente está listo para avanzar.

# Conversational Flow

2. Cuando el cliente dice algo, te presentas:  
   "Hola, soy Sophie, recepcionista de Grupo KG Bienes Raíces. ¿En qué te puedo ayudar?"

3. Haces preguntas clave, según el tono del cliente:
   - ¿Qué tipo de propiedad estás buscando? (casa, terreno, departamento)
   - ¿Para compra, renta o inversión?
   - ¿En qué zona o colonia?
   - ¿Cuál es tu presupuesto aproximado?
   - ¿Cuántas recámaras necesitas?

4. Si menciona una zona específica, como "Valle Imperial" o "Zapopan", activa el tool search_properties con ese valor.

5. Si el cliente pregunta por comisiones, activa check_commission.

6. Cuando el cliente ya te dio:
   - Su nombre
   - Su número de WhatsApp
   - Tipo de propiedad
   - Zona de interés

   Entonces activa el tool log_lead para registrar al prospecto.

# Goal

Tu objetivo es identificar buenos prospectos, brindar información clara y **lograr que te den su WhatsApp para enviar ficha técnica y agendar cita**.

Si el cliente está listo, ofrécele:
> "¿Te gustaría que uno de nuestros asesores te contacte para mostrarte opciones y ayudarte personalmente?"

# Guardrails

- Nunca digas "soy una inteligencia artificial".  
- Nunca repitas herramientas como log_lead o search_properties en voz alta.  
- Si no tienes información de algo, ofrece enviar la ficha técnica por WhatsApp.
- Si el cliente no dice nada, puedes decir:  
   "¿Hola? ¿Estás ahí? Si estás buscando casa o terreno, con gusto te puedo ayudar."

# Natural Language

Habla como una persona real, con expresiones suaves y amables:
- "Claro", "Perfecto", "Con gusto", "¿Te parece bien?"
- Usa pausas naturales ("..."), y sonidos coloquiales si aplica.

Siempre adaptas tu tono:  
- Si el cliente es serio, tú también.  
- Si es relajado, puedes sonar más casual.  
- Si tiene prisa, vas al grano.

# Ejemplo de cierre

> "Entonces te mando la ficha técnica por WhatsApp. ¿Me puedes compartir tu número, por favor?"
`;

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_properties",
      description: "Busca propiedades en una zona, colonia o lugar específico cuando el cliente menciona una ubicación.",
      parameters: {
        type: "object",
        properties: {
          zona: {
            type: "string",
            description: "Zona, colonia o lugar de interés mencionado por el cliente"
          }
        },
        required: ["zona"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_commission",
      description: "Verifica si la propiedad mencionada está disponible para compartir comisión cuando el cliente pregunta por comisiones.",
      parameters: {
        type: "object",
        properties: {
          zona: {
            type: "string",
            description: "Zona, colonia o lugar de la propiedad para verificar comisión"
          }
        },
        required: ["zona"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "log_lead",
      description: "Registra un prospecto cuando el cliente ya proporcionó su nombre, número de WhatsApp, tipo de propiedad y zona de interés.",
      parameters: {
        type: "object",
        properties: {
          nombre: {
            type: "string",
            description: "Nombre completo del cliente"
          },
          telefono: {
            type: "string", 
            description: "Número de WhatsApp del cliente"
          },
          tipoPropiedad: {
            type: "string",
            description: "Tipo de propiedad que busca (casa, terreno, departamento, etc.)"
          },
          zona: {
            type: "string",
            description: "Zona o colonia de interés del cliente"
          }
        },
        required: ["nombre", "telefono", "tipoPropiedad", "zona"]
      }
    }
  }
];

// --- FUNCIONES PARA LOS TOOLS ---

export async function search_properties({ zona }: { zona: string }): Promise<string> {
  try {
    const mockReq = { body: { zona } } as any;
    const mockRes = {
      status: (code: number) => ({ json: (data: any) => data }),
      json: (data: any) => data
    } as any;

    const result = await searchPropertiesController(mockReq, mockRes);
    return result.response || `No encontré propiedades en ${zona}, pero tengo otras opciones. ¿Te gustaría que te comparta más información?`;
  } catch (error) {
    console.error("Error en search_properties:", error);
    return `Tuvimos un problema al buscar propiedades en ${zona}. ¿Te gustaría que te contacte un asesor directamente?`;
  }
}

export async function check_commission({ zona }: { zona: string }): Promise<string> {
  try {
    const mockReq = { body: { zona } } as any;
    const mockRes = {
      status: (code: number) => ({ json: (data: any) => data }),
      json: (data: any) => data
    } as any;

    const result = await searchCommissionController(mockReq, mockRes);
    return result.response || `No encontré información de comisión para ${zona}.`;
  } catch (error) {
    console.error("Error en check_commission:", error);
    return `Tuvimos un problema al verificar la comisión para ${zona}.`;
  }
}

export async function log_lead({ nombre, telefono, tipoPropiedad, zona }: { nombre: string, telefono: string, tipoPropiedad: string, zona: string }): Promise<string> {
  try {
    const customFields = [
      { key: "nombre", label: "Nombre", value: nombre, type: "text", visible: true },
      { key: "telefono", label: "Teléfono", value: telefono, type: "text", visible: true },
      { key: "tipoPropiedad", label: "Tipo de Propiedad", value: tipoPropiedad, type: "text", visible: true },
      { key: "zona", label: "Zona de Interés", value: zona, type: "text", visible: true },
      { key: "fuente", label: "Fuente", value: "WhatsApp", type: "text", visible: true },
      { key: "fechaRegistro", label: "Fecha de Registro", value: new Date().toISOString(), type: "date", visible: true }
    ];

    await DynamicRecord.create({
      tableSlug: "prospectos",
      customFields
    });

    return `¡Listo ${nombre}! Ya registré tus datos y un asesor especializado en ${zona} te contactará pronto al ${telefono}. ¿Te parece bien?`;
  } catch (error) {
    console.error("Error en log_lead:", error);
    return `Registré tu información ${nombre}, y un asesor te contactará pronto. ¡Gracias por tu interés!`;
  }
}

export const getAIResponse = async (message: string, phoneUser: string): Promise<string> => {
  // Obtener historial de mensajes del usuario
  const chatHistory = await Chat.findOne({ phone: phoneUser });

  let chatHistoryMessages =
    chatHistory?.messages.map((message) => {
      return {
        role: message.direction === "inbound" ? "user" : "assistant",
        content: message.body,
        ...(message.direction !== "inbound" && { name: "assistant_name" }),
      };
    }) || [];

  // Asegurarse de que sea un array
  if (!Array.isArray(chatHistoryMessages)) {
    chatHistoryMessages = [];
  }

  // Agregar contexto inicial y mensaje del usuario
  chatHistoryMessages.unshift({
    role: "system",
    content: SYSTEM_PROMPT,
  });

  chatHistoryMessages.push({
    role: "user",
    content: message,
  });

  // Llamada a OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: chatHistoryMessages as ChatCompletionMessageParam[],
    temperature: 0.7,
    top_p: 0.9,
    frequency_penalty: 2,
    presence_penalty: 0,
    tools: tools,
    tool_choice: "auto",
    max_tokens: 300
  });

  const toolCall = completion.choices[0].message.tool_calls?.[0];

  if (toolCall) {
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);
    
    switch (functionName) {
      case "search_properties":
        return search_properties(functionArgs);
      case "check_commission":
        return check_commission(functionArgs);
      case "log_lead":
        return log_lead(functionArgs);
      default:
        return "Un asesor se pondrá en contacto contigo en breve.";
    }
  }

  return completion.choices[0]?.message?.content || "No se pudo generar una respuesta.";
};
