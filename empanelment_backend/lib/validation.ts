// lib/validation.ts
import { z } from 'zod';

export const applicationSchema = z.object({
  department: z.string(),
  item_category: z.string(),
  item_name: z.string(),
  item_description: z.string(),
  technical_specs: z.string(),
  compliance_requirements: z.string(),
  estimated_value: z.string().optional(),
  delivery_timeline: z.string().optional(),
  previous_experience: z.string().optional(),
  certifications: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected']).optional(),
  is_draft: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  submitted_at: z.string().optional(),
});

export const updateApplicationSchema = applicationSchema.partial();

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const fileUploadSchema = z.object({
  application_id: z.string().min(1, 'Application ID is required'),
});

export const validateApplication = (data: unknown) => {
  return applicationSchema.parse(data);
};

export const validateUpdateApplication = (data: unknown) => {
  return updateApplicationSchema.parse(data);
};

export const validatePagination = (data: unknown) => {
  return paginationSchema.parse(data);
};

export const validateFileUpload = (data: unknown) => {
  return fileUploadSchema.parse(data);
};