import pressBanca from "@/assets/ex-press-banca.jpg";
import fondos from "@/assets/ex-fondos.jpg";
import pressInclinado from "@/assets/ex-press-inclinado-mancuernas.jpg";
import aperturas from "@/assets/ex-aperturas-mancuernas.jpg";
import tricepsPolea from "@/assets/ex-extension-triceps-polea.jpg";
import tricepsMancuerna from "@/assets/ex-extension-triceps.jpg";
import pressFrances from "@/assets/ex-press-frances.jpg";
import sentadillaBarra from "@/assets/ex-sentadilla-barra.jpg";
import prensaPiernas from "@/assets/ex-prensa-piernas.jpg";
import extensionCuadriceps from "@/assets/ex-extension-cuadriceps.jpg";
import curlFemoral from "@/assets/ex-curl-femoral.jpg";
import dominadas from "@/assets/ex-dominadas.jpg";
import remoBarra from "@/assets/ex-remo-barra.jpg";
import jalonAlPecho from "@/assets/ex-jalon-al-pecho.jpg";
import pressMilitar from "@/assets/ex-press-militar.jpg";
import elevacionesLaterales from "@/assets/ex-elevaciones-laterales.jpg";
import curlBarra from "@/assets/ex-curl-barra.jpg";
import curlMartillo from "@/assets/ex-curl-martillo.jpg";
import hipThrust from "@/assets/ex-hip-thrust.jpg";
import pesoMuertoRumano from "@/assets/ex-peso-muerto-rumano.jpg";
import planchaAbdominal from "@/assets/ex-plancha-abdominal.jpg";
import carreraCinta from "@/assets/ex-carrera-cinta.jpg";

/** Relación 1:1 entre el ejercicio (slug / image_key) y su foto. */
const map: Record<string, string> = {
  "press-banca": pressBanca,
  fondos,
  "press-inclinado-mancuernas": pressInclinado,
  "aperturas-mancuernas": aperturas,
  "extension-triceps-polea": tricepsPolea,
  "extension-triceps": tricepsMancuerna,
  "press-frances": pressFrances,
  "sentadilla-barra": sentadillaBarra,
  "prensa-piernas": prensaPiernas,
  "extension-cuadriceps": extensionCuadriceps,
  "curl-femoral": curlFemoral,
  dominadas,
  "remo-barra": remoBarra,
  "jalon-al-pecho": jalonAlPecho,
  "press-militar": pressMilitar,
  "elevaciones-laterales": elevacionesLaterales,
  "curl-barra": curlBarra,
  "curl-martillo": curlMartillo,
  "hip-thrust": hipThrust,
  "peso-muerto-rumano": pesoMuertoRumano,
  "plancha-abdominal": planchaAbdominal,
  "carrera-cinta": carreraCinta,
};

export function exerciseImage(key: string): string {
  return map[key] ?? pressBanca;
}

export const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Piernas",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Core",
  "Glúteos",
  "Cardio",
] as const;
