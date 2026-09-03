/**
 * Modelo de datos (Etapa 2, conectado al backend):
 * profiles, exercises, workout_plans, workout_days, workout_exercises,
 * workout_sessions, exercise_sets.
 * Este archivo sólo conserva los tipos compartidos y textos estáticos de la UI.
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

export const suggestedQuestions = [
  "¿Qué entreno hoy?",
  "¿Cómo puedo sustituir un ejercicio?",
  "¿Cuánto duró mi último entrenamiento?",
  "¿Cómo voy con mi progreso?",
];
