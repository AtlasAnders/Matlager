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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      app_innstillinger: {
        Row: {
          id: string
          verdi: string
        }
        Insert: {
          id: string
          verdi: string
        }
        Update: {
          id?: string
          verdi?: string
        }
        Relationships: []
      }
      kategori: {
        Row: {
          farge: string
          id: string
          ikon: string
          navn: string
          rekkefolge: number
        }
        Insert: {
          farge: string
          id?: string
          ikon: string
          navn: string
          rekkefolge?: number
        }
        Update: {
          farge?: string
          id?: string
          ikon?: string
          navn?: string
          rekkefolge?: number
        }
        Relationships: []
      }
      lager: {
        Row: {
          id: string
          navn: string
          opprettet: string
        }
        Insert: {
          id?: string
          navn: string
          opprettet?: string
        }
        Update: {
          id?: string
          navn?: string
          opprettet?: string
        }
        Relationships: []
      }
      middag_ingrediens: {
        Row: {
          enhet: Database["public"]["Enums"]["enhet"]
          id: string
          lager_id: string
          mengde: number
          navn: string
          opprettet: string
          vare_id: string | null
        }
        Insert: {
          enhet: Database["public"]["Enums"]["enhet"]
          id?: string
          lager_id: string
          mengde: number
          navn: string
          opprettet?: string
          vare_id?: string | null
        }
        Update: {
          enhet?: Database["public"]["Enums"]["enhet"]
          id?: string
          lager_id?: string
          mengde?: number
          navn?: string
          opprettet?: string
          vare_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "middag_ingrediens_lager_id_fkey"
            columns: ["lager_id"]
            isOneToOne: false
            referencedRelation: "lager"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "middag_ingrediens_vare_id_fkey"
            columns: ["vare_id"]
            isOneToOne: false
            referencedRelation: "vare"
            referencedColumns: ["id"]
          },
        ]
      }
      tilgangsforesporsler: {
        Row: {
          generert_kode: string | null
          id: string
          melding: string | null
          navn: string
          opprettet: string
          status: string
        }
        Insert: {
          generert_kode?: string | null
          id?: string
          melding?: string | null
          navn: string
          opprettet?: string
          status?: string
        }
        Update: {
          generert_kode?: string | null
          id?: string
          melding?: string | null
          navn?: string
          opprettet?: string
          status?: string
        }
        Relationships: []
      }
      tilgangskoder: {
        Row: {
          aktiv: boolean
          id: string
          kode: string
          lager_id: string
          navn: string | null
          opprettet: string
        }
        Insert: {
          aktiv?: boolean
          id?: string
          kode: string
          lager_id: string
          navn?: string | null
          opprettet?: string
        }
        Update: {
          aktiv?: boolean
          id?: string
          kode?: string
          lager_id?: string
          navn?: string | null
          opprettet?: string
        }
        Relationships: [
          {
            foreignKeyName: "tilgangskoder_lager_id_fkey"
            columns: ["lager_id"]
            isOneToOne: false
            referencedRelation: "lager"
            referencedColumns: ["id"]
          },
        ]
      }
      vare: {
        Row: {
          enhet: Database["public"]["Enums"]["enhet"]
          id: string
          kategori_id: string
          lager_id: string
          mengde: number
          navn: string
          pa_handleliste: boolean
          pa_handleliste_mengde: number | null
          sist_oppdatert: string
        }
        Insert: {
          enhet?: Database["public"]["Enums"]["enhet"]
          id?: string
          kategori_id: string
          lager_id: string
          mengde?: number
          navn: string
          pa_handleliste?: boolean
          pa_handleliste_mengde?: number | null
          sist_oppdatert?: string
        }
        Update: {
          enhet?: Database["public"]["Enums"]["enhet"]
          id?: string
          kategori_id?: string
          lager_id?: string
          mengde?: number
          navn?: string
          pa_handleliste?: boolean
          pa_handleliste_mengde?: number | null
          sist_oppdatert?: string
        }
        Relationships: [
          {
            foreignKeyName: "vare_kategori_id_fkey"
            columns: ["kategori_id"]
            isOneToOne: false
            referencedRelation: "kategori"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vare_lager_id_fkey"
            columns: ["lager_id"]
            isOneToOne: false
            referencedRelation: "lager"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _sjekk_admin: { Args: { p_admin_kode: string }; Returns: undefined }
      admin_avvis_foresporsel: {
        Args: { p_admin_kode: string; p_id: string }
        Returns: undefined
      }
      admin_godkjenn_foresporsel: {
        Args: {
          p_admin_kode: string
          p_id: string
          p_kode: string
          p_lager_id?: string
          p_nytt_lager_navn?: string
        }
        Returns: undefined
      }
      admin_hent_forespoersler: {
        Args: { p_admin_kode: string }
        Returns: {
          generert_kode: string | null
          id: string
          melding: string | null
          navn: string
          opprettet: string
          status: string
        }[]
      }
      admin_hent_koder: {
        Args: { p_admin_kode: string }
        Returns: {
          aktiv: boolean
          id: string
          kode: string
          lager_id: string
          lager_navn: string
          navn: string
          opprettet: string
        }[]
      }
      admin_hent_lagre: {
        Args: { p_admin_kode: string }
        Returns: {
          id: string
          navn: string
          opprettet: string
        }[]
      }
      admin_opprett_kode: {
        Args: {
          p_admin_kode: string
          p_kode: string
          p_lager_id?: string
          p_navn?: string
          p_nytt_lager_navn?: string
        }
        Returns: undefined
      }
      admin_tilbakekall_kode: {
        Args: { p_admin_kode: string; p_id: string }
        Returns: undefined
      }
      send_tilgangsforesporsel: {
        Args: { p_melding?: string; p_navn: string }
        Returns: undefined
      }
      sjekk_tilgangskode: {
        Args: { p_kode: string }
        Returns: {
          lager_id: string
          lager_navn: string
        }[]
      }
    }
    Enums: {
      enhet: "stk" | "kg" | "g" | "l" | "dl" | "ml" | "pakke" | "boks" | "pose"
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
      enhet: ["stk", "kg", "g", "l", "dl", "ml", "pakke", "boks", "pose"],
    },
  },
} as const
