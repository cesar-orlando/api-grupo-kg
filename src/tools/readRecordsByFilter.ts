import { DynamicRecord } from "../models/record.model";

export const readRecordsByFilter = async (tableSlug: string, filters: Record<string, any>) => {
  console.log("🔍 Iniciando readRecordsByFilter...");
  console.log("📂 Tabla:", tableSlug);
  console.log("📌 Filtros recibidos:", filters);

  const allRecords = await DynamicRecord.find({ tableSlug }).lean();
  console.log(`📋 Total de registros encontrados: ${allRecords.length}`);

  const normaliza = (txt: any) =>
    String(txt || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const resultados = allRecords.filter((record: any) => {
    const campos = record.customFields || [];

    return Object.entries(filters).every(([filtroKey, filtroValor]) => {
      const normalFiltroKey = normaliza(filtroKey);

      const valorFiltro = typeof filtroValor === "string"
        ? Number(filtroValor.replace(/[^0-9.]/g, ""))
        : filtroValor;

      let campo = campos.find(
        (c: any) =>
          normaliza(c.key).includes(normalFiltroKey) ||
          normaliza(c.label).includes(normalFiltroKey)
      );

      // Buscar heurísticamente en la descripción si es recámaras, precio, metros
      if (
        !campo &&
        ["precio", "price", "recamaras", "bedrooms", "metros"].includes(normalFiltroKey)
      ) {
        const campoDescripcion = campos.find((c: any) =>
          normaliza(c.key).includes("descripcion") ||
          normaliza(c.label).includes("descripcion")
        );

        if (campoDescripcion && typeof campoDescripcion.value === "string") {
          const match = campoDescripcion.value.match(/(\d{1,3}(,\d{3})*|\d+)(\s*(m2|metros|recámaras|cuartos|millones))?/i);
          if (match) {
            const numero = Number(match[1].replace(/,/g, ""));
            campo = { ...campoDescripcion, value: numero };
          }
        }
      }

      if (!campo) return false;

      const valorCampo = typeof campo.value === "string"
        ? Number(campo.value.replace(/[^0-9.]/g, ""))
        : campo.value;

      if (isNaN(valorCampo) || isNaN(valorFiltro)) return false;

      // 🔥 CAMBIO CLAVE:
      if (["precio", "price"].includes(normalFiltroKey)) {
        return valorCampo <= valorFiltro; // Filtrar por menor o igual
      }

      // Para los demás, puedes mantener tolerancia de ±1 si quieres
      const tolerancia = 1;
      return Math.abs(valorCampo - valorFiltro) <= tolerancia;
    });
  });

  console.log(`✅ Total de resultados filtrados: ${resultados.length}`);
  return resultados;
};
