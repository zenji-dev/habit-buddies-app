-- Migration script v2: Switch from Supabase Auth (UUID) to Clerk (String IDs)
-- Handles Policies and Functions dependencies.

BEGIN;

----------------------------------------------------------------
-- 1. DROP DEPENDENT POLICIES & FUNCTIONS
----------------------------------------------------------------

-- Helper function to drop policies if they exist (to avoid errors)
-- We will just run explicit DROP statements based on the list we retrieved.

-- PROFILES
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- HABITS
DROP POLICY IF EXISTS "Users can manage own habits" ON habits;
DROP POLICY IF EXISTS "Habits viewable by authenticated" ON habits;
DROP POLICY IF EXISTS "Individuals can create habits" ON habits;
DROP POLICY IF EXISTS "Individuals can view their own habits" ON habits;
DROP POLICY IF EXISTS "Individuals can update their own habits" ON habits;
DROP POLICY IF EXISTS "Individuals can delete their own habits" ON habits;

-- CHECK_INS
DROP POLICY IF EXISTS "Users can manage own check_ins" ON check_ins;
DROP POLICY IF EXISTS "Check-ins viewable by authenticated" ON check_ins;
DROP POLICY IF EXISTS "Users can create check-ins" ON check_ins;
DROP POLICY IF EXISTS "Users can view their own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Users can delete their own check-ins" ON check_ins;

-- FRIENDSHIPS
DROP POLICY IF EXISTS "Users can see own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON friendships;
DROP POLICY IF EXISTS "Users can update friendships" ON friendships;

-- KUDOS
DROP POLICY IF EXISTS "Kudos viewable by authenticated" ON kudos;
DROP POLICY IF EXISTS "Users can give kudos" ON kudos;
DROP POLICY IF EXISTS "Users can remove own kudos" ON kudos;

-- STRAVA_TOKENS
DROP POLICY IF EXISTS "Users can manage own strava tokens" ON strava_tokens;

-- ACTIVITIES
DROP POLICY IF EXISTS "Anyone can view activities" ON activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;

-- CHALLENGES
DROP POLICY IF EXISTS "Users can create challenges" ON challenges;
DROP POLICY IF EXISTS "Creators can update their challenges" ON challenges;
DROP POLICY IF EXISTS "Members can view their challenges" ON challenges;

-- CHALLENGE_MEMBERS
DROP POLICY IF EXISTS "Users can join challenges" ON challenge_members;
DROP POLICY IF EXISTS "Users can leave challenges" ON challenge_members;
DROP POLICY IF EXISTS "Users can invite others" ON challenge_members;
DROP POLICY IF EXISTS "Users can update their own membership status" ON challenge_members;
DROP POLICY IF EXISTS "Members or invitees can view challenge members" ON challenge_members;

-- DAILY_LOGS
DROP POLICY IF EXISTS "Members can view daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can insert their own daily logs" ON daily_logs;


-- DROP FUNCTION that depends on auth.uid() and is used in policies
DROP FUNCTION IF EXISTS get_my_challenge_ids();

----------------------------------------------------------------
-- 2. ALTER COLUMNS TO TEXT
----------------------------------------------------------------

-- PROFILES
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE profiles ALTER COLUMN user_id TYPE text;

-- HABITS
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_user_id_fkey;
ALTER TABLE habits ALTER COLUMN user_id TYPE text;

-- CHECK_INS
ALTER TABLE check_ins DROP CONSTRAINT IF EXISTS check_ins_user_id_fkey;
ALTER TABLE check_ins ALTER COLUMN user_id TYPE text;

-- FRIENDSHIPS
ALTER TABLE friendships DROP CONSTRAINT IF EXISTS friendships_user_id_fkey;
ALTER TABLE friendships DROP CONSTRAINT IF EXISTS friendships_friend_id_fkey;
ALTER TABLE friendships ALTER COLUMN user_id TYPE text;
ALTER TABLE friendships ALTER COLUMN friend_id TYPE text;

-- DAILY_LOGS
ALTER TABLE daily_logs DROP CONSTRAINT IF EXISTS daily_logs_user_id_fkey;
ALTER TABLE daily_logs ALTER COLUMN user_id TYPE text;

-- ACTIVITIES
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_user_id_fkey;
ALTER TABLE activities ALTER COLUMN user_id TYPE text;

-- KUDOS
ALTER TABLE kudos DROP CONSTRAINT IF EXISTS kudos_from_user_id_fkey;
ALTER TABLE kudos DROP CONSTRAINT IF EXISTS kudos_to_user_id_fkey;
ALTER TABLE kudos ALTER COLUMN from_user_id TYPE text;
ALTER TABLE kudos ALTER COLUMN to_user_id TYPE text;

-- STRAVA_TOKENS
ALTER TABLE strava_tokens DROP CONSTRAINT IF EXISTS strava_tokens_user_id_fkey;
ALTER TABLE strava_tokens ALTER COLUMN user_id TYPE text;

-- CHALLENGES
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_created_by_fkey;
ALTER TABLE challenges ALTER COLUMN created_by TYPE text;

-- CHALLENGE_MEMBERS
ALTER TABLE challenge_members DROP CONSTRAINT IF EXISTS challenge_members_user_id_fkey;
ALTER TABLE challenge_members DROP CONSTRAINT IF EXISTS challenge_members_invited_by_fkey;
ALTER TABLE challenge_members ALTER COLUMN user_id TYPE text;
ALTER TABLE challenge_members ALTER COLUMN invited_by TYPE text;


----------------------------------------------------------------
-- 3. RECREATE FUNCTIONS & POLICIES
----------------------------------------------------------------

-- Recreate Function with JWT claim check
CREATE OR REPLACE FUNCTION public.get_my_challenge_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT challenge_id 
  FROM challenge_members 
  WHERE user_id = (select auth.jwt() ->> 'sub');
$function$;

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING ((select auth.jwt() ->> 'sub') = user_id);

-- HABITS
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

-- CHECK_INS
CREATE POLICY "Users can create check-ins" 
ON check_ins FOR INSERT 
WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can view their own check-ins" 
ON check_ins FOR SELECT 
USING ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete their own check-ins" 
ON check_ins FOR DELETE 
USING ((select auth.jwt() ->> 'sub') = user_id);

-- FRIENDSHIPS
CREATE POLICY "Users can view their own friendships"
ON friendships FOR SELECT
USING (
  (select auth.jwt() ->> 'sub') = user_id OR 
  (select auth.jwt() ->> 'sub') = friend_id
);

CREATE POLICY "Users can insert friendship request"
ON friendships FOR INSERT
WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update their own friendships"
ON friendships FOR UPDATE
USING (
  (select auth.jwt() ->> 'sub') = user_id OR 
  (select auth.jwt() ->> 'sub') = friend_id
);

-- KUDOS
CREATE POLICY "Kudos viewable by authenticated" 
ON kudos FOR SELECT 
USING (true);

CREATE POLICY "Users can give kudos" 
ON kudos FOR INSERT 
WITH CHECK ((select auth.jwt() ->> 'sub') = from_user_id);

CREATE POLICY "Users can remove own kudos" 
ON kudos FOR DELETE 
USING ((select auth.jwt() ->> 'sub') = from_user_id);

-- STRAVA_TOKENS
CREATE POLICY "Users can manage own strava tokens" 
ON strava_tokens FOR ALL 
USING ((select auth.jwt() ->> 'sub') = user_id);

-- ACTIVITIES
CREATE POLICY "Anyone can view activities" 
ON activities FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own activities" 
ON activities FOR INSERT 
WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete their own activities" 
ON activities FOR DELETE 
USING ((select auth.jwt() ->> 'sub') = user_id);

-- CHALLENGES
CREATE POLICY "Users can create challenges" 
ON challenges FOR INSERT 
WITH CHECK ((select auth.jwt() ->> 'sub') = created_by);

CREATE POLICY "Creators can update their challenges" 
ON challenges FOR UPDATE 
USING ((select auth.jwt() ->> 'sub') = created_by);

-- Updated to use the new function (which uses text comparison internally)
CREATE POLICY "Members can view their challenges" 
ON challenges FOR SELECT 
USING (
  id IN (SELECT get_my_challenge_ids()) OR 
  created_by = (select auth.jwt() ->> 'sub')
);

-- CHALLENGE_MEMBERS
CREATE POLICY "Users can join challenges" 
ON challenge_members FOR INSERT 
WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can leave challenges" 
ON challenge_members FOR DELETE 
USING ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can invite others" 
ON challenge_members FOR INSERT 
WITH CHECK (
  (user_id = (select auth.jwt() ->> 'sub') AND status = 'accepted') OR 
  (user_id <> (select auth.jwt() ->> 'sub') AND status = 'pending' AND invited_by = (select auth.jwt() ->> 'sub'))
);

CREATE POLICY "Users can update their own membership status" 
ON challenge_members FOR UPDATE 
USING ((select auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Members or invitees can view challenge members" 
ON challenge_members FOR SELECT 
USING (
  challenge_id IN (SELECT get_my_challenge_ids()) OR 
  user_id = (select auth.jwt() ->> 'sub') OR 
  invited_by = (select auth.jwt() ->> 'sub')
);

-- DAILY_LOGS
CREATE POLICY "Members can view daily logs" 
ON daily_logs FOR SELECT 
USING (
  challenge_id IN (SELECT get_my_challenge_ids())
);

CREATE POLICY "Users can insert their own daily logs" 
ON daily_logs FOR INSERT 
WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);


COMMIT;
