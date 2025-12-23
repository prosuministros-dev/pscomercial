import { z } from 'zod';

const PathsSchema = z.object({
  auth: z.object({
    signIn: z.string().min(1),
    signUp: z.string().min(1),
    verifyMfa: z.string().min(1),
    callback: z.string().min(1),
    passwordReset: z.string().min(1),
    passwordUpdate: z.string().min(1),
  }),
  app: z.object({
    home: z.string().min(1),
    profileSettings: z.string().min(1),
    // PS Comercial - Rutas de módulos
    leads: z.string().min(1),
    cotizaciones: z.string().min(1),
    pedidos: z.string().min(1),
    financiero: z.string().min(1),
    whatsapp: z.string().min(1),
    whatsappSettings: z.string().min(1),
    admin: z.string().min(1),
    analytics: z.string().min(1),
  }),
});

const pathsConfig = PathsSchema.parse({
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    verifyMfa: '/auth/verify',
    callback: '/auth/callback',
    passwordReset: '/auth/password-reset',
    passwordUpdate: '/update-password',
  },
  app: {
    home: '/home',
    profileSettings: '/home/settings',
    // PS Comercial - Rutas de módulos
    leads: '/home/leads',
    cotizaciones: '/home/cotizaciones',
    pedidos: '/home/pedidos',
    financiero: '/home/financiero',
    whatsapp: '/home/whatsapp',
    whatsappSettings: '/home/settings/whatsapp',
    admin: '/home/admin',
    analytics: '/home/analytics',
  },
} satisfies z.infer<typeof PathsSchema>);

export default pathsConfig;
