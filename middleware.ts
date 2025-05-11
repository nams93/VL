import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Liste des routes qui ne nécessitent pas d'authentification
const publicRoutes = ["/", "/login", "/api/auth", "/_next", "/favicon.ico", "/images"]

// Fonction pour vérifier si une route est publique
const isPublicRoute = (path: string): boolean => {
  return publicRoutes.some((route) => path.startsWith(route))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Si c'est une route publique, on laisse passer
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Vérifier si l'agent est connecté
  const isLoggedIn = request.cookies.has("gpis-agent-id")

  // Si l'agent n'est pas connecté, rediriger vers la page de connexion
  if (!isLoggedIn) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    url.search = `?redirect=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }

  // Protection spéciale pour le tableau de bord
  if (pathname.startsWith("/dashboard")) {
    // Vérifier si l'agent est administrateur (ID 3269M)
    // Note: Dans un vrai middleware, nous vérifierions le rôle via un JWT ou une session
    // Ici, nous utilisons un cookie pour simuler cette vérification
    const isAdmin = request.cookies.get("gpis-agent-role")?.value === "admin"

    if (!isAdmin) {
      // Rediriger vers la page d'accueil avec un message d'accès restreint
      const url = request.nextUrl.clone()
      url.pathname = "/"
      url.search = "?access=restricted"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Configurer les routes sur lesquelles le middleware doit s'exécuter
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
}
