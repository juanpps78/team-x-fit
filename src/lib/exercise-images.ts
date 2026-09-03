import pressBanca from "@/assets/ex-press-banca.jpg";
import mancuernas from "@/assets/ex-mancuernas.jpg";
import triceps from "@/assets/ex-triceps.jpg";

const map: Record<string, string> = {
  "press-banca": pressBanca,
  mancuernas,
  triceps,
};

export function exerciseImage(key: string): string {
  return map[key] ?? pressBanca;
}
