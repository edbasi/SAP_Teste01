// backend/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fqnwffegkkjzfwogxsyx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxbndmZmVna2tqemZ3b2d4c3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4Nzc5ODIsImV4cCI6MjA2NzQ1Mzk4Mn0.hr2v-ntjZyAtZCJBBGB76aVAbRSeS4Jtzsw3cEzcw1s';
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
