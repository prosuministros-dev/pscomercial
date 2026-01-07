export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          picture_url: string | null
          public_data: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      asesores_config: {
        Row: {
          activo: boolean | null
          creado_en: string | null
          id: string
          max_leads_pendientes: number | null
          modificado_en: string | null
          usuario_id: string
        }
        Insert: {
          activo?: boolean | null
          creado_en?: string | null
          id?: string
          max_leads_pendientes?: number | null
          modificado_en?: string | null
          usuario_id: string
        }
        Update: {
          activo?: boolean | null
          creado_en?: string | null
          id?: string
          max_leads_pendientes?: number | null
          modificado_en?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asesores_config_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      bitacora_admin: {
        Row: {
          accion: string
          creado_en: string | null
          descripcion: string | null
          entidad_id: string | null
          entidad_tipo: string
          id: string
          tipo: string
          usuario_id: string | null
          valor_anterior: Json | null
          valor_nuevo: Json | null
        }
        Insert: {
          accion: string
          creado_en?: string | null
          descripcion?: string | null
          entidad_id?: string | null
          entidad_tipo: string
          id?: string
          tipo: string
          usuario_id?: string | null
          valor_anterior?: Json | null
          valor_nuevo?: Json | null
        }
        Update: {
          accion?: string
          creado_en?: string | null
          descripcion?: string | null
          entidad_id?: string | null
          entidad_tipo?: string
          id?: string
          tipo?: string
          usuario_id?: string | null
          valor_anterior?: Json | null
          valor_nuevo?: Json | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          activo: boolean | null
          bloqueado: boolean | null
          celular_contacto: string | null
          ciudad: string | null
          comercial_asignado_id: string | null
          correo_facturacion: string | null
          creado_en: string | null
          creado_por: string | null
          cupo_credito: number | null
          cupo_disponible: number | null
          departamento: string | null
          dias_mora: number | null
          direccion: string | null
          email_contacto: string | null
          forma_pago: Database["public"]["Enums"]["forma_pago"] | null
          id: string
          modificado_en: string | null
          modificado_por: string | null
          motivo_bloqueo: string | null
          nit: string
          nombre_contacto: string | null
          razon_social: string
          telefono_principal: string | null
        }
        Insert: {
          activo?: boolean | null
          bloqueado?: boolean | null
          celular_contacto?: string | null
          ciudad?: string | null
          comercial_asignado_id?: string | null
          correo_facturacion?: string | null
          creado_en?: string | null
          creado_por?: string | null
          cupo_credito?: number | null
          cupo_disponible?: number | null
          departamento?: string | null
          dias_mora?: number | null
          direccion?: string | null
          email_contacto?: string | null
          forma_pago?: Database["public"]["Enums"]["forma_pago"] | null
          id?: string
          modificado_en?: string | null
          modificado_por?: string | null
          motivo_bloqueo?: string | null
          nit: string
          nombre_contacto?: string | null
          razon_social: string
          telefono_principal?: string | null
        }
        Update: {
          activo?: boolean | null
          bloqueado?: boolean | null
          celular_contacto?: string | null
          ciudad?: string | null
          comercial_asignado_id?: string | null
          correo_facturacion?: string | null
          creado_en?: string | null
          creado_por?: string | null
          cupo_credito?: number | null
          cupo_disponible?: number | null
          departamento?: string | null
          dias_mora?: number | null
          direccion?: string | null
          email_contacto?: string | null
          forma_pago?: Database["public"]["Enums"]["forma_pago"] | null
          id?: string
          modificado_en?: string | null
          modificado_por?: string | null
          motivo_bloqueo?: string | null
          nit?: string
          nombre_contacto?: string | null
          razon_social?: string
          telefono_principal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_comercial_asignado_id_fkey"
            columns: ["comercial_asignado_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizacion_adjuntos: {
        Row: {
          cotizacion_id: string
          id: string
          nombre: string
          subido_en: string | null
          subido_por: string | null
          tamano_bytes: number | null
          tipo: string | null
          url: string
        }
        Insert: {
          cotizacion_id: string
          id?: string
          nombre: string
          subido_en?: string | null
          subido_por?: string | null
          tamano_bytes?: number | null
          tipo?: string | null
          url: string
        }
        Update: {
          cotizacion_id?: string
          id?: string
          nombre?: string
          subido_en?: string | null
          subido_por?: string | null
          tamano_bytes?: number | null
          tipo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "cotizacion_adjuntos_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizacion_historial: {
        Row: {
          accion: string
          cotizacion_id: string
          creado_en: string | null
          datos_adicionales: Json | null
          descripcion: string | null
          estado_anterior:
            | Database["public"]["Enums"]["cotizacion_estado"]
            | null
          estado_nuevo: Database["public"]["Enums"]["cotizacion_estado"] | null
          id: string
          usuario_id: string | null
        }
        Insert: {
          accion: string
          cotizacion_id: string
          creado_en?: string | null
          datos_adicionales?: Json | null
          descripcion?: string | null
          estado_anterior?:
            | Database["public"]["Enums"]["cotizacion_estado"]
            | null
          estado_nuevo?: Database["public"]["Enums"]["cotizacion_estado"] | null
          id?: string
          usuario_id?: string | null
        }
        Update: {
          accion?: string
          cotizacion_id?: string
          creado_en?: string | null
          datos_adicionales?: Json | null
          descripcion?: string | null
          estado_anterior?:
            | Database["public"]["Enums"]["cotizacion_estado"]
            | null
          estado_nuevo?: Database["public"]["Enums"]["cotizacion_estado"] | null
          id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizacion_historial_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizacion_items: {
        Row: {
          cantidad: number
          costo_unitario: number
          costo_unitario_cop: number
          cotizacion_id: string
          creado_en: string | null
          descripcion: string | null
          garantia_meses: number | null
          id: string
          iva_porcentaje: number | null
          iva_tipo: Database["public"]["Enums"]["iva_tipo"] | null
          iva_valor: number | null
          margen_item: number
          modificado_en: string | null
          moneda_costo: Database["public"]["Enums"]["moneda"] | null
          nombre_producto: string
          numero_parte: string
          observaciones: string | null
          orden: number | null
          porcentaje_utilidad: number
          precio_unitario: number
          producto_id: string | null
          proveedor_id: string | null
          proveedor_nombre: string | null
          subtotal_costo: number
          subtotal_venta: number
          tiempo_entrega_dias: number | null
          total_item: number
          total_iva: number
          utilidad_item: number
          vertical_id: string | null
        }
        Insert: {
          cantidad?: number
          costo_unitario: number
          costo_unitario_cop: number
          cotizacion_id: string
          creado_en?: string | null
          descripcion?: string | null
          garantia_meses?: number | null
          id?: string
          iva_porcentaje?: number | null
          iva_tipo?: Database["public"]["Enums"]["iva_tipo"] | null
          iva_valor?: number | null
          margen_item: number
          modificado_en?: string | null
          moneda_costo?: Database["public"]["Enums"]["moneda"] | null
          nombre_producto: string
          numero_parte: string
          observaciones?: string | null
          orden?: number | null
          porcentaje_utilidad?: number
          precio_unitario: number
          producto_id?: string | null
          proveedor_id?: string | null
          proveedor_nombre?: string | null
          subtotal_costo: number
          subtotal_venta: number
          tiempo_entrega_dias?: number | null
          total_item: number
          total_iva: number
          utilidad_item: number
          vertical_id?: string | null
        }
        Update: {
          cantidad?: number
          costo_unitario?: number
          costo_unitario_cop?: number
          cotizacion_id?: string
          creado_en?: string | null
          descripcion?: string | null
          garantia_meses?: number | null
          id?: string
          iva_porcentaje?: number | null
          iva_tipo?: Database["public"]["Enums"]["iva_tipo"] | null
          iva_valor?: number | null
          margen_item?: number
          modificado_en?: string | null
          moneda_costo?: Database["public"]["Enums"]["moneda"] | null
          nombre_producto?: string
          numero_parte?: string
          observaciones?: string | null
          orden?: number | null
          porcentaje_utilidad?: number
          precio_unitario?: number
          producto_id?: string | null
          proveedor_id?: string | null
          proveedor_nombre?: string | null
          subtotal_costo?: number
          subtotal_venta?: number
          tiempo_entrega_dias?: number | null
          total_item?: number
          total_iva?: number
          utilidad_item?: number
          vertical_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizacion_items_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizacion_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizacion_items_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizacion_items_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticales"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizacion_observaciones: {
        Row: {
          cotizacion_id: string
          creado_en: string | null
          id: string
          menciones: string[] | null
          texto: string
          usuario_id: string
        }
        Insert: {
          cotizacion_id: string
          creado_en?: string | null
          id?: string
          menciones?: string[] | null
          texto: string
          usuario_id: string
        }
        Update: {
          cotizacion_id?: string
          creado_en?: string | null
          id?: string
          menciones?: string[] | null
          texto?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cotizacion_observaciones_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones: {
        Row: {
          aprobado_en: string | null
          aprobado_por: string | null
          asesor_id: string | null
          asunto: string
          celular_contacto: string | null
          cerrado_en: string | null
          cliente_id: string | null
          condiciones_comerciales: string | null
          creado_en: string | null
          creado_por: string | null
          cuadro_informativo: string | null
          cupo_credito_disponible: number | null
          email_contacto: string
          enviado_en: string | null
          estado: Database["public"]["Enums"]["cotizacion_estado"] | null
          fecha_cierre_estimada: string | null
          fecha_cotizacion: string
          forma_pago: Database["public"]["Enums"]["forma_pago"] | null
          id: string
          incluye_transporte: boolean | null
          lead_id: string | null
          links_adicionales: string | null
          margen_porcentaje: number | null
          mes_cierre: string | null
          mes_facturacion: string | null
          modificado_en: string | null
          modificado_por: string | null
          nit: string
          nombre_contacto: string
          numero: number
          porcentaje_interes: number | null
          razon_social: string
          requiere_aprobacion_margen: boolean | null
          semana_cierre: number | null
          subtotal_costo: number | null
          subtotal_venta: number | null
          total_iva: number | null
          total_venta: number | null
          trm_fecha: string
          trm_valor: number
          utilidad: number | null
          valor_transporte: number | null
          vigencia_dias: number | null
        }
        Insert: {
          aprobado_en?: string | null
          aprobado_por?: string | null
          asesor_id?: string | null
          asunto: string
          celular_contacto?: string | null
          cerrado_en?: string | null
          cliente_id?: string | null
          condiciones_comerciales?: string | null
          creado_en?: string | null
          creado_por?: string | null
          cuadro_informativo?: string | null
          cupo_credito_disponible?: number | null
          email_contacto: string
          enviado_en?: string | null
          estado?: Database["public"]["Enums"]["cotizacion_estado"] | null
          fecha_cierre_estimada?: string | null
          fecha_cotizacion?: string
          forma_pago?: Database["public"]["Enums"]["forma_pago"] | null
          id?: string
          incluye_transporte?: boolean | null
          lead_id?: string | null
          links_adicionales?: string | null
          margen_porcentaje?: number | null
          mes_cierre?: string | null
          mes_facturacion?: string | null
          modificado_en?: string | null
          modificado_por?: string | null
          nit: string
          nombre_contacto: string
          numero?: number
          porcentaje_interes?: number | null
          razon_social: string
          requiere_aprobacion_margen?: boolean | null
          semana_cierre?: number | null
          subtotal_costo?: number | null
          subtotal_venta?: number | null
          total_iva?: number | null
          total_venta?: number | null
          trm_fecha?: string
          trm_valor: number
          utilidad?: number | null
          valor_transporte?: number | null
          vigencia_dias?: number | null
        }
        Update: {
          aprobado_en?: string | null
          aprobado_por?: string | null
          asesor_id?: string | null
          asunto?: string
          celular_contacto?: string | null
          cerrado_en?: string | null
          cliente_id?: string | null
          condiciones_comerciales?: string | null
          creado_en?: string | null
          creado_por?: string | null
          cuadro_informativo?: string | null
          cupo_credito_disponible?: number | null
          email_contacto?: string
          enviado_en?: string | null
          estado?: Database["public"]["Enums"]["cotizacion_estado"] | null
          fecha_cierre_estimada?: string | null
          fecha_cotizacion?: string
          forma_pago?: Database["public"]["Enums"]["forma_pago"] | null
          id?: string
          incluye_transporte?: boolean | null
          lead_id?: string | null
          links_adicionales?: string | null
          margen_porcentaje?: number | null
          mes_cierre?: string | null
          mes_facturacion?: string | null
          modificado_en?: string | null
          modificado_por?: string | null
          nit?: string
          nombre_contacto?: string
          numero?: number
          porcentaje_interes?: number | null
          razon_social?: string
          requiere_aprobacion_margen?: boolean | null
          semana_cierre?: number | null
          subtotal_costo?: number | null
          subtotal_venta?: number | null
          total_iva?: number | null
          total_venta?: number | null
          trm_fecha?: string
          trm_valor?: number
          utilidad?: number | null
          valor_transporte?: number | null
          vigencia_dias?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_aprobado_por_fkey"
            columns: ["aprobado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_asesor_id_fkey"
            columns: ["asesor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_asignaciones_log: {
        Row: {
          asesor_anterior_id: string | null
          asesor_nuevo_id: string | null
          asignado_por: string | null
          creado_en: string
          id: string
          lead_id: string
          motivo: string | null
          tipo_asignacion: Database["public"]["Enums"]["lead_tipo_asignacion"]
        }
        Insert: {
          asesor_anterior_id?: string | null
          asesor_nuevo_id?: string | null
          asignado_por?: string | null
          creado_en?: string
          id?: string
          lead_id: string
          motivo?: string | null
          tipo_asignacion: Database["public"]["Enums"]["lead_tipo_asignacion"]
        }
        Update: {
          asesor_anterior_id?: string | null
          asesor_nuevo_id?: string | null
          asignado_por?: string | null
          creado_en?: string
          id?: string
          lead_id?: string
          motivo?: string | null
          tipo_asignacion?: Database["public"]["Enums"]["lead_tipo_asignacion"]
        }
        Relationships: [
          {
            foreignKeyName: "lead_asignaciones_log_asesor_anterior_id_fkey"
            columns: ["asesor_anterior_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_asignaciones_log_asesor_nuevo_id_fkey"
            columns: ["asesor_nuevo_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_asignaciones_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_observaciones: {
        Row: {
          creado_en: string
          id: string
          lead_id: string
          menciones: string[] | null
          texto: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          id?: string
          lead_id: string
          menciones?: string[] | null
          texto: string
          usuario_id: string
        }
        Update: {
          creado_en?: string
          id?: string
          lead_id?: string
          menciones?: string[] | null
          texto?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_observaciones_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          asesor_asignado_id: string | null
          asignado_en: string | null
          asignado_por: string | null
          canal_origen: Database["public"]["Enums"]["lead_canal"]
          celular_contacto: string
          convertido_en: string | null
          cotizacion_id: string | null
          creado_en: string
          creado_por: string
          email_contacto: string
          estado: Database["public"]["Enums"]["lead_estado"]
          fecha_lead: string
          id: string
          modificado_en: string | null
          modificado_por: string | null
          motivo_rechazo: string | null
          nit: string
          nombre_contacto: string
          numero: number
          razon_social: string
          requerimiento: string
        }
        Insert: {
          asesor_asignado_id?: string | null
          asignado_en?: string | null
          asignado_por?: string | null
          canal_origen?: Database["public"]["Enums"]["lead_canal"]
          celular_contacto: string
          convertido_en?: string | null
          cotizacion_id?: string | null
          creado_en?: string
          creado_por: string
          email_contacto: string
          estado?: Database["public"]["Enums"]["lead_estado"]
          fecha_lead?: string
          id?: string
          modificado_en?: string | null
          modificado_por?: string | null
          motivo_rechazo?: string | null
          nit: string
          nombre_contacto: string
          numero?: number
          razon_social: string
          requerimiento: string
        }
        Update: {
          asesor_asignado_id?: string | null
          asignado_en?: string | null
          asignado_por?: string | null
          canal_origen?: Database["public"]["Enums"]["lead_canal"]
          celular_contacto?: string
          convertido_en?: string | null
          cotizacion_id?: string | null
          creado_en?: string
          creado_por?: string
          email_contacto?: string
          estado?: Database["public"]["Enums"]["lead_estado"]
          fecha_lead?: string
          id?: string
          modificado_en?: string | null
          modificado_por?: string | null
          motivo_rechazo?: string | null
          nit?: string
          nombre_contacto?: string
          numero?: number
          razon_social?: string
          requerimiento?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_asesor_asignado_id_fkey"
            columns: ["asesor_asignado_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      marcas: {
        Row: {
          activo: boolean | null
          creado_en: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          creado_en?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          creado_en?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      margenes_minimos: {
        Row: {
          creado_en: string | null
          forma_pago: Database["public"]["Enums"]["forma_pago"]
          id: string
          margen_minimo: number
          modificado_en: string | null
          vertical_id: string
        }
        Insert: {
          creado_en?: string | null
          forma_pago: Database["public"]["Enums"]["forma_pago"]
          id?: string
          margen_minimo: number
          modificado_en?: string | null
          vertical_id: string
        }
        Update: {
          creado_en?: string | null
          forma_pago?: Database["public"]["Enums"]["forma_pago"]
          id?: string
          margen_minimo?: number
          modificado_en?: string | null
          vertical_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "margenes_minimos_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticales"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          creado_en: string | null
          entidad_id: string | null
          entidad_tipo: string | null
          id: string
          leida: boolean | null
          leida_en: string | null
          mensaje: string
          metadata: Json | null
          prioridad:
            | Database["public"]["Enums"]["notificacion_prioridad"]
            | null
          tipo: Database["public"]["Enums"]["notificacion_tipo"]
          titulo: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string | null
          entidad_id?: string | null
          entidad_tipo?: string | null
          id?: string
          leida?: boolean | null
          leida_en?: string | null
          mensaje: string
          metadata?: Json | null
          prioridad?:
            | Database["public"]["Enums"]["notificacion_prioridad"]
            | null
          tipo: Database["public"]["Enums"]["notificacion_tipo"]
          titulo: string
          usuario_id: string
        }
        Update: {
          creado_en?: string | null
          entidad_id?: string | null
          entidad_tipo?: string | null
          id?: string
          leida?: boolean | null
          leida_en?: string | null
          mensaje?: string
          metadata?: Json | null
          prioridad?:
            | Database["public"]["Enums"]["notificacion_prioridad"]
            | null
          tipo?: Database["public"]["Enums"]["notificacion_tipo"]
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      permisos: {
        Row: {
          accion: Database["public"]["Enums"]["permiso_accion"]
          descripcion: string | null
          id: string
          modulo: string
        }
        Insert: {
          accion: Database["public"]["Enums"]["permiso_accion"]
          descripcion?: string | null
          id?: string
          modulo: string
        }
        Update: {
          accion?: Database["public"]["Enums"]["permiso_accion"]
          descripcion?: string | null
          id?: string
          modulo?: string
        }
        Relationships: []
      }
      productos: {
        Row: {
          activo: boolean | null
          costo_referencia: number | null
          creado_en: string | null
          creado_por: string | null
          descripcion: string | null
          garantia_meses: number | null
          id: string
          iva_tipo: Database["public"]["Enums"]["iva_tipo"] | null
          marca_id: string | null
          modificado_en: string | null
          modificado_por: string | null
          moneda_costo: Database["public"]["Enums"]["moneda"] | null
          nombre: string
          numero_parte: string
          proveedor_principal_id: string | null
          tiempo_entrega_dias: number | null
          vertical_id: string | null
        }
        Insert: {
          activo?: boolean | null
          costo_referencia?: number | null
          creado_en?: string | null
          creado_por?: string | null
          descripcion?: string | null
          garantia_meses?: number | null
          id?: string
          iva_tipo?: Database["public"]["Enums"]["iva_tipo"] | null
          marca_id?: string | null
          modificado_en?: string | null
          modificado_por?: string | null
          moneda_costo?: Database["public"]["Enums"]["moneda"] | null
          nombre: string
          numero_parte: string
          proveedor_principal_id?: string | null
          tiempo_entrega_dias?: number | null
          vertical_id?: string | null
        }
        Update: {
          activo?: boolean | null
          costo_referencia?: number | null
          creado_en?: string | null
          creado_por?: string | null
          descripcion?: string | null
          garantia_meses?: number | null
          id?: string
          iva_tipo?: Database["public"]["Enums"]["iva_tipo"] | null
          marca_id?: string | null
          modificado_en?: string | null
          modificado_por?: string | null
          moneda_costo?: Database["public"]["Enums"]["moneda"] | null
          nombre?: string
          numero_parte?: string
          proveedor_principal_id?: string | null
          tiempo_entrega_dias?: number | null
          vertical_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productos_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "marcas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_proveedor_principal_id_fkey"
            columns: ["proveedor_principal_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticales"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedores: {
        Row: {
          activo: boolean | null
          contacto: string | null
          creado_en: string | null
          email: string | null
          id: string
          modificado_en: string | null
          nit: string | null
          nombre: string
          telefono: string | null
          tiempo_entrega_dias: number | null
        }
        Insert: {
          activo?: boolean | null
          contacto?: string | null
          creado_en?: string | null
          email?: string | null
          id?: string
          modificado_en?: string | null
          nit?: string | null
          nombre: string
          telefono?: string | null
          tiempo_entrega_dias?: number | null
        }
        Update: {
          activo?: boolean | null
          contacto?: string | null
          creado_en?: string | null
          email?: string | null
          id?: string
          modificado_en?: string | null
          nit?: string | null
          nombre?: string
          telefono?: string | null
          tiempo_entrega_dias?: number | null
        }
        Relationships: []
      }
      rol_permisos: {
        Row: {
          creado_en: string | null
          permiso_id: string
          rol_id: string
        }
        Insert: {
          creado_en?: string | null
          permiso_id: string
          rol_id: string
        }
        Update: {
          creado_en?: string | null
          permiso_id?: string
          rol_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rol_permisos_permiso_id_fkey"
            columns: ["permiso_id"]
            isOneToOne: false
            referencedRelation: "permisos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rol_permisos_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          creado_en: string | null
          creado_por: string | null
          descripcion: string | null
          estado: Database["public"]["Enums"]["usuario_estado"] | null
          id: string
          modificado_en: string | null
          modificado_por: string | null
          nombre: string
        }
        Insert: {
          creado_en?: string | null
          creado_por?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["usuario_estado"] | null
          id?: string
          modificado_en?: string | null
          modificado_por?: string | null
          nombre: string
        }
        Update: {
          creado_en?: string | null
          creado_por?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["usuario_estado"] | null
          id?: string
          modificado_en?: string | null
          modificado_por?: string | null
          nombre?: string
        }
        Relationships: []
      }
      trm_historico: {
        Row: {
          creado_en: string | null
          fecha: string
          fuente: string | null
          id: string
          valor: number
        }
        Insert: {
          creado_en?: string | null
          fecha: string
          fuente?: string | null
          id?: string
          valor: number
        }
        Update: {
          creado_en?: string | null
          fecha?: string
          fuente?: string | null
          id?: string
          valor?: number
        }
        Relationships: []
      }
      usuario_roles: {
        Row: {
          asignado_en: string | null
          asignado_por: string | null
          rol_id: string
          usuario_id: string
        }
        Insert: {
          asignado_en?: string | null
          asignado_por?: string | null
          rol_id: string
          usuario_id: string
        }
        Update: {
          asignado_en?: string | null
          asignado_por?: string | null
          rol_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_roles_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_roles_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          area: string | null
          avatar_url: string | null
          creado_en: string | null
          creado_por: string | null
          email: string
          estado: Database["public"]["Enums"]["usuario_estado"] | null
          id: string
          modificado_en: string | null
          modificado_por: string | null
          nombre: string
          telefono: string | null
          ultima_actividad: string | null
        }
        Insert: {
          area?: string | null
          avatar_url?: string | null
          creado_en?: string | null
          creado_por?: string | null
          email: string
          estado?: Database["public"]["Enums"]["usuario_estado"] | null
          id: string
          modificado_en?: string | null
          modificado_por?: string | null
          nombre: string
          telefono?: string | null
          ultima_actividad?: string | null
        }
        Update: {
          area?: string | null
          avatar_url?: string | null
          creado_en?: string | null
          creado_por?: string | null
          email?: string
          estado?: Database["public"]["Enums"]["usuario_estado"] | null
          id?: string
          modificado_en?: string | null
          modificado_por?: string | null
          nombre?: string
          telefono?: string | null
          ultima_actividad?: string | null
        }
        Relationships: []
      }
      verticales: {
        Row: {
          activo: boolean | null
          creado_en: string | null
          descripcion: string | null
          id: string
          margen_minimo: number | null
          margen_sugerido: number | null
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          creado_en?: string | null
          descripcion?: string | null
          id?: string
          margen_minimo?: number | null
          margen_sugerido?: number | null
          nombre: string
        }
        Update: {
          activo?: boolean | null
          creado_en?: string | null
          descripcion?: string | null
          id?: string
          margen_minimo?: number | null
          margen_sugerido?: number | null
          nombre?: string
        }
        Relationships: []
      }
      whatsapp_asesor_sync: {
        Row: {
          creado_en: string
          desvinculado_en: string | null
          display_phone_number: string | null
          estado: Database["public"]["Enums"]["whatsapp_sync_estado"]
          id: string
          modificado_en: string | null
          phone_number_id: string | null
          token_acceso: string | null
          ultimo_sync: string | null
          usuario_id: string
          vinculado_en: string | null
          waba_id: string | null
          waba_name: string | null
        }
        Insert: {
          creado_en?: string
          desvinculado_en?: string | null
          display_phone_number?: string | null
          estado?: Database["public"]["Enums"]["whatsapp_sync_estado"]
          id?: string
          modificado_en?: string | null
          phone_number_id?: string | null
          token_acceso?: string | null
          ultimo_sync?: string | null
          usuario_id: string
          vinculado_en?: string | null
          waba_id?: string | null
          waba_name?: string | null
        }
        Update: {
          creado_en?: string
          desvinculado_en?: string | null
          display_phone_number?: string | null
          estado?: Database["public"]["Enums"]["whatsapp_sync_estado"]
          id?: string
          modificado_en?: string | null
          phone_number_id?: string | null
          token_acceso?: string | null
          ultimo_sync?: string | null
          usuario_id?: string
          vinculado_en?: string | null
          waba_id?: string | null
          waba_name?: string | null
        }
        Relationships: []
      }
      whatsapp_conversaciones: {
        Row: {
          adjuntos_temporales: string[] | null
          asesor_asignado_id: string | null
          asignado_en: string | null
          caso_id: string | null
          cerrado_en: string | null
          creado_en: string
          datos_capturados: Json | null
          estado: Database["public"]["Enums"]["whatsapp_conversacion_estado"]
          estado_bot: Database["public"]["Enums"]["whatsapp_bot_estado"] | null
          id: string
          identificacion: string | null
          lead_id: string | null
          mensajes_no_leidos: number | null
          metadata: Json | null
          modificado_en: string | null
          nombre_contacto: string | null
          recordatorio_1_enviado: boolean | null
          recordatorio_2_enviado: boolean | null
          telefono_cliente: string
          ultimo_mensaje: string | null
          ultimo_mensaje_en: string | null
          ultimo_mensaje_usuario_en: string | null
        }
        Insert: {
          adjuntos_temporales?: string[] | null
          asesor_asignado_id?: string | null
          asignado_en?: string | null
          caso_id?: string | null
          cerrado_en?: string | null
          creado_en?: string
          datos_capturados?: Json | null
          estado?: Database["public"]["Enums"]["whatsapp_conversacion_estado"]
          estado_bot?: Database["public"]["Enums"]["whatsapp_bot_estado"] | null
          id?: string
          identificacion?: string | null
          lead_id?: string | null
          mensajes_no_leidos?: number | null
          metadata?: Json | null
          modificado_en?: string | null
          nombre_contacto?: string | null
          recordatorio_1_enviado?: boolean | null
          recordatorio_2_enviado?: boolean | null
          telefono_cliente: string
          ultimo_mensaje?: string | null
          ultimo_mensaje_en?: string | null
          ultimo_mensaje_usuario_en?: string | null
        }
        Update: {
          adjuntos_temporales?: string[] | null
          asesor_asignado_id?: string | null
          asignado_en?: string | null
          caso_id?: string | null
          cerrado_en?: string | null
          creado_en?: string
          datos_capturados?: Json | null
          estado?: Database["public"]["Enums"]["whatsapp_conversacion_estado"]
          estado_bot?: Database["public"]["Enums"]["whatsapp_bot_estado"] | null
          id?: string
          identificacion?: string | null
          lead_id?: string | null
          mensajes_no_leidos?: number | null
          metadata?: Json | null
          modificado_en?: string | null
          nombre_contacto?: string | null
          recordatorio_1_enviado?: boolean | null
          recordatorio_2_enviado?: boolean | null
          telefono_cliente?: string
          ultimo_mensaje?: string | null
          ultimo_mensaje_en?: string | null
          ultimo_mensaje_usuario_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversaciones_asesor_asignado_id_fkey"
            columns: ["asesor_asignado_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversaciones_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_mensajes: {
        Row: {
          adjuntos: string[] | null
          contenido: string
          conversacion_id: string
          creado_en: string
          direccion: Database["public"]["Enums"]["whatsapp_mensaje_direccion"]
          id: string
          leido: boolean | null
          leido_en: string | null
          mensaje_meta_id: string | null
          remitente: Database["public"]["Enums"]["whatsapp_mensaje_remitente"]
          tipo: Database["public"]["Enums"]["whatsapp_mensaje_tipo"]
        }
        Insert: {
          adjuntos?: string[] | null
          contenido: string
          conversacion_id: string
          creado_en?: string
          direccion: Database["public"]["Enums"]["whatsapp_mensaje_direccion"]
          id?: string
          leido?: boolean | null
          leido_en?: string | null
          mensaje_meta_id?: string | null
          remitente: Database["public"]["Enums"]["whatsapp_mensaje_remitente"]
          tipo?: Database["public"]["Enums"]["whatsapp_mensaje_tipo"]
        }
        Update: {
          adjuntos?: string[] | null
          contenido?: string
          conversacion_id?: string
          creado_en?: string
          direccion?: Database["public"]["Enums"]["whatsapp_mensaje_direccion"]
          id?: string
          leido?: boolean | null
          leido_en?: string | null
          mensaje_meta_id?: string | null
          remitente?: Database["public"]["Enums"]["whatsapp_mensaje_remitente"]
          tipo?: Database["public"]["Enums"]["whatsapp_mensaje_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_mensajes_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          activo: boolean | null
          categoria: Database["public"]["Enums"]["whatsapp_template_categoria"]
          codigo: string
          contenido: string
          creado_en: string
          estado_meta:
            | Database["public"]["Enums"]["whatsapp_template_estado"]
            | null
          id: string
          modificado_en: string | null
          nombre: string
          variables: string[] | null
        }
        Insert: {
          activo?: boolean | null
          categoria: Database["public"]["Enums"]["whatsapp_template_categoria"]
          codigo: string
          contenido: string
          creado_en?: string
          estado_meta?:
            | Database["public"]["Enums"]["whatsapp_template_estado"]
            | null
          id?: string
          modificado_en?: string | null
          nombre: string
          variables?: string[] | null
        }
        Update: {
          activo?: boolean | null
          categoria?: Database["public"]["Enums"]["whatsapp_template_categoria"]
          codigo?: string
          contenido?: string
          creado_en?: string
          estado_meta?:
            | Database["public"]["Enums"]["whatsapp_template_estado"]
            | null
          id?: string
          modificado_en?: string | null
          nombre?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      whatsapp_webhook_log: {
        Row: {
          conversacion_id: string | null
          creado_en: string
          error: string | null
          id: string
          mensaje_id: string | null
          payload: Json
          procesado: boolean | null
          procesado_en: string | null
          tipo_evento: string
        }
        Insert: {
          conversacion_id?: string | null
          creado_en?: string
          error?: string | null
          id?: string
          mensaje_id?: string | null
          payload: Json
          procesado?: boolean | null
          procesado_en?: string | null
          tipo_evento: string
        }
        Update: {
          conversacion_id?: string | null
          creado_en?: string
          error?: string | null
          id?: string
          mensaje_id?: string | null
          payload?: Json
          procesado?: boolean | null
          procesado_en?: string | null
          tipo_evento?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_webhook_log_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_webhook_log_mensaje_id_fkey"
            columns: ["mensaje_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_mensajes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_cotizacion_items_detalle: {
        Row: {
          cantidad: number | null
          costo_unitario: number | null
          costo_unitario_cop: number | null
          cotizacion_id: string | null
          creado_en: string | null
          descripcion: string | null
          garantia_meses: number | null
          id: string | null
          iva_porcentaje: number | null
          iva_tipo: Database["public"]["Enums"]["iva_tipo"] | null
          iva_valor: number | null
          margen_bajo_vertical: boolean | null
          margen_item: number | null
          modificado_en: string | null
          moneda_costo: Database["public"]["Enums"]["moneda"] | null
          nombre_producto: string | null
          numero_parte: string | null
          observaciones: string | null
          orden: number | null
          porcentaje_utilidad: number | null
          precio_unitario: number | null
          producto_id: string | null
          proveedor_id: string | null
          proveedor_nombre: string | null
          subtotal_costo: number | null
          subtotal_venta: number | null
          tiempo_entrega_dias: number | null
          total_item: number | null
          total_iva: number | null
          utilidad_item: number | null
          vertical_id: string | null
          vertical_margen_minimo: number | null
          vertical_margen_sugerido: number | null
          vertical_nombre: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizacion_items_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizacion_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizacion_items_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizacion_items_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticales"
            referencedColumns: ["id"]
          },
        ]
      }
      v_cotizacion_observaciones: {
        Row: {
          cotizacion_id: string | null
          creado_en: string | null
          id: string | null
          menciones: string[] | null
          texto: string | null
          usuario_email: string | null
          usuario_id: string | null
          usuario_nombre: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizacion_observaciones_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calcular_totales_cotizacion: {
        Args: { p_cotizacion_id: string }
        Returns: undefined
      }
      contar_leads_pendientes_asesor: {
        Args: { p_usuario_id: string }
        Returns: number
      }
      contar_notificaciones_no_leidas: {
        Args: { p_usuario_id?: string }
        Returns: number
      }
      crear_cotizacion_desde_lead: {
        Args: { p_lead_id: string }
        Returns: string
      }
      crear_notificacion: {
        Args: {
          p_entidad_id?: string
          p_entidad_tipo?: string
          p_mensaje: string
          p_metadata?: Json
          p_prioridad?: Database["public"]["Enums"]["notificacion_prioridad"]
          p_tipo: Database["public"]["Enums"]["notificacion_tipo"]
          p_titulo: string
          p_usuario_id: string
        }
        Returns: string
      }
      es_asesor_activo: { Args: { p_usuario_id: string }; Returns: boolean }
      lead_supera_24h: { Args: { p_lead_id: string }; Returns: boolean }
      marcar_notificacion_leida: {
        Args: { p_notificacion_id: string }
        Returns: boolean
      }
      marcar_todas_notificaciones_leidas: { Args: never; Returns: number }
      obtener_asesor_disponible: { Args: never; Returns: string }
      obtener_estadisticas_asignaciones: {
        Args: { p_fecha_fin?: string; p_fecha_inicio?: string }
        Returns: {
          asesor_id: string
          asesor_nombre: string
          leads_convertidos: number
          leads_pendientes: number
          total_asignados: number
          total_reasignados: number
        }[]
      }
      obtener_margen_minimo: {
        Args: {
          p_forma_pago: Database["public"]["Enums"]["forma_pago"]
          p_vertical_id: string
        }
        Returns: number
      }
      obtener_trm: { Args: { p_fecha?: string }; Returns: number }
      puede_reasignar_lead: { Args: { p_usuario_id: string }; Returns: boolean }
      reasignar_lead: {
        Args: { p_lead_id: string; p_nuevo_asesor_id: string }
        Returns: Json
      }
      usuario_tiene_permiso: {
        Args: {
          p_accion: Database["public"]["Enums"]["permiso_accion"]
          p_modulo: string
          p_usuario_id: string
        }
        Returns: boolean
      }
      verificar_margen_cotizacion: {
        Args: { p_cotizacion_id: string }
        Returns: boolean
      }
      verificar_margen_cotizacion_v2: {
        Args: { p_cotizacion_id: string }
        Returns: boolean
      }
    }
    Enums: {
      cotizacion_estado:
        | "BORRADOR"
        | "CREACION_OFERTA"
        | "PENDIENTE_APROBACION_MARGEN"
        | "NEGOCIACION"
        | "RIESGO"
        | "ENVIADA_CLIENTE"
        | "PROFORMA_ENVIADA"
        | "PENDIENTE_AJUSTES"
        | "ACEPTADA_CLIENTE"
        | "RECHAZADA_CLIENTE"
        | "PENDIENTE_OC"
        | "GANADA"
        | "PERDIDA"
      forma_pago:
        | "ANTICIPADO"
        | "CONTRA_ENTREGA"
        | "CREDITO_8"
        | "CREDITO_15"
        | "CREDITO_30"
        | "CREDITO_45"
        | "CREDITO_60"
        | "CREDITO_90"
      iva_tipo: "IVA_0" | "IVA_5" | "IVA_19"
      lead_canal: "WHATSAPP" | "WEB" | "MANUAL"
      lead_estado:
        | "PENDIENTE_ASIGNACION"
        | "PENDIENTE_INFORMACION"
        | "ASIGNADO"
        | "CONVERTIDO"
        | "RECHAZADO"
      lead_tipo_asignacion: "AUTOMATICA" | "MANUAL" | "REASIGNACION"
      moneda: "COP" | "USD"
      notificacion_prioridad: "BAJA" | "MEDIA" | "ALTA"
      notificacion_tipo:
        | "LEAD_ASIGNADO"
        | "LEAD_REASIGNADO"
        | "COTIZACION_CREADA"
        | "COTIZACION_APROBACION_REQUERIDA"
        | "COTIZACION_APROBADA"
        | "COTIZACION_RECHAZADA"
        | "MENCION"
        | "SISTEMA"
      permiso_accion:
        | "CREAR"
        | "EDITAR"
        | "VER"
        | "ELIMINAR"
        | "APROBAR"
        | "EXPORTAR"
      usuario_estado: "ACTIVO" | "INACTIVO"
      whatsapp_bot_estado:
        | "INICIO"
        | "CAPTURA_NOMBRE"
        | "CAPTURA_ID"
        | "MENU_PRINCIPAL"
        | "FLUJO_COTIZACION"
        | "FLUJO_PEDIDO"
        | "FLUJO_OTRO"
        | "ADJUNTO_SIN_CONTEXTO"
        | "RECORDATORIO_1"
        | "RECORDATORIO_2"
        | "CONFIRMACION"
        | "CERRADA"
      whatsapp_conversacion_estado:
        | "ACTIVA"
        | "PAUSADA"
        | "CERRADA"
        | "INCOMPLETA"
      whatsapp_mensaje_direccion: "ENTRANTE" | "SALIENTE"
      whatsapp_mensaje_remitente: "BOT" | "USUARIO" | "ASESOR"
      whatsapp_mensaje_tipo:
        | "TEXTO"
        | "IMAGEN"
        | "DOCUMENTO"
        | "TEMPLATE"
        | "AUDIO"
        | "VIDEO"
      whatsapp_sync_estado: "ACTIVO" | "DESVINCULADO" | "ERROR" | "PENDIENTE"
      whatsapp_template_categoria:
        | "BIENVENIDA"
        | "COTIZACION"
        | "SEGUIMIENTO"
        | "CONFIRMACION"
        | "RECORDATORIO"
        | "SOPORTE"
      whatsapp_template_estado: "APROBADO" | "PENDIENTE" | "RECHAZADO"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_level: { Args: { name: string }; Returns: number }
      get_prefix: { Args: { name: string }; Returns: string }
      get_prefixes: { Args: { name: string }; Returns: string[] }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      cotizacion_estado: [
        "BORRADOR",
        "CREACION_OFERTA",
        "PENDIENTE_APROBACION_MARGEN",
        "NEGOCIACION",
        "RIESGO",
        "ENVIADA_CLIENTE",
        "PROFORMA_ENVIADA",
        "PENDIENTE_AJUSTES",
        "ACEPTADA_CLIENTE",
        "RECHAZADA_CLIENTE",
        "PENDIENTE_OC",
        "GANADA",
        "PERDIDA",
      ],
      forma_pago: [
        "ANTICIPADO",
        "CONTRA_ENTREGA",
        "CREDITO_8",
        "CREDITO_15",
        "CREDITO_30",
        "CREDITO_45",
        "CREDITO_60",
        "CREDITO_90",
      ],
      iva_tipo: ["IVA_0", "IVA_5", "IVA_19"],
      lead_canal: ["WHATSAPP", "WEB", "MANUAL"],
      lead_estado: [
        "PENDIENTE_ASIGNACION",
        "PENDIENTE_INFORMACION",
        "ASIGNADO",
        "CONVERTIDO",
        "RECHAZADO",
      ],
      lead_tipo_asignacion: ["AUTOMATICA", "MANUAL", "REASIGNACION"],
      moneda: ["COP", "USD"],
      notificacion_prioridad: ["BAJA", "MEDIA", "ALTA"],
      notificacion_tipo: [
        "LEAD_ASIGNADO",
        "LEAD_REASIGNADO",
        "COTIZACION_CREADA",
        "COTIZACION_APROBACION_REQUERIDA",
        "COTIZACION_APROBADA",
        "COTIZACION_RECHAZADA",
        "MENCION",
        "SISTEMA",
      ],
      permiso_accion: [
        "CREAR",
        "EDITAR",
        "VER",
        "ELIMINAR",
        "APROBAR",
        "EXPORTAR",
      ],
      usuario_estado: ["ACTIVO", "INACTIVO"],
      whatsapp_bot_estado: [
        "INICIO",
        "CAPTURA_NOMBRE",
        "CAPTURA_ID",
        "MENU_PRINCIPAL",
        "FLUJO_COTIZACION",
        "FLUJO_PEDIDO",
        "FLUJO_OTRO",
        "ADJUNTO_SIN_CONTEXTO",
        "RECORDATORIO_1",
        "RECORDATORIO_2",
        "CONFIRMACION",
        "CERRADA",
      ],
      whatsapp_conversacion_estado: [
        "ACTIVA",
        "PAUSADA",
        "CERRADA",
        "INCOMPLETA",
      ],
      whatsapp_mensaje_direccion: ["ENTRANTE", "SALIENTE"],
      whatsapp_mensaje_remitente: ["BOT", "USUARIO", "ASESOR"],
      whatsapp_mensaje_tipo: [
        "TEXTO",
        "IMAGEN",
        "DOCUMENTO",
        "TEMPLATE",
        "AUDIO",
        "VIDEO",
      ],
      whatsapp_sync_estado: ["ACTIVO", "DESVINCULADO", "ERROR", "PENDIENTE"],
      whatsapp_template_categoria: [
        "BIENVENIDA",
        "COTIZACION",
        "SEGUIMIENTO",
        "CONFIRMACION",
        "RECORDATORIO",
        "SOPORTE",
      ],
      whatsapp_template_estado: ["APROBADO", "PENDIENTE", "RECHAZADO"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
