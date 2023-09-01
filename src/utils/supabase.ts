import { SupabaseClient } from '@supabase/supabase-js';

class Supabase extends SupabaseClient {
  constructor() {
    const supabaseUrl = process.env['SUPABASE_URL'] as string;
    const supabaseKey = process.env['SUPABASE_KEY'] as string;
    super(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  }
}

const instance = new Supabase();

export default instance;
