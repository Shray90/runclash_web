export type UserRole = "freelancer" | "client";

export type FitnessGoal = "loose" | "stay" | "gain";

export interface IUser {
  fullName: string;
  email: string;
  role: UserRole;
  heightCm: number;
  weightKg: number;
  fitnessGoal: FitnessGoal;
  password: string;
}

