import pressBanca from "@/assets/ex-press-banca.jpg";
import mancuernas from "@/assets/ex-mancuernas.jpg";
import triceps from "@/assets/ex-triceps.jpg";

/**
 * Modelo conceptual (Etapa 1, datos locales):
 * Users, WorkoutPlans, WorkoutDays, Exercises, WorkoutExercises,
 * WorkoutSessions, ExerciseSets, Progress, Goals, AIConversations.
 */

export type Exercise = {
  id: string;
  name: string;
  image: string;
  sets: number;
  reps: number;
  targetWeight: number;
  restSeconds: number;
  muscle: string;
};

export type LoggedExercise = {
  exerciseId: string;
  weight: number;
  reps: number;
  sets: number;
  notes?: string;
};

export type User = {
  name: string;
  goal: string;
  level: string;
  daysPerWeek: number;
  minutesPerSession: number;
  totalWorkouts: number;
  streak: number;
};

export const demoUser: User = {
  name: "Carlos",
  goal: "Ganar masa muscular",
  level: "Intermedio",
  daysPerWeek: 4,
  minutesPerSession: 60,
  totalWorkouts: 24,
  streak: 4,
};

export const workoutDay = {
  id: "day-1",
  title: "Pecho + Tríceps",
  estimatedMinutes: 55,
};

export const exercises: Exercise[] = [
  {
    id: "e1",
    name: "Press de banca",
    image: pressBanca,
    sets: 4,
    reps: 10,
    targetWeight: 60,
    restSeconds: 90,
    muscle: "Pecho",
  },
  {
    id: "e2",
    name: "Press inclinado con mancuernas",
    image: mancuernas,
    sets: 4,
    reps: 10,
    targetWeight: 24,
    restSeconds: 90,
    muscle: "Pecho",
  },
  {
    id: "e3",
    name: "Aperturas con mancuernas",
    image: mancuernas,
    sets: 4,
    reps: 12,
    targetWeight: 14,
    restSeconds: 60,
    muscle: "Pecho",
  },
  {
    id: "e4",
    name: "Fondos",
    image: pressBanca,
    sets: 4,
    reps: 10,
    targetWeight: 0,
    restSeconds: 90,
    muscle: "Pecho",
  },
  {
    id: "e5",
    name: "Extensión de tríceps en polea",
    image: triceps,
    sets: 4,
    reps: 12,
    targetWeight: 30,
    restSeconds: 60,
    muscle: "Tríceps",
  },
  {
    id: "e6",
    name: "Press francés",
    image: triceps,
    sets: 4,
    reps: 10,
    targetWeight: 25,
    restSeconds: 75,
    muscle: "Tríceps",
  },
  {
    id: "e7",
    name: "Extensión de tríceps",
    image: triceps,
    sets: 4,
    reps: 12,
    targetWeight: 12,
    restSeconds: 60,
    muscle: "Tríceps",
  },
];

export const lastWorkout = {
  title: "Pecho + Tríceps",
  when: "Ayer",
  minutes: 52,
  volume: 6520,
};

export const volumeHistory = [
  { week: "S1", volumen: 5100 },
  { week: "S2", volumen: 5480 },
  { week: "S3", volumen: 5320 },
  { week: "S4", volumen: 5950 },
  { week: "S5", volumen: 6180 },
  { week: "S6", volumen: 6520 },
  { week: "S7", volumen: 7040 },
];

export const personalRecords = [
  { name: "Press de banca", value: 65 },
  { name: "Sentadilla", value: 90 },
  { name: "Peso muerto", value: 110 },
];

export const suggestedQuestions = [
  "¿Qué entreno hoy?",
  "¿Cómo puedo sustituir un ejercicio?",
  "¿Cuánto descansé en mi último entrenamiento?",
  "¿Cómo voy con mi progreso?",
];
