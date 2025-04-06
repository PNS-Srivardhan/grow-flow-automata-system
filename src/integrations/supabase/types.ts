export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          sensor_type: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          sensor_type: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          sensor_type?: string
          type?: string
        }
        Relationships: []
      }
      crops: {
        Row: {
          created_at: string
          id: string
          max_air_temp: number
          max_humidity: number
          max_ph: number
          max_tds: number
          max_water_temp: number
          min_air_temp: number
          min_humidity: number
          min_ph: number
          min_tds: number
          min_water_temp: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_air_temp: number
          max_humidity: number
          max_ph: number
          max_tds: number
          max_water_temp: number
          min_air_temp: number
          min_humidity: number
          min_ph: number
          min_tds: number
          min_water_temp: number
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          max_air_temp?: number
          max_humidity?: number
          max_ph?: number
          max_tds?: number
          max_water_temp?: number
          min_air_temp?: number
          min_humidity?: number
          min_ph?: number
          min_tds?: number
          min_water_temp?: number
          name?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          device_type: string
          id: string
          is_on: boolean | null
          last_updated: string
          name: string
        }
        Insert: {
          device_type: string
          id?: string
          is_on?: boolean | null
          last_updated?: string
          name: string
        }
        Update: {
          device_type?: string
          id?: string
          is_on?: boolean | null
          last_updated?: string
          name?: string
        }
        Relationships: []
      }
      sensor_readings: {
        Row: {
          air_temp: number
          created_at: string
          crop_id: string | null
          humidity: number
          id: string
          ph: number
          status: Json
          tds: number
          water_temp: number
        }
        Insert: {
          air_temp: number
          created_at?: string
          crop_id?: string | null
          humidity: number
          id?: string
          ph: number
          status: Json
          tds: number
          water_temp: number
        }
        Update: {
          air_temp?: number
          created_at?: string
          crop_id?: string | null
          humidity?: number
          id?: string
          ph?: number
          status?: Json
          tds?: number
          water_temp?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
