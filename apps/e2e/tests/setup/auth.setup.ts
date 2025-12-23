import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Ir a la página de login
  await page.goto('/auth/sign-in');

  // Esperar que cargue el formulario
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });

  // Llenar credenciales
  await page.fill('input[name="email"]', 'comprasweb@prosuministros.com');
  await page.fill('input[name="password"]', 'Pr0sum1nistr0s2025**');

  // Click en submit
  await page.click('button[type="submit"]');

  // Esperar redirección a home
  await page.waitForURL('**/home**', { timeout: 30000 });

  // Verificar que estamos autenticados
  await expect(page.locator('body')).toBeVisible();

  // Guardar estado de autenticación
  await page.context().storageState({ path: authFile });
});
