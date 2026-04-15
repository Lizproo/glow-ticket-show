import event1 from "@/assets/event1.jpg";
import event2 from "@/assets/event2.jpg";
import event3 from "@/assets/event3.jpg";
import event4 from "@/assets/event4.jpg";
import event5 from "@/assets/event5.jpg";

export interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  image: string;
  description: string;
  availableSeats: number;
  totalSeats: number;
}

export interface Ticket {
  id: string;
  event: Event;
  seat: string;
  section: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  status: "active" | "used" | "expired";
  qrCode: string;
}

export const categories = [
  { id: "all", label: "Todos", icon: "🎪" },
  { id: "concerts", label: "Conciertos", icon: "🎵" },
  { id: "theater", label: "Teatro", icon: "🎭" },
  { id: "comedy", label: "Comedia", icon: "😂" },
  { id: "festivals", label: "Festivales", icon: "🎉" },
  { id: "sports", label: "Deportes", icon: "⚽" },
];

export const events: Event[] = [
  {
    id: "1",
    title: "Reggaeton Fest 2026",
    category: "concerts",
    date: "2026-05-15",
    time: "20:00",
    venue: "Estadio Nacional",
    city: "Ciudad de México",
    price: 85,
    image: event1,
    description: "El festival de reggaetón más grande de Latinoamérica con los mejores artistas del género. Una noche inolvidable llena de ritmo y energía.",
    availableSeats: 2500,
    totalSeats: 5000,
  },
  {
    id: "2",
    title: "Romeo y Julieta",
    category: "theater",
    date: "2026-05-20",
    time: "19:30",
    venue: "Teatro Principal",
    city: "Bogotá",
    price: 45,
    image: event2,
    description: "La obra clásica de Shakespeare en una producción moderna y espectacular. Actuaciones magistrales que te dejarán sin aliento.",
    availableSeats: 150,
    totalSeats: 300,
  },
  {
    id: "3",
    title: "Noche de Stand-Up",
    category: "comedy",
    date: "2026-05-25",
    time: "21:00",
    venue: "Sala Comedy Club",
    city: "Buenos Aires",
    price: 30,
    image: event3,
    description: "Los mejores comediantes de habla hispana en una noche de risas sin parar. Humor inteligente y diversión garantizada.",
    availableSeats: 80,
    totalSeats: 200,
  },
  {
    id: "4",
    title: "Electro Wave Festival",
    category: "festivals",
    date: "2026-06-01",
    time: "16:00",
    venue: "Parque de la Exposición",
    city: "Lima",
    price: 120,
    image: event4,
    description: "Festival de música electrónica con DJs internacionales, escenarios espectaculares y experiencias inmersivas de luz y sonido.",
    availableSeats: 3000,
    totalSeats: 8000,
  },
  {
    id: "5",
    title: "Final Copa Libertadores",
    category: "sports",
    date: "2026-06-10",
    time: "18:00",
    venue: "Estadio Monumental",
    city: "Santiago",
    price: 150,
    image: event5,
    description: "La gran final del torneo más importante del fútbol sudamericano. Vive la pasión y la emoción del deporte rey.",
    availableSeats: 5000,
    totalSeats: 45000,
  },
];

export const sampleTickets: Ticket[] = [
  {
    id: "t1",
    event: events[0],
    seat: "A-15",
    section: "VIP",
    quantity: 2,
    totalPrice: 170,
    purchaseDate: "2026-04-10",
    status: "active",
    qrCode: "GLOW-2026-001-A15",
  },
  {
    id: "t2",
    event: events[2],
    seat: "F-8",
    section: "General",
    quantity: 1,
    totalPrice: 30,
    purchaseDate: "2026-04-12",
    status: "active",
    qrCode: "GLOW-2026-003-F8",
  },
];
