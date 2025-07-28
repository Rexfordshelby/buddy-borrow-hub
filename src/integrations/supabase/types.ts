export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      borrow_requests: {
        Row: {
          borrower_id: string
          created_at: string | null
          end_date: string
          id: string
          item_id: string
          lender_id: string
          message: string | null
          negotiated_price_per_day: number | null
          negotiation_message: string | null
          original_price_per_day: number | null
          payment_session_id: string | null
          payment_status: string | null
          start_date: string
          status: Database["public"]["Enums"]["request_status"] | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          borrower_id: string
          created_at?: string | null
          end_date: string
          id?: string
          item_id: string
          lender_id: string
          message?: string | null
          negotiated_price_per_day?: number | null
          negotiation_message?: string | null
          original_price_per_day?: number | null
          payment_session_id?: string | null
          payment_status?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["request_status"] | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          borrower_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          item_id?: string
          lender_id?: string
          message?: string | null
          negotiated_price_per_day?: number | null
          negotiation_message?: string | null
          original_price_per_day?: number | null
          payment_session_id?: string | null
          payment_status?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["request_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "borrow_requests_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrow_requests_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrow_requests_lender_id_fkey"
            columns: ["lender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          room_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          room_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          id: string
          participant_1: string
          participant_2: string
          service_request_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          participant_1: string
          participant_2: string
          service_request_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          participant_1?: string
          participant_2?: string
          service_request_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: true
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          availability: boolean | null
          category: Database["public"]["Enums"]["item_category"]
          condition: Database["public"]["Enums"]["item_condition"]
          created_at: string | null
          deposit_amount: number | null
          description: string | null
          id: string
          images: string[] | null
          location: string | null
          owner_id: string
          price_per_day: number
          title: string
          updated_at: string | null
        }
        Insert: {
          availability?: boolean | null
          category: Database["public"]["Enums"]["item_category"]
          condition: Database["public"]["Enums"]["item_condition"]
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          owner_id: string
          price_per_day: number
          title: string
          updated_at?: string | null
        }
        Update: {
          availability?: boolean | null
          category?: Database["public"]["Enums"]["item_category"]
          condition?: Database["public"]["Enums"]["item_condition"]
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          owner_id?: string
          price_per_day?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          request_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          request_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "borrow_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiations: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          proposed_price_per_day: number
          request_id: string
          sender_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          proposed_price_per_day: number
          request_id: string
          sender_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          proposed_price_per_day?: number
          request_id?: string
          sender_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "negotiations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "borrow_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negotiations_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          read: boolean | null
          request_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          request_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          request_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "borrow_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          rating: number | null
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          request_id: string
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          request_id: string
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          request_id?: string
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "borrow_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bookings: {
        Row: {
          booking_date: string
          cancellation_reason: string | null
          confirmation_code: string | null
          created_at: string | null
          customer_id: string
          customer_rating: number | null
          customer_review: string | null
          end_time: string
          id: string
          notes: string | null
          order_number: string | null
          payment_session_id: string | null
          payment_status: string | null
          provider_id: string
          provider_rating: number | null
          provider_response_at: string | null
          provider_review: string | null
          refund_amount: number | null
          refund_status: string | null
          service_id: string
          start_time: string
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          booking_date: string
          cancellation_reason?: string | null
          confirmation_code?: string | null
          created_at?: string | null
          customer_id: string
          customer_rating?: number | null
          customer_review?: string | null
          end_time: string
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_session_id?: string | null
          payment_status?: string | null
          provider_id: string
          provider_rating?: number | null
          provider_response_at?: string | null
          provider_review?: string | null
          refund_amount?: number | null
          refund_status?: string | null
          service_id: string
          start_time: string
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          booking_date?: string
          cancellation_reason?: string | null
          confirmation_code?: string | null
          created_at?: string | null
          customer_id?: string
          customer_rating?: number | null
          customer_review?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_session_id?: string | null
          payment_status?: string | null
          provider_id?: string
          provider_rating?: number | null
          provider_response_at?: string | null
          provider_review?: string | null
          refund_amount?: number | null
          refund_status?: string | null
          service_id?: string
          start_time?: string
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_portfolio: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          service_id: string
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          service_id: string
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          service_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_portfolio_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          message: string | null
          payment_method: string | null
          payment_session_id: string | null
          payment_status: string | null
          provider_id: string
          requested_date: string | null
          requested_time: string | null
          service_id: string
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          message?: string | null
          payment_method?: string | null
          payment_session_id?: string | null
          payment_status?: string | null
          provider_id: string
          requested_date?: string | null
          requested_time?: string | null
          service_id: string
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          message?: string | null
          payment_method?: string | null
          payment_session_id?: string | null
          payment_status?: string | null
          provider_id?: string
          requested_date?: string | null
          requested_time?: string | null
          service_id?: string
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          availability: string | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          location: string | null
          price: number
          price_type: string
          provider_id: string
          rating: number | null
          tags: string[] | null
          title: string
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          location?: string | null
          price: number
          price_type?: string
          provider_id: string
          rating?: number | null
          tags?: string[] | null
          title: string
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          location?: string | null
          price?: number
          price_type?: string
          provider_id?: string
          rating?: number | null
          tags?: string[] | null
          title?: string
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          available_balance: number | null
          created_at: string | null
          id: string
          pending_balance: number | null
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_balance?: number | null
          created_at?: string | null
          id?: string
          pending_balance?: number | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_balance?: number | null
          created_at?: string | null
          id?: string
          pending_balance?: number | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          from_user_id: string | null
          id: string
          related_request_id: string | null
          related_service_id: string | null
          status: string | null
          to_user_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          from_user_id?: string | null
          id?: string
          related_request_id?: string | null
          related_service_id?: string | null
          status?: string | null
          to_user_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          from_user_id?: string | null
          id?: string
          related_request_id?: string | null
          related_service_id?: string | null
          status?: string | null
          to_user_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_related_service_id_fkey"
            columns: ["related_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      booking_details: {
        Row: {
          booking_date: string | null
          cancellation_reason: string | null
          confirmation_code: string | null
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_rating: number | null
          customer_review: string | null
          end_time: string | null
          id: string | null
          notes: string | null
          order_number: string | null
          payment_session_id: string | null
          payment_status: string | null
          provider_email: string | null
          provider_id: string | null
          provider_name: string | null
          provider_phone: string | null
          provider_rating: number | null
          provider_response_at: string | null
          provider_review: string | null
          refund_amount: number | null
          refund_status: string | null
          service_category: string | null
          service_description: string | null
          service_id: string | null
          service_location: string | null
          service_price: number | null
          service_price_type: string | null
          service_title: string | null
          start_time: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_confirmation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      item_category:
        | "electronics"
        | "tools"
        | "sports"
        | "books"
        | "furniture"
        | "kitchen"
        | "automotive"
        | "clothing"
        | "gaming"
        | "other"
      item_condition: "new" | "like_new" | "good" | "fair"
      request_status:
        | "pending"
        | "approved"
        | "rejected"
        | "active"
        | "completed"
        | "cancelled"
        | "negotiating"
        | "payment_pending"
        | "paid"
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
      item_category: [
        "electronics",
        "tools",
        "sports",
        "books",
        "furniture",
        "kitchen",
        "automotive",
        "clothing",
        "gaming",
        "other",
      ],
      item_condition: ["new", "like_new", "good", "fair"],
      request_status: [
        "pending",
        "approved",
        "rejected",
        "active",
        "completed",
        "cancelled",
        "negotiating",
        "payment_pending",
        "paid",
      ],
    },
  },
} as const
