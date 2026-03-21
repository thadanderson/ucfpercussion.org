/**
 * TypeScript types matching supabase/schema.sql exactly.
 * Replace with `supabase gen types typescript --project-id <id>` output
 * once the Supabase project has live data to introspect.
 *
 * Every table requires `Relationships: []` to satisfy @supabase/postgrest-js GenericTable.
 */

export interface Database {
  public: {
    Tables: {
      /**
       * users.id is a FK to auth.users(id) — no auto-generated default.
       * The admin provides the UUID when inserting (after creating the auth user).
       */
      users: {
        Row: {
          id: string;
          email: string;
          role: "student" | "faculty" | "admin" | "alumni";
          created_at: string;
        };
        Insert: {
          id: string; // required: must match the auth.users UUID
          email: string;
          role: "student" | "faculty" | "admin" | "alumni";
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["users"]["Insert"], "id">>;
        Relationships: [];
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
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          instrument?: string | null;
          enrollment_year?: number | null;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["students"]["Insert"], "id">>;
        Relationships: [];
      };

      faculty: {
        Row: {
          id: string;
          user_id: string | null;
          first_name: string;
          last_name: string;
          title: string | null;
          bio: string | null;
          headshot_url: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          first_name: string;
          last_name: string;
          title?: string | null;
          bio?: string | null;
          headshot_url?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["faculty"]["Insert"], "id">>;
        Relationships: [];
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
        Insert: {
          id?: string;
          student_id: string;
          faculty_id: string;
          scheduled_at: string;
          duration_minutes?: number; // DEFAULT 60
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["lessons"]["Insert"], "id">>;
        Relationships: [];
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
        Insert: {
          id?: string;
          student_id: string;
          semester: string;
          scheduled_at: string;
          grade?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["juries"]["Insert"], "id">>;
        Relationships: [];
      };

      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          location: string | null;
          starts_at: string;
          ends_at: string | null;
          image_url: string | null;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          location?: string | null;
          starts_at: string;
          ends_at?: string | null;
          image_url?: string | null;
          published?: boolean; // DEFAULT false
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["events"]["Insert"], "id">>;
        Relationships: [];
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
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content?: string | null;
          published?: boolean; // DEFAULT false
          published_at?: string | null;
          author_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["posts"]["Insert"], "id">>;
        Relationships: [];
      };

      alumni: {
        Row: {
          id: string;
          user_id: string | null;
          first_name: string;
          last_name: string;
          graduation_year: number | null;
          degree: string | null;
          current_role: string | null;
          current_institution: string | null;
          grad_school: string | null;
          bio: string | null;
          headshot_url: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          first_name: string;
          last_name: string;
          graduation_year?: number | null;
          degree?: string | null;
          current_role?: string | null;
          current_institution?: string | null;
          grad_school?: string | null;
          bio?: string | null;
          headshot_url?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["alumni"]["Insert"], "id">>;
        Relationships: [];
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
        Insert: {
          id?: string;
          title: string;
          composer?: string | null;
          arranger?: string | null;
          instrumentation?: string | null;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["music_library"]["Insert"], "id">>;
        Relationships: [];
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
