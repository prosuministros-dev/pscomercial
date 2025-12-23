/**
 * Módulo WhatsApp - HU-0012
 * Exportaciones centralizadas - SOLO CLIENTE
 *
 * IMPORTANTE: Este archivo solo exporta código compatible con 'use client'.
 * Para código de servidor, importar directamente desde:
 * - './queries/whatsapp.api' (server-only)
 * - './actions/whatsapp.actions' (server actions)
 */

// Schemas y tipos (compartidos)
export * from './schemas/whatsapp.schema';

// Hooks (client-side)
export * from './hooks/use-whatsapp';
