/**
 * Tipos do banco de dados Supabase (schema `public`).
 * Convenção: todas as tabelas usam sufixo `_encontro27`.
 * Mantido manualmente para acompanhar `supabase/migrations/*.sql` — atualizar os dois juntos.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type StatusPagamento =
  | "aguardando_pagamento"
  | "aprovado"
  | "recusado"
  | "cancelado"
  | "reembolsado";

/** staff = equipe de campo: só acessa o check-in (ver migration 0011). */
export type PerfilRole = "comercial" | "marketing" | "staff";

export interface Database {
  public: {
    Tables: {
      profiles_encontro27: {
        Row: {
          uuid: string;
          email: string;
          role: PerfilRole;
          created_at: string;
        };
        Insert: {
          uuid: string;
          email: string;
          role?: PerfilRole;
          created_at?: string;
        };
        Update: {
          uuid?: string;
          email?: string;
          role?: PerfilRole;
          created_at?: string;
        };
        Relationships: [];
      };
      event_config_encontro27: {
        Row: {
          id: string;
          name: string | null;
          date: string | null;
          date_fim: string | null;
          location: string | null;
          description: string | null;
          sale_status: string;
          whatsapp_support: string | null;
          ga4_id: string | null;
          gtm_id: string | null;
          meta_pixel_id: string | null;
          google_ads_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          date?: string | null;
          date_fim?: string | null;
          location?: string | null;
          description?: string | null;
          sale_status?: string;
          whatsapp_support?: string | null;
          ga4_id?: string | null;
          gtm_id?: string | null;
          meta_pixel_id?: string | null;
          google_ads_id?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["event_config_encontro27"]["Insert"]>;
        Relationships: [];
      };
      modalidades_encontro27: {
        Row: {
          id: string;
          slug: string;
          nome: string;
          descricao: string | null;
          para_quem_e: string | null;
          itens_incluidos: Json | null;
          itens_nao_incluidos: Json | null;
          condicoes: string | null;
          ordem: number;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          nome: string;
          descricao?: string | null;
          para_quem_e?: string | null;
          itens_incluidos?: Json | null;
          itens_nao_incluidos?: Json | null;
          condicoes?: string | null;
          ordem?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["modalidades_encontro27"]["Insert"]>;
        Relationships: [];
      };
      lotes_encontro27: {
        Row: {
          id: string;
          modalidade_id: string;
          nome: string;
          preco: number | null;
          quantidade: number | null;
          quantidade_vendida: number;
          inicio_venda: string | null;
          fim_venda: string | null;
          status: string;
          hypercash_checkout_url: string | null;
          ordem: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          modalidade_id: string;
          nome?: string;
          preco?: number | null;
          quantidade?: number | null;
          quantidade_vendida?: number;
          inicio_venda?: string | null;
          fim_venda?: string | null;
          status?: string;
          hypercash_checkout_url?: string | null;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lotes_encontro27"]["Insert"]>;
        Relationships: [];
      };
      pedidos_encontro27: {
        Row: {
          id: string;
          comprador_nome: string;
          comprador_email: string;
          comprador_whatsapp: string;
          lote_id: string;
          quantidade: number;
          valor_unitario_registrado: number;
          valor_total: number;
          status_pagamento: StatusPagamento;
          hypercash_url_usado: string | null;
          hypercash_payment_link_id: string | null;
          hypercash_checkout_criado_em: string | null;
          hypercash_transaction_id: string | null;
          hypercash_status_bruto: string | null;
          aprovado_via: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_term: string | null;
          utm_content: string | null;
          aceite_termos: boolean;
          aceite_termos_em: string | null;
          tem_problema_estoque: boolean;
          confirmado_por: string | null;
          confirmado_em: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          comprador_nome: string;
          comprador_email: string;
          comprador_whatsapp: string;
          lote_id: string;
          quantidade?: number;
          valor_unitario_registrado: number;
          valor_total: number;
          status_pagamento?: StatusPagamento;
          hypercash_url_usado?: string | null;
          hypercash_payment_link_id?: string | null;
          hypercash_checkout_criado_em?: string | null;
          hypercash_transaction_id?: string | null;
          hypercash_status_bruto?: string | null;
          aprovado_via?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          aceite_termos?: boolean;
          aceite_termos_em?: string | null;
          tem_problema_estoque?: boolean;
          confirmado_por?: string | null;
          confirmado_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pedidos_encontro27"]["Insert"]>;
        Relationships: [];
      };
      participantes_encontro27: {
        Row: {
          id: string;
          pedido_id: string;
          nome: string;
          email: string | null;
          identificador_unico: string;
          check_in_status: boolean;
          check_in_em: string | null;
          check_in_por: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          nome: string;
          email?: string | null;
          identificador_unico?: string;
          check_in_status?: boolean;
          check_in_em?: string | null;
          check_in_por?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["participantes_encontro27"]["Insert"]>;
        Relationships: [];
      };
      palestrantes_encontro27: {
        Row: {
          id: string;
          nome: string;
          funcao: string | null;
          bio: string | null;
          foto_url: string | null;
          ordem: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          funcao?: string | null;
          bio?: string | null;
          foto_url?: string | null;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["palestrantes_encontro27"]["Insert"]>;
        Relationships: [];
      };
      programacao_encontro27: {
        Row: {
          id: string;
          dia: number;
          horario: string | null;
          atividade: string;
          palestrante_id: string | null;
          local: string | null;
          ordem: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dia?: number;
          horario?: string | null;
          atividade: string;
          palestrante_id?: string | null;
          local?: string | null;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["programacao_encontro27"]["Insert"]>;
        Relationships: [];
      };
      faq_encontro27: {
        Row: {
          id: string;
          pergunta: string;
          resposta: string | null;
          tema: string | null;
          ordem: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pergunta: string;
          resposta?: string | null;
          tema?: string | null;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["faq_encontro27"]["Insert"]>;
        Relationships: [];
      };
      tracking_events_encontro27: {
        Row: {
          id: string;
          event_name: string;
          pedido_id: string | null;
          session_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_name: string;
          pedido_id?: string | null;
          session_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tracking_events_encontro27"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin_encontro27: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      obter_pedido_encontro27: {
        Args: { p_pedido_id: string; p_email: string };
        Returns: Json;
      };
      meus_pedidos_encontro27: {
        Args: Record<string, never>;
        Returns: Json;
      };
      meus_ingressos_encontro27: {
        Args: Record<string, never>;
        Returns: Json;
      };
      checkin_encontro27: {
        Args: { p_identificador: string; p_data_inicio?: string | null; p_data_fim?: string | null };
        Returns: Json;
      };
      buscar_participantes_checkin_encontro27: {
        Args: { p_nome: string };
        Returns: Json;
      };
      solicitar_transferencia_titularidade_encontro27: {
        Args: { p_identificador_unico: string; p_email_destino: string };
        Returns: Json;
      };
      cancelar_transferencia_titularidade_encontro27: {
        Args: { p_transferencia_id: string };
        Returns: Json;
      };
      minhas_transferencias_pendentes_encontro27: {
        Args: Record<string, never>;
        Returns: Json;
      };
      aceitar_transferencia_titularidade_encontro27: {
        Args: { p_transferencia_id: string };
        Returns: Json;
      };
      recusar_transferencia_titularidade_encontro27: {
        Args: { p_transferencia_id: string };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
}
