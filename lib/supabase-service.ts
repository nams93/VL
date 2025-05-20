import { createClient } from "@supabase/supabase-js"

// Singleton pattern pour éviter de créer plusieurs instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Client côté serveur (pour les API routes et Server Actions)
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Les variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies")
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Client côté client (pour les composants React)
export const createClientSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies",
    )
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey)
  return supabaseInstance
}

// Fonction utilitaire pour obtenir le client Supabase côté client
export const getSupabaseClient = () => {
  return createClientSupabaseClient()
}
