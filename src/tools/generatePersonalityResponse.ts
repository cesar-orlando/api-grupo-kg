import OpenAI from "openai";
import { ChatCompletionTool } from "openai/resources/chat";
import { DynamicRecord } from "../models/record.model";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "read_records_by_filter",
      description: "Filtra propiedades según los criterios del usuario como precio, ciudad o número de habitaciones.",
      parameters: {
        type: "object",
        properties: {
          precio: {
            type: "string",
            description: "El precio máximo que el usuario está dispuesto a pagar.",
          },
          ciudad: {
            type: "string",
            description: "La ciudad o zona donde busca la propiedad.",
          },
          habitaciones: {
            type: "string",
            description: "La cantidad de habitaciones deseadas.",
          },
        },
        required: ["precio", "ciudad", "habitaciones"],
      },
    },
  },
];

// Helper para limpiar texto

export const read_records_by_filter = async (precio: string, ciudad: string, habitaciones: string): Promise<string> => {
  try {
    const tableSlug = "propiedades";
    const allRecords = await DynamicRecord.find({ tableSlug }).lean();

    const targetPrecio = parseInt(precio);
    const targetHabitaciones = parseInt(habitaciones);
    const ciudadNormalized = ciudad.toLowerCase();

    const getField = (fields: any[], keys: string[]): any => {
      const found = fields.find((f: any) => keys.some((k) => f.label?.toLowerCase() === k.toLowerCase()));
      return found?.value;
    };

    const filtrar = (criterios: { precio?: boolean; habitaciones?: boolean; ciudad?: boolean }) => {
      return allRecords.filter((record: any) => {
        const fields = record.customFields || [];

        const recordPrecio = parseInt(getField(fields, ["precio"]) || "0");
        const recordCiudad = (getField(fields, ["ciudad", "ubicacion"]) || "").toLowerCase();
        const recordHabitaciones = parseInt(getField(fields, ["recamaras", "recámaras", "habitaciones"]) || "0");

        return (
          (criterios.precio ? (!isNaN(targetPrecio) ? recordPrecio <= targetPrecio : true) : true) &&
          (criterios.habitaciones
            ? !isNaN(targetHabitaciones)
              ? recordHabitaciones === targetHabitaciones
              : true
            : true) &&
          (criterios.ciudad ? (ciudadNormalized ? recordCiudad.includes(ciudadNormalized) : true) : true)
        );
      });
    };

    let matches = filtrar({ precio: true, habitaciones: true, ciudad: true });

    if (matches.length === 0) matches = filtrar({ precio: true });
    if (matches.length === 0) matches = filtrar({ habitaciones: true });
    if (matches.length === 0) matches = filtrar({ ciudad: true });

    if (matches.length === 0) {
      return "No encontré propiedades exactas ni similares con esos criterios. ¿Quieres intentar con otros parámetros?";
    }

    const top = matches.slice(0, 3);
    let msg = "📍 Estas son algunas opciones que podrían interesarte:\n\n";

    top.forEach((record: any, index: number) => {
      const fields = record.customFields || [];

      const getVal = (labels: string[]) =>
        fields.find((f: any) => labels.includes(f.label))?.value || "No especificado";

      const fotos = getVal(["Archivos"]);
      const descripcion = getVal(["Descripción"]);

      msg += `🏡 *Propiedad ${index + 1}:*\n`;
      msg += `• Precio: ${getVal(["Precio"])}\n`;
      msg += `• Ciudad: ${getVal(["Ciudad", "Ubicacion"])}\n`;
      msg += `• Recámaras: ${getVal(["Recamaras", "Recámaras", "Habitaciones"])}\n`;
      msg += `• Tamaño: ${getVal(["Tamaño", "Metros"])}\n`;
      msg += `• Descripción: ${descripcion}\n`;

      if (Array.isArray(fotos) && fotos.length > 0) {
        msg += `• Fotos:\n`;
        fotos.forEach((url: string) => {
          msg += `${url}\n`;
        });
      }

      msg += `\n`;
    });

    msg += "¿Te gustaría agendar una cita o ver más opciones?";
    return msg;
  } catch (error: any) {
    console.error("❌ Error en read_records_by_filter:", error.message);
    return "Hubo un error al buscar propiedades. Intenta nuevamente.";
  }
};

export const generatePersonalityResponse = async (fullMessages: any[]): Promise<string> => {
  // 4. Llamada a OpenAI con tools y contexto
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: fullMessages,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 2,
    presence_penalty: 0,
    tools: tools,
    tool_choice: "auto",
  });

  const toolCall = completion.choices[0].message.tool_calls?.[0];
  if (toolCall) {
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);

    console.log("functionArgs --->", functionArgs);

    switch (functionName) {
      case "read_records_by_filter":
        const response = await read_records_by_filter(
          functionArgs.precio,
          functionArgs.ciudad,
          functionArgs.habitaciones
        );
        return response;
      default:
        const reponse = "No se encontró la función solicitada.";
        return reponse;
    }
  }

  console.log("completion.choices[0].message.content --->", completion.choices[0].message.content);

  return (
    completion.choices[0].message.content ??
    "En este momento nos encontramos ocupados.¿Te gustaría agendar una cita o ver más opciones?"
  );
};
