import { z } from "zod";

export const loginSchema = z.object({
  companyId: z.coerce.number().int().positive(),
  username: z.string().min(1),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  companyId: z.coerce.number().int().positive(),
  fullName: z.string().min(1),
  phone: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  desiredRole: z.enum(["TEAM_LEAD", "TECH"]).default("TECH"),
  teamName: z.string().optional().default(""),
  salaryMonthly: z.coerce.number().nonnegative().optional().default(0),
});

export const approveRegSchema = z.object({
  registrationId: z.coerce.number().int().positive(),
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["HR_ADMIN", "TEAM_LEAD", "TECH"]),
  teamId: z.coerce.number().int().optional().nullable(),
  teamName: z.string().optional().default(""),
  fullName: z.string().min(1),
  salary: z.coerce.number().nonnegative().optional().default(0),
});

export const leaveCreateSchema = z.object({
  leaveType: z.enum(["SICK","PERSONAL","VACATION"]),
  startDate: z.string().min(10),
  endDate: z.string().min(10),
  note: z.string().optional().default(""),
});

export const advanceCreateSchema = z.object({
  amount: z.coerce.number().int().positive(),
  reason: z.string().min(1),
});

export const decideSchema = z.object({
  id: z.coerce.number().int().positive(),
  decision: z.enum(["APPROVE","REJECT"]),
  rejectReason: z.string().optional().default(""),
});
