import { z } from "zod";

export const tripSchema = z.object({
  name: z.string().min(2),
  destinationCity: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  totalBudget: z.coerce.number().positive(),
  baseCurrency: z.string().min(3).max(3)
});

export const expenseSchema = z.object({
  title: z.string().min(2),
  category: z.enum(["FOOD", "TRANSPORT", "HOTEL", "ACTIVITIES", "OTHER"]),
  amount: z.coerce.number().positive(),
  currency: z.string().min(3).max(3),
  date: z.string()
});

export const packingItemSchema = z.object({
  name: z.string().min(1)
});

export const mapLocationSchema = z.object({
  label: z.string().min(1),
  markerType: z.enum(["HOTEL", "RESTAURANT", "TOURIST_SPOT", "CUSTOM"]),
  note: z.string().default(""),
  lat: z.coerce.number(),
  lng: z.coerce.number()
});