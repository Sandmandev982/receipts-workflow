// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://chaavrvnthhlmevvkhzm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoYWF2cnZudGhobG1ldnZraHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NDI2OTAsImV4cCI6MjA1NzExODY5MH0.lZNGG9AcRWGozukfNYoTlA94lDV5UX63xl5z25hsyb4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);