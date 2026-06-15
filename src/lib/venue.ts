export type VenueType = "theater" | "stadium" | "coliseum" | "arena";

export interface VenueLayout {
  type: VenueType;
  label: string;
  stageLabel: string;
  sections: { id: string; label: string; multiplier: number; rows: string[]; seatsPerRow: number }[];
}

export const detectVenueType = (venue: string, category?: string): VenueType => {
  const v = (venue || "").toLowerCase();
  if (v.includes("teatro") || category === "theater" || category === "opera") return "theater";
  if (v.includes("estadio") || v.includes("hipódromo") || v.includes("hipodromo") || v.includes("parque")) return "stadium";
  if (v.includes("coliseo")) return "coliseum";
  return "arena";
};

export const getVenueLayout = (venue: string, category?: string): VenueLayout => {
  const type = detectVenueType(venue, category);
  switch (type) {
    case "theater":
      return {
        type,
        label: "Planimetría · Teatro",
        stageLabel: "Escenario",
        sections: [
          { id: "platea", label: "Platea", multiplier: 1.4, rows: ["A", "B", "C", "D", "E", "F"], seatsPerRow: 12 },
          { id: "palco", label: "Palco", multiplier: 2.2, rows: ["P1", "P2", "P3"], seatsPerRow: 8 },
          { id: "balcon", label: "Balcón", multiplier: 1, rows: ["A", "B", "C", "D"], seatsPerRow: 14 },
        ],
      };
    case "stadium":
      return {
        type,
        label: "Planimetría · Estadio",
        stageLabel: "Campo de juego",
        sections: [
          { id: "norte", label: "Tribuna Norte", multiplier: 1, rows: ["1", "2", "3", "4", "5", "6", "7", "8"], seatsPerRow: 14 },
          { id: "sur", label: "Tribuna Sur", multiplier: 1, rows: ["1", "2", "3", "4", "5", "6", "7", "8"], seatsPerRow: 14 },
          { id: "vip", label: "Palco VIP", multiplier: 2.8, rows: ["V1", "V2", "V3"], seatsPerRow: 10 },
          { id: "campo", label: "Campo", multiplier: 1.6, rows: ["C1", "C2", "C3", "C4"], seatsPerRow: 12 },
        ],
      };
    case "coliseum":
      return {
        type,
        label: "Planimetría · Coliseo",
        stageLabel: "Pista central",
        sections: [
          { id: "anillo1", label: "Anillo 1", multiplier: 2.4, rows: ["A", "B", "C"], seatsPerRow: 12 },
          { id: "anillo2", label: "Anillo 2", multiplier: 1.6, rows: ["D", "E", "F", "G"], seatsPerRow: 14 },
          { id: "anillo3", label: "Anillo 3", multiplier: 1, rows: ["H", "I", "J", "K"], seatsPerRow: 16 },
        ],
      };
    default:
      return {
        type: "arena",
        label: "Planimetría · Arena",
        stageLabel: "Escenario",
        sections: [
          { id: "pista", label: "Pista", multiplier: 1.5, rows: ["P1", "P2", "P3", "P4"], seatsPerRow: 14 },
          { id: "tribuna_a", label: "Tribuna A", multiplier: 1, rows: ["A", "B", "C", "D"], seatsPerRow: 12 },
          { id: "vip", label: "VIP", multiplier: 2.5, rows: ["V1", "V2"], seatsPerRow: 10 },
        ],
      };
  }
};
