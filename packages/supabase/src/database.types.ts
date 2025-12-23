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
    }
    Views: {
      [_ in never]: never
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
      crear_cotizacion_desde_lead: {
        Args: { p_lead_id: string }
        Returns: string
      }
      es_asesor_activo: { Args: { p_usuario_id: string }; Returns: boolean }
      lead_supera_24h: { Args: { p_lead_id: string }; Returns: boolean }
      obtener_asesor_disponible: { Args: never; Returns: string }
      obtener_margen_minimo: {
        Args: {
          p_forma_pago: Database["public"]["Enums"]["forma_pago"]
          p_vertical_id: string
        }
        Returns: number
      }
      obtener_trm: { Args: { p_fecha?: string }; Returns: number }
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
      permiso_accion:
        | "CREAR"
        | "EDITAR"
        | "VER"
        | "ELIMINAR"
        | "APROBAR"
        | "EXPORTAR"
      usuario_estado: "ACTIVO" | "INACTIVO"
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
      permiso_accion: [
        "CREAR",
        "EDITAR",
        "VER",
        "ELIMINAR",
        "APROBAR",
        "EXPORTAR",
      ],
      usuario_estado: ["ACTIVO", "INACTIVO"],
    },
  },
} as const
