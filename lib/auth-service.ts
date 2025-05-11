// Types pour l'authentification
type UserRole = "agent" | "supervisor" | "admin"

type Agent = {
  id: string
  name: string
  loginTime: string
  role?: UserRole
  lastActive?: string
}

type FormAuthorization = {
  formId: string
  agentId: string
  formType: string
  vehicleId?: string
  createdAt: string
}

// Clés pour le stockage local
const AGENT_STORAGE_KEY = "gpis-current-agent"
const FORM_AUTH_STORAGE_KEY = "gpis-form-authorizations"
const ADMIN_ACCOUNTS_KEY = "gpis-admin-accounts"

// Service d'authentification
export const authService = {
  // Initialiser les comptes administrateurs par défaut
  initializeAdminAccounts: (): void => {
    const storedAccounts = localStorage.getItem(ADMIN_ACCOUNTS_KEY)
    if (!storedAccounts) {
      // Créer des comptes par défaut si aucun n'existe
      const defaultAccounts = [
        { id: "3269M", name: "Administrateur Système", role: "admin" as UserRole },
        { id: "supervisor", name: "Superviseur Principal", role: "supervisor" as UserRole },
      ]
      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(defaultAccounts))
    }
  },

  // Connexion d'un agent avec rôle
  login: (agentId: string, agentName: string, role: UserRole = "agent"): Agent => {
    // Initialiser les comptes administrateurs si nécessaire
    authService.initializeAdminAccounts()

    // Vérifier si l'ID est un compte administrateur prédéfini
    const adminAccounts = authService.getAdminAccounts()
    const adminAccount = adminAccounts.find((account) => account.id === agentId)

    if (adminAccount) {
      // Si c'est un compte admin prédéfini, utiliser son rôle et son nom
      role = adminAccount.role
      agentName = adminAccount.name || agentName
    }

    const agent: Agent = {
      id: agentId,
      name: agentName || `Agent ${agentId}`,
      loginTime: new Date().toISOString(),
      role,
      lastActive: new Date().toISOString(),
    }

    // Stocker les informations de l'agent dans localStorage
    localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agent))

    return agent
  },

  // Déconnexion de l'agent
  logout: (): void => {
    localStorage.removeItem(AGENT_STORAGE_KEY)
  },

  // Récupérer l'agent actuellement connecté
  getCurrentAgent: (): Agent | null => {
    const storedAgent = localStorage.getItem(AGENT_STORAGE_KEY)
    if (!storedAgent) return null

    try {
      return JSON.parse(storedAgent) as Agent
    } catch (error) {
      console.error("Erreur lors de la récupération de l'agent:", error)
      return null
    }
  },

  // Vérifier si un agent est connecté
  isLoggedIn: (): boolean => {
    return !!authService.getCurrentAgent()
  },

  // Vérifier si l'utilisateur est un superviseur
  isSupervisor: (): boolean => {
    const currentAgent = authService.getCurrentAgent()
    return currentAgent?.role === "supervisor" || currentAgent?.role === "admin"
  },

  // Vérifier si l'utilisateur est un administrateur
  isAdmin: (): boolean => {
    const currentAgent = authService.getCurrentAgent()
    return currentAgent?.role === "admin"
  },

  // Récupérer les comptes administrateurs prédéfinis
  getAdminAccounts: () => {
    // Initialiser les comptes administrateurs si nécessaire
    authService.initializeAdminAccounts()

    const storedAccounts = localStorage.getItem(ADMIN_ACCOUNTS_KEY)
    try {
      return JSON.parse(storedAccounts || "[]")
    } catch (error) {
      console.error("Erreur lors de la récupération des comptes admin:", error)
      return []
    }
  },

  // Enregistrer une autorisation pour un formulaire
  registerForm: (formId: string, formType: string, vehicleId?: string): void => {
    const currentAgent = authService.getCurrentAgent()
    if (!currentAgent) return

    const authorization: FormAuthorization = {
      formId,
      agentId: currentAgent.id,
      formType,
      vehicleId,
      createdAt: new Date().toISOString(),
    }

    // Récupérer les autorisations existantes
    const storedAuths = localStorage.getItem(FORM_AUTH_STORAGE_KEY)
    const authorizations: FormAuthorization[] = storedAuths ? JSON.parse(storedAuths) : []

    // Ajouter la nouvelle autorisation
    authorizations.push(authorization)

    // Sauvegarder les autorisations
    localStorage.setItem(FORM_AUTH_STORAGE_KEY, JSON.stringify(authorizations))
  },

  // Vérifier si un agent peut modifier un formulaire
  canEditForm: (formId: string): boolean => {
    const currentAgent = authService.getCurrentAgent()
    if (!currentAgent) return false

    // Les administrateurs et superviseurs peuvent modifier tous les formulaires
    if (currentAgent.role === "admin" || currentAgent.role === "supervisor") {
      return true
    }

    // Récupérer les autorisations
    const storedAuths = localStorage.getItem(FORM_AUTH_STORAGE_KEY)
    if (!storedAuths) return false

    try {
      const authorizations: FormAuthorization[] = JSON.parse(storedAuths)

      // Trouver l'autorisation pour ce formulaire
      const formAuth = authorizations.find((auth) => auth.formId === formId)
      if (!formAuth) return false

      // Vérifier si l'agent actuel est l'auteur du formulaire
      return formAuth.agentId === currentAgent.id
    } catch (error) {
      console.error("Erreur lors de la vérification des autorisations:", error)
      return false
    }
  },

  // Récupérer toutes les autorisations pour un agent
  getAgentForms: (agentId?: string): FormAuthorization[] => {
    const id = agentId || authService.getCurrentAgent()?.id
    if (!id) return []

    // Récupérer les autorisations
    const storedAuths = localStorage.getItem(FORM_AUTH_STORAGE_KEY)
    if (!storedAuths) return []

    try {
      const authorizations: FormAuthorization[] = JSON.parse(storedAuths)

      // Filtrer les autorisations pour cet agent
      return authorizations.filter((auth) => auth.agentId === id)
    } catch (error) {
      console.error("Erreur lors de la récupération des autorisations:", error)
      return []
    }
  },

  // Récupérer toutes les autorisations pour un véhicule
  getVehicleForms: (vehicleId: string): FormAuthorization[] => {
    // Récupérer les autorisations
    const storedAuths = localStorage.getItem(FORM_AUTH_STORAGE_KEY)
    if (!storedAuths) return []

    try {
      const authorizations: FormAuthorization[] = JSON.parse(storedAuths)

      // Filtrer les autorisations pour ce véhicule
      return authorizations.filter((auth) => auth.vehicleId === vehicleId)
    } catch (error) {
      console.error("Erreur lors de la récupération des autorisations:", error)
      return []
    }
  },
}
