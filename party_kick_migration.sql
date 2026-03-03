-- Migration: Permite que o criador da Party (Challenge) remova outros membros
CREATE POLICY "Challenge owners can remove members" ON "public"."challenge_members"
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM challenges 
    WHERE challenges.id = challenge_members.challenge_id 
    AND challenges.created_by = (SELECT auth.jwt()->>'sub')
  )
);
