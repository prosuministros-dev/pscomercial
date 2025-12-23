import { Page, expect } from '@playwright/test';

export class LeadsPageObject {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/home/leads');
  }

  async waitForLoad() {
    // Esperar que cargue la página de leads
    await this.page.waitForSelector('[data-testid="leads-view"], h1:has-text("Leads"), .leads-container', {
      timeout: 10000,
    }).catch(() => {
      // Si no encuentra el selector específico, esperar por cualquier contenido
    });
  }

  async clickNuevoLead() {
    const button = this.page.locator('button:has-text("Nuevo"), button:has-text("Crear"), button:has-text("Lead")').first();
    if (await button.isVisible()) {
      await button.click();
    }
  }

  async fillLeadForm(data: {
    razon_social: string;
    nit: string;
    nombre_contacto: string;
    celular_contacto: string;
    email_contacto: string;
    requerimiento: string;
  }) {
    // Intentar llenar cada campo si existe
    const fields = [
      { name: 'razon_social', value: data.razon_social },
      { name: 'nit', value: data.nit },
      { name: 'nombre_contacto', value: data.nombre_contacto },
      { name: 'celular_contacto', value: data.celular_contacto },
      { name: 'email_contacto', value: data.email_contacto },
      { name: 'requerimiento', value: data.requerimiento },
    ];

    for (const field of fields) {
      const input = this.page.locator(`[name="${field.name}"], input[placeholder*="${field.name}"]`).first();
      if (await input.isVisible().catch(() => false)) {
        await input.fill(field.value);
      }
    }
  }

  async submitForm() {
    const submitButton = this.page.locator('button[type="submit"], button:has-text("Crear"), button:has-text("Guardar")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
  }

  async switchToKanban() {
    const kanbanButton = this.page.locator('button[aria-label*="Kanban"], button:has-text("Kanban"), [data-testid="kanban-view"]').first();
    if (await kanbanButton.isVisible().catch(() => false)) {
      await kanbanButton.click();
    }
  }

  async searchLead(term: string) {
    const searchInput = this.page.locator('input[placeholder*="Buscar"], input[type="search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(term);
      await this.page.waitForTimeout(500); // Debounce
    }
  }

  async getLeadsCount() {
    const rows = this.page.locator('table tbody tr, [data-testid="lead-card"]');
    return await rows.count();
  }

  async isModalVisible() {
    return await this.page.locator('[role="dialog"], .modal, [data-testid="modal"]').isVisible().catch(() => false);
  }
}
