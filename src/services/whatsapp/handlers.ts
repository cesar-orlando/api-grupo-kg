import { Message } from 'whatsapp-web.js';
import { openai } from '../openai';
import { Table } from '../../models/table.model';
import { DynamicRecord } from '../../models/record.model';

export async function handleIncomingMessage(message: Message) {
  const content = message.body.toLowerCase();

  // Paso 1: Verificar si existe la tabla 'clientes'
  let clientesTable = await Table.findOne({ slug: 'clientes' });

  if (!clientesTable) {
    console.log('📂 Tabla "clientes" no existe, creando...');
  
    clientesTable = await Table.create({
      name: 'Clientes',
      slug: 'clientes',
      icon: 'users', // o el que prefieras
    });
  
    // 🚨 Solo crea un primer registro base si realmente es nueva
    await DynamicRecord.create({
      tableSlug: 'clientes',
      customFields: [
        {
          key: 'telefono',
          label: 'Teléfono',
          value: '', // se llenará después
          type: 'text',
          visible: true,
        },
      ],
    });
  } else {
    console.log('✅ Tabla "clientes" ya existe, continuando...');
  }

  // Paso 2: Obtener campos dinámicos existentes (desde el primer registro)
  const exampleRecord = await DynamicRecord.findOne({ tableSlug: 'clientes' });
  const fieldTemplate = exampleRecord?.customFields || [];

  const mapData: Record<string, any> = {
    telefono: message.from,
    fuente: 'WhatsApp',
    // podrías agregar más si los capturas del mensaje en el futuro
  };

  const dynamicFields = fieldTemplate.map((field) => ({
    key: field.key,
    label: field.label,
    type: field.type,
    visible: field.visible,
    required: field.required,
    value: mapData[field.key] ?? null,
  }));

  // Paso 3: Crear nuevo registro dinámico en Mongo
  await DynamicRecord.create({
    tableSlug: 'clientes',
    customFields: dynamicFields,
  });

  // Paso 4: Lógica simple
  if (content.includes('ver casa') || content.includes('agendar')) {
    await message.reply('¡Perfecto! ¿En qué zona estás buscando y cuál es tu presupuesto aproximado?');
    return;
  }

  // Paso 5: GPT para casos generales
  const gptPrompt = `Eres un asistente de bienes raíces. El cliente dijo: "${content}". Respóndele cordialmente y trata de obtener más información o agendar.`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: gptPrompt }],
  });

  const reply = res.choices[0].message?.content || 'No entendí muy bien, ¿me puedes repetir la información?';
  await message.reply(reply);
}
