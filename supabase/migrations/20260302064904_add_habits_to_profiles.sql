-- Migration: Add habits column to profiles
-- Adiciona uma coluna de texto para armazenar os hábitos iniciais do usuário
-- Isso permite capturar o que o usuário quer possuir durante o onboarding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS habits TEXT;
