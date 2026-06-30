'use strict';

const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  state: z.string().trim().max(60).optional(),
  city: z.string().trim().max(60).optional(),
  pincode: z.string().trim().max(12).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    state: z.string().trim().max(60).optional(),
    city: z.string().trim().max(60).optional(),
    pincode: z.string().trim().max(12).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

module.exports = { registerSchema, loginSchema, updateProfileSchema };
