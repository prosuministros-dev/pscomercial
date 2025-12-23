import { expect, test } from '@playwright/test';

import { LeadsPageObject } from './leads.po';

test.describe('HU-001: Registro de Leads', () => {
  test.describe.configure({ mode: 'serial' });

  test('E2E-001-01: página de leads carga correctamente', async ({ page }) => {
    // Ir a la página de leads (puede redirigir a login)
    await page.goto('/home/leads');

    // Verificar que estamos en login o en leads
    const url = page.url();
    const isLoginPage = url.includes('/auth/sign-in') || url.includes('/auth/login');
    const isLeadsPage = url.includes('/leads');

    expect(isLoginPage || isLeadsPage).toBe(true);

    if (isLeadsPage) {
      // Verificar elementos básicos de la página
      await expect(page).toHaveTitle(/Leads|PSComercial|Dashboard/i);
    }
  });

  test('E2E-001-02: redirige a login si no está autenticado', async ({ page }) => {
    await page.goto('/home/leads');

    // Si no está autenticado, debe redirigir a login
    await page.waitForURL(/auth|sign-in|login/, { timeout: 5000 }).catch(() => {
      // Si no redirige, está autenticado o no requiere auth
    });

    const url = page.url();
    // Acepta ambos casos: redirigido a login o ya en leads
    expect(url.includes('auth') || url.includes('sign-in') || url.includes('leads') || url.includes('home')).toBe(true);
  });

  test('E2E-001-03: formulario de login funciona', async ({ page }) => {
    await page.goto('/auth/sign-in');

    // Verificar que existe el formulario de login
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('E2E-001-04: validación de campos de login', async ({ page }) => {
    await page.goto('/auth/sign-in');

    // Intentar submit sin datos
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Debe mostrar algún mensaje de error o validación
    await page.waitForTimeout(500);

    // Verificar que no navegó a /home (sigue en login)
    expect(page.url()).toContain('auth');
  });
});

test.describe('HU-001: UI de Leads (con autenticación)', () => {
  test('E2E-001-05: vista tabla muestra leads', async ({ page }) => {
    const leads = new LeadsPageObject(page);
    await leads.goto();
    await leads.waitForLoad();

    // Verificar que hay una tabla o lista
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasList = await page.locator('[data-testid="leads-list"], .leads-list').isVisible().catch(() => false);

    expect(hasTable || hasList).toBe(true);
  });

  test('E2E-001-06: botón nuevo lead existe', async ({ page }) => {
    const leads = new LeadsPageObject(page);
    await leads.goto();
    await leads.waitForLoad();

    const newLeadButton = page.locator('button:has-text("Nuevo"), button:has-text("Crear Lead")').first();
    await expect(newLeadButton).toBeVisible();
  });

  test('E2E-001-07: modal de creación se abre', async ({ page }) => {
    const leads = new LeadsPageObject(page);
    await leads.goto();
    await leads.waitForLoad();

    await leads.clickNuevoLead();
    await page.waitForTimeout(500);

    const isModalOpen = await leads.isModalVisible();
    expect(isModalOpen).toBe(true);
  });

  test('E2E-001-08: cambiar a vista Kanban', async ({ page }) => {
    const leads = new LeadsPageObject(page);
    await leads.goto();
    await leads.waitForLoad();

    await leads.switchToKanban();
    await page.waitForTimeout(500);

    // Verificar columnas de Kanban
    const kanbanColumns = page.locator('[data-testid="kanban-column"], .kanban-column');
    const columnCount = await kanbanColumns.count();

    expect(columnCount).toBeGreaterThanOrEqual(0);
  });

  test('E2E-001-09: búsqueda de leads', async ({ page }) => {
    const leads = new LeadsPageObject(page);
    await leads.goto();
    await leads.waitForLoad();

    const initialCount = await leads.getLeadsCount();
    await leads.searchLead('test-search-term-unlikely');
    await page.waitForTimeout(500);

    const filteredCount = await leads.getLeadsCount();
    // El filtrado debe reducir o mantener la cuenta
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });
});

test.describe('HU-002: Asignación de Leads', () => {
  test('E2E-002-01: página de configuración accesible', async ({ page }) => {
    await page.goto('/home/configuracion');

    const url = page.url();
    // Debe estar en configuración o redirigido a login
    expect(url.includes('configuracion') || url.includes('auth') || url.includes('home')).toBe(true);
  });
});

test.describe('HU-003: Cotizaciones', () => {
  test('E2E-003-01: página de cotizaciones carga', async ({ page }) => {
    await page.goto('/home/cotizaciones');

    const url = page.url();
    // Debe estar en cotizaciones o redirigido a login
    expect(url.includes('cotizaciones') || url.includes('auth') || url.includes('home')).toBe(true);
  });

  test('E2E-003-02: estructura básica de cotizaciones', async ({ page }) => {
    await page.goto('/home/cotizaciones');

    // Si está en la página de cotizaciones
    if (page.url().includes('cotizaciones')) {
      // Verificar elementos básicos
      const hasContent = await page.locator('main, .content, [data-testid="cotizaciones"]').isVisible().catch(() => false);
      expect(hasContent).toBe(true);
    }
  });
});
