-- Migration script to switch from Supabase Auth (UUID) to Clerk (String IDs)

-- Disable RLS temporarily to avoid locking issues during migration if needed, though usually not required for alter column.
-- We will proceed table by table.

BEGIN;

----------------------------------------------------------------
-- 1. PROFILES
----------------------------------------------------------------
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE profiles ALTER COLUMN user_id TYPE text;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING ((select auth.jwt() ->> 'sub') = user_id);

----------------------------------------------------------------
-- 2. HABITS
----------------------------------------------------------------
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_user_id_fkey;
ALTER TABLE habits ALTER COLUMN user_id TYPE text;

DROP POLICY IF EXISTS "Individuals can create habits" ON habits;
DROP POLICY IF EXISTS "Individuals can view their own habits" ON habits;
DROP POLICY IF EXISTS "Individuals can update their own habits" ON habits;
DROP POLICY IF EXISTS "Individuals can delete their own habits" ON habits;

CREATE POLICY "Individuals can create habits" 
ON habits FOR INSERT 
WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Individuals can view their own habits" 
ON habits FOR SELECT 
USING ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Individuals can update their own habits" 
ON habits FOR UPDATE 
USING ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Individuals can delete their own habits" 
ON habits FOR DELETE 
USING ((select auth.jwt() ->> 'sub') = user_id);

----------------------------------------------------------------
-- 3. CHECK_INS
----------------------------------------------------------------
ALTER TABLE check_ins DROP CONSTRAINT IF EXISTS check_ins_user_id_fkey;
ALTER TABLE check_ins ALTER COLUMN user_id TYPE text;

DROP POLICY IF EXISTS "Users can create check-ins" ON check_ins;
DROP POLICY IF EXISTS "Users can view their own check-ins" ON check_ins;
-- Add policies for check-ins (assuming standard CRUD)
CREATE POLICY "Users can create check-ins" 
ON check_ins FOR INSERT 
WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can view their own check-ins" 
ON check_ins FOR SELECT 
USING ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete their own check-ins" 
ON check_ins FOR DELETE 
USING ((select auth.jwt() ->> 'sub') = user_id);

----------------------------------------------------------------
-- 4. FRIENDSHIPS
----------------------------------------------------------------
ALTER TABLE friendships DROP CONSTRAINT IF EXISTS friendships_user_id_fkey;
ALTER TABLE friendships DROP CONSTRAINT IF EXISTS friendships_friend_id_fkey;
ALTER TABLE friendships ALTER COLUMN user_id TYPE text;
ALTER TABLE friendships ALTER COLUMN friend_id TYPE text;

-- Friendships policies are complex (involving OR). 
-- Use (select auth.jwt() ->> 'sub') instead of auth.uid()::text

----------------------------------------------------------------
-- 5. DAILY_LOGS
----------------------------------------------------------------
ALTER TABLE daily_logs DROP CONSTRAINT IF EXISTS daily_logs_user_id_fkey;
ALTER TABLE daily_logs ALTER COLUMN user_id TYPE text;

----------------------------------------------------------------
-- 6. CHALLENGES & MEMBERS
----------------------------------------------------------------
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_created_by_fkey;
ALTER TABLE challenges ALTER COLUMN created_by TYPE text;

ALTER TABLE challenge_members DROP CONSTRAINT IF EXISTS challenge_members_user_id_fkey;
ALTER TABLE challenge_members DROP CONSTRAINT IF EXISTS challenge_members_invited_by_fkey;
ALTER TABLE challenge_members ALTER COLUMN user_id TYPE text;
ALTER TABLE challenge_members ALTER COLUMN invited_by TYPE text;

----------------------------------------------------------------
-- 7. ACTIVITIES
----------------------------------------------------------------
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_user_id_fkey;
ALTER TABLE activities ALTER COLUMN user_id TYPE text;

----------------------------------------------------------------
-- 8. KUDOS
----------------------------------------------------------------
ALTER TABLE kudos DROP CONSTRAINT IF EXISTS kudos_from_user_id_fkey;
ALTER TABLE kudos DROP CONSTRAINT IF EXISTS kudos_to_user_id_fkey;
ALTER TABLE kudos ALTER COLUMN from_user_id TYPE text;
ALTER TABLE kudos ALTER COLUMN to_user_id TYPE text;

----------------------------------------------------------------
-- 9. STRAVA_TOKENS
----------------------------------------------------------------
ALTER TABLE strava_tokens DROP CONSTRAINT IF EXISTS strava_tokens_user_id_fkey;
ALTER TABLE strava_tokens ALTER COLUMN user_id TYPE text;


COMMIT;
