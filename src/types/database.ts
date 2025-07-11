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
        };
        Insert: {
          id?: string;
          article_id: string;
          author_name: string;
          author_email?: string | null;
          content: string;
          created_at?: string;
          published?: boolean;
        };
        Update: {
          id?: string;
          article_id?: string;
          author_name?: string;
          author_email?: string | null;
          content?: string;
          created_at?: string;
          published?: boolean;
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
