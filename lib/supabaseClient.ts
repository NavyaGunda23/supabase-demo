// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://csmnfsxynsvswaqrhhuj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbW5mc3h5bnN2c3dhcXJoaHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjgzNTQsImV4cCI6MjA2NTkwNDM1NH0.pUTc3YD6VYHRJObwk0UYgADWTxeFKgRF-D03BWEeOk0';

export const supabase = createClient(supabaseUrl, supabaseKey);
