export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          username: string
          password: string
        }
        Insert: {
          id?: number
          username: string
          password: string
        }
        Update: {
          id?: number
          username?: string
          password?: string
        }
      }
      campaigns: {
        Row: {
          id: number
          name: string
          description: string | null
          source_url: string
          affiliate_url: string
          short_url: string
          cloning_mode: string
          is_active: boolean
          enable_cookie_modal: boolean
          cookie_modal_language: string
          cookie_modal_title: string
          cookie_modal_text: string | null
          cookie_policy_link: string | null
          accept_button_text: string
          accept_button_position: string
          accept_button_shadow: boolean
          close_button_text: string
          close_button_position: string
          close_button_shadow: boolean
          background_color: string
          border_color: string
          shadow_intensity: number
          cloning_status: string
          cloned_html: string | null
          screenshot_paths: string | null
          views: number
          clicks: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          source_url: string
          affiliate_url: string
          short_url: string
          cloning_mode?: string
          is_active?: boolean
          enable_cookie_modal?: boolean
          cookie_modal_language?: string
          cookie_modal_title?: string
          cookie_modal_text?: string | null
          cookie_policy_link?: string | null
          accept_button_text?: string
          accept_button_position?: string
          accept_button_shadow?: boolean
          close_button_text?: string
          close_button_position?: string
          close_button_shadow?: boolean
          background_color?: string
          border_color?: string
          shadow_intensity?: number
          cloning_status?: string
          cloned_html?: string | null
          screenshot_paths?: string | null
          views?: number
          clicks?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          source_url?: string
          affiliate_url?: string
          short_url?: string
          cloning_mode?: string
          is_active?: boolean
          enable_cookie_modal?: boolean
          cookie_modal_language?: string
          cookie_modal_title?: string
          cookie_modal_text?: string | null
          cookie_policy_link?: string | null
          accept_button_text?: string
          accept_button_position?: string
          accept_button_shadow?: boolean
          close_button_text?: string
          close_button_position?: string
          close_button_shadow?: boolean
          background_color?: string
          border_color?: string
          shadow_intensity?: number
          cloning_status?: string
          cloned_html?: string | null
          screenshot_paths?: string | null
          views?: number
          clicks?: number
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: number
          user_id: number
          dark_mode: boolean
          card_effects: boolean
          bulk_delete_protection: boolean
          sound_notifications: boolean
          click_sound_file: string
          ai_api_key: string
          ai_personalities: string[]
          ai_behavior_prompt: string
          ai_suggest_questions: boolean
          use_default_personality: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          dark_mode?: boolean
          card_effects?: boolean
          bulk_delete_protection?: boolean
          sound_notifications?: boolean
          click_sound_file?: string
          ai_api_key?: string
          ai_personalities?: string[]
          ai_behavior_prompt?: string
          ai_suggest_questions?: boolean
          use_default_personality?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          dark_mode?: boolean
          card_effects?: boolean
          bulk_delete_protection?: boolean
          sound_notifications?: boolean
          click_sound_file?: string
          ai_api_key?: string
          ai_personalities?: string[]
          ai_behavior_prompt?: string
          ai_suggest_questions?: boolean
          use_default_personality?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      chat_conversations: {
        Row: {
          id: string
          user_id: number
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: number
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: number
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          timestamp: string
        }
        Insert: {
          id: string
          conversation_id: string
          role: string
          content: string
          timestamp?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          timestamp?: string
        }
      }
      campaign_views: {
        Row: {
          id: number
          campaign_id: number
          timestamp: string
          user_agent: string | null
          ip_address: string | null
          referer: string | null
        }
        Insert: {
          id?: number
          campaign_id: number
          timestamp?: string
          user_agent?: string | null
          ip_address?: string | null
          referer?: string | null
        }
        Update: {
          id?: number
          campaign_id?: number
          timestamp?: string
          user_agent?: string | null
          ip_address?: string | null
          referer?: string | null
        }
      }
      campaign_clicks: {
        Row: {
          id: number
          campaign_id: number
          timestamp: string
          user_agent: string | null
          ip_address: string | null
          referer: string | null
        }
        Insert: {
          id?: number
          campaign_id: number
          timestamp?: string
          user_agent?: string | null
          ip_address?: string | null
          referer?: string | null
        }
        Update: {
          id?: number
          campaign_id?: number
          timestamp?: string
          user_agent?: string | null
          ip_address?: string | null
          referer?: string | null
        }
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