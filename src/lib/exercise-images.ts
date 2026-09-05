import pressBanca from "@/assets/ex-press-banca.jpg";
import fondos from "@/assets/ex-fondos.jpg";
import pressInclinado from "@/assets/ex-press-inclinado-mancuernas.jpg";
import aperturas from "@/assets/ex-aperturas-mancuernas.jpg";
import tricepsPolea from "@/assets/ex-extension-triceps-polea.jpg";
import tricepsMancuerna from "@/assets/ex-extension-triceps.jpg";
import pressFrances from "@/assets/ex-press-frances.jpg";

/** Relación 1:1 entre el ejercicio (slug / image_key) y su foto. */
const map: Record<string, string> = {
  "press-banca": pressBanca,
  fondos,
  "press-inclinado-mancuernas": pressInclinado,
  "aperturas-mancuernas": aperturas,
  "extension-triceps-polea": tricepsPolea,
  "extension-triceps": tricepsMancuerna,
  "press-frances": pressFrances,
};

export function exerciseImage(key: string): string {
  return map[key] ?? pressBanca;
}
