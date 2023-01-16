import { z } from "zod";

export const questionSchema = z.string().min(2).max(255);
export const answerSchema = z.string().min(1).max(255);
