export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          author_id: string | null;
          created_at: string;
          updated_at: string;
          published: boolean;
          view_count: number;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
          published?: boolean;
          view_count?: number;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
          published?: boolean;
          view_count?: number;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      article_tags: {
        Row: {
          article_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          article_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          article_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          article_id: string;
          author_name: string;
          author_email: string | null;
          content: string;
          created_at: string;
          published: boolean;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          article_id: string;
          author_name: string;
          author_email?: string | null;
          content: string;
          created_at?: string;
          published?: boolean;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          article_id?: string;
          author_name?: string;
          author_email?: string | null;
          content?: string;
          created_at?: string;
          published?: boolean;
          user_id?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          role: "admin" | "user";
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "admin" | "user";
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin" | "user";
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// 便捷类型别名
export type Article = Database["public"]["Tables"]["articles"]["Row"];
export type ArticleInsert = Database["public"]["Tables"]["articles"]["Insert"];
export type ArticleUpdate = Database["public"]["Tables"]["articles"]["Update"];

export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
export type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];

export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"];
export type CommentUpdate = Database["public"]["Tables"]["comments"]["Update"];

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type UserProfileInsert =
  Database["public"]["Tables"]["user_profiles"]["Insert"];
export type UserProfileUpdate =
  Database["public"]["Tables"]["user_profiles"]["Update"];

// 联合查询类型
export type ArticleWithTags = Article & {
  tags: Array<{
    tag: Tag;
  }>;
};

export type ArticleWithComments = Article & {
  comments: Comment[];
};

// 前端组件专用类型（与API响应结构完全匹配）
export type ArticleForDisplay = ArticleWithTags;

// 认证相关类型
export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  email?: string;
  profile?: UserProfile;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (provider: "github" | "google") => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
