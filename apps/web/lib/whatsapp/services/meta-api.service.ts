/**
 * Servicio de Meta Cloud API para WhatsApp - HU-0012
 *
 * Maneja el envío de mensajes y templates a través de la API de Meta
 */

import 'server-only';

// ===========================================
// CONFIGURACIÓN
// ===========================================

const META_API_VERSION = 'v18.0';
const META_API_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

// Variables de entorno
const getConfig = () => ({
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
});

// ===========================================
// TIPOS
// ===========================================

export interface SendMessageRequest {
  to: string;
  type: 'text' | 'template' | 'image' | 'document';
  text?: { body: string; preview_url?: boolean };
  template?: {
    name: string;
    language: { code: string };
    components?: TemplateComponent[];
  };
  image?: { link: string; caption?: string };
  document?: { link: string; caption?: string; filename?: string };
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters?: TemplateParameter[];
  sub_type?: 'quick_reply' | 'url';
  index?: number;
}

export interface TemplateParameter {
  type: 'text' | 'image' | 'document' | 'video';
  text?: string;
  image?: { link: string };
  document?: { link: string; filename?: string };
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface MediaUploadResponse {
  success: boolean;
  mediaId?: string;
  error?: string;
}

// ===========================================
// SERVICIO PRINCIPAL
// ===========================================

class MetaApiService {
  /**
   * Envía un mensaje de texto simple
   */
  async sendTextMessage(to: string, text: string): Promise<SendMessageResponse> {
    const config = getConfig();

    if (!config.phoneNumberId || !config.accessToken) {
      console.warn('[MetaAPI] Configuración incompleta - Modo simulación');
      return { success: true, messageId: `sim_${Date.now()}` };
    }

    try {
      const response = await fetch(
        `${META_API_BASE_URL}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.formatPhoneNumber(to),
            type: 'text',
            text: { body: text },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('[MetaAPI] Error enviando mensaje:', data);
        return { success: false, error: data.error?.message || 'Error desconocido' };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };

    } catch (error) {
      console.error('[MetaAPI] Error de conexión:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  }

  /**
   * Envía un template de mensaje
   */
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string = 'es',
    components?: TemplateComponent[]
  ): Promise<SendMessageResponse> {
    const config = getConfig();

    if (!config.phoneNumberId || !config.accessToken) {
      console.warn('[MetaAPI] Configuración incompleta - Modo simulación');
      return { success: true, messageId: `sim_${Date.now()}` };
    }

    try {
      const payload: Record<string, unknown> = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: this.formatPhoneNumber(to),
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
        },
      };

      if (components && components.length > 0) {
        (payload.template as Record<string, unknown>).components = components;
      }

      const response = await fetch(
        `${META_API_BASE_URL}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('[MetaAPI] Error enviando template:', data);
        return { success: false, error: data.error?.message || 'Error desconocido' };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };

    } catch (error) {
      console.error('[MetaAPI] Error de conexión:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  }

  /**
   * Envía un mensaje interactivo con botones
   */
  async sendInteractiveButtons(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<SendMessageResponse> {
    const config = getConfig();

    if (!config.phoneNumberId || !config.accessToken) {
      console.warn('[MetaAPI] Configuración incompleta - Modo simulación');
      return { success: true, messageId: `sim_${Date.now()}` };
    }

    try {
      const response = await fetch(
        `${META_API_BASE_URL}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.formatPhoneNumber(to),
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: bodyText },
              action: {
                buttons: buttons.slice(0, 3).map((btn, index) => ({
                  type: 'reply',
                  reply: { id: btn.id, title: btn.title.substring(0, 20) },
                })),
              },
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('[MetaAPI] Error enviando botones:', data);
        return { success: false, error: data.error?.message || 'Error desconocido' };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };

    } catch (error) {
      console.error('[MetaAPI] Error de conexión:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  }

  /**
   * Envía un mensaje interactivo con lista
   */
  async sendInteractiveList(
    to: string,
    headerText: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>
  ): Promise<SendMessageResponse> {
    const config = getConfig();

    if (!config.phoneNumberId || !config.accessToken) {
      console.warn('[MetaAPI] Configuración incompleta - Modo simulación');
      return { success: true, messageId: `sim_${Date.now()}` };
    }

    try {
      const response = await fetch(
        `${META_API_BASE_URL}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.formatPhoneNumber(to),
            type: 'interactive',
            interactive: {
              type: 'list',
              header: { type: 'text', text: headerText },
              body: { text: bodyText },
              action: {
                button: buttonText,
                sections,
              },
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('[MetaAPI] Error enviando lista:', data);
        return { success: false, error: data.error?.message || 'Error desconocido' };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };

    } catch (error) {
      console.error('[MetaAPI] Error de conexión:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  }

  /**
   * Descarga un archivo multimedia de Meta
   */
  async downloadMedia(mediaId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    const config = getConfig();

    if (!config.accessToken) {
      return { success: false, error: 'Token de acceso no configurado' };
    }

    try {
      // Primero obtener la URL del archivo
      const response = await fetch(
        `${META_API_BASE_URL}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message || 'Error obteniendo media' };
      }

      return { success: true, url: data.url };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  }

  /**
   * Marca un mensaje como leído
   */
  async markAsRead(messageId: string): Promise<{ success: boolean; error?: string }> {
    const config = getConfig();

    if (!config.phoneNumberId || !config.accessToken) {
      return { success: true }; // Modo simulación
    }

    try {
      const response = await fetch(
        `${META_API_BASE_URL}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.error?.message };
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  }

  /**
   * Formatea el número de teléfono para Meta API
   */
  private formatPhoneNumber(phone: string): string {
    // Remover el + inicial y cualquier caracter no numérico
    return phone.replace(/\D/g, '');
  }
}

// Exportar instancia singleton
export const metaApiService = new MetaApiService();

// Exportar funciones individuales para uso directo
export const sendTextMessage = (to: string, text: string) =>
  metaApiService.sendTextMessage(to, text);

export const sendTemplate = (
  to: string,
  templateName: string,
  languageCode?: string,
  components?: TemplateComponent[]
) => metaApiService.sendTemplate(to, templateName, languageCode, components);

export const sendInteractiveButtons = (
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
) => metaApiService.sendInteractiveButtons(to, bodyText, buttons);

export const downloadMedia = (mediaId: string) =>
  metaApiService.downloadMedia(mediaId);

export const markAsRead = (messageId: string) =>
  metaApiService.markAsRead(messageId);
