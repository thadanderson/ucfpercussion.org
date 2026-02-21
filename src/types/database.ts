/**
 * Stub database types for all 8 tables.
 * Replace with `supabase gen types typescript --project-id <id>` output
 * once the Supabase project is configured.
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: "student" | "faculty" | "admin";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      students: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          instrument: string | null;
          enrollment_year: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["students"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
      };
      faculty: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          title: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["faculty"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["faculty"]["Insert"]>;
      };
      lessons: {
        Row: {
          id: string;
          student_id: string;
          faculty_id: string;
          scheduled_at: string;
          duration_minutes: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lessons"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
      };
      juries: {
        Row: {
          id: string;
          student_id: string;
          semester: string;
          scheduled_at: string;
          grade: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["juries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["juries"]["Insert"]>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          location: string | null;
          starts_at: string;
          ends_at: string | null;
          published: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["events"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string | null;
          published: boolean;
          published_at: string | null;
          author_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["posts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
      };
      music_library: {
        Row: {
          id: string;
          title: string;
          composer: string | null;
          arranger: string | null;
          instrumentation: string | null;
          location: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["music_library"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["music_library"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
