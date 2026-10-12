import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
    email: z.string().trim().toLowerCase().email("Email tidak valid"),
    phone: z.string().trim().regex(/^(\+62|62|0)8[0-9]{8,12}$/, "Nomor WhatsApp tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter").max(72),
    confirmPassword: z.string(),
    role: z.enum(["USER", "SELLER"]).default("USER"),
    terms: z.literal(true, { errorMap: () => ({ message: "Anda harus menyetujui Syarat & Ketentuan" }) }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
  remember: z.boolean().optional(),
});

export const listingSchema = z.object({
  title: z.string().trim().min(5, "Judul minimal 5 karakter").max(120),
  description: z.string().trim().min(20, "Deskripsi minimal 20 karakter").max(5000),
  type: z.enum(["SALE", "RENT"]),
  categoryId: z.string().optional().nullable(),
  price: z.coerce.number().int().positive("Harga harus lebih dari 0"),
  negotiable: z.boolean().default(true),
  province: z.string().trim().min(2, "Provinsi wajib diisi"),
  city: z.string().trim().min(2, "Kota/Kabupaten wajib diisi"),
  district: z.string().trim().min(2, "Kecamatan wajib diisi"),
  village: z.string().trim().optional().nullable(),
  address: z.string().trim().min(5, "Alamat wajib diisi"),
  latitude: z.coerce.number().min(-11).max(6).optional().nullable(),
  longitude: z.coerce.number().min(95).max(141).optional().nullable(),
  landArea: z.coerce.number().positive().optional().nullable(),
  buildingArea: z.coerce.number().positive().optional().nullable(),
  width: z.coerce.number().positive().optional().nullable(),
  length: z.coerce.number().positive().optional().nullable(),
  floor: z.coerce.number().int().min(1).max(20).default(1),
  yearBuilt: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  electricity: z.string().trim().max(40).optional().nullable(),
  water: z.string().trim().max(40).optional().nullable(),
  condition: z.enum(["NEW", "USED"]).default("USED"),
  facilities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).min(1, "Minimal 1 foto").max(20, "Maksimal 20 foto"),
  primaryIndex: z.number().int().min(0).default(0),
  videoUrl: z.string().url().optional().nullable(),
});

export const reportSchema = z.object({
  listingId: z.string().min(1),
  reason: z.enum(["FRAUD", "WRONG_PRICE", "FAKE_PHOTO", "FAKE_LOCATION", "SUSPICIOUS_DOCUMENT", "OTHER"]),
  detail: z.string().trim().max(1000).optional(),
});

export const messageSchema = z.object({ body: z.string().trim().min(1).max(2000) });

export const verificationSchema = z.object({
  fullName: z.string().trim().min(2, "Nama lengkap wajib diisi"),
  phone: z.string().trim().min(8, "Nomor HP wajib diisi"),
  ktpUrl: z.string().url("Foto KTP wajib diunggah"),
  selfieUrl: z.string().url("Selfie wajib diunggah"),
  docUrl: z.string().url().optional().nullable(),
});

export const reviewSchema = z.object({
  listingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export type ListingInput = z.infer<typeof listingSchema>;
