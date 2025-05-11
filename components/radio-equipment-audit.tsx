"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Search,
  Filter,
  X,
  Calendar,
  User,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
} from "lucide-react"

// Types pour l'historique
interface HistoryEntry {
  date: string
  agent: string
  action: string
  formId: string
  formType: string
  formStatus: string
}

export function RadioEquipmentAudit() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [allHistory, setAllHistory] = useState<HistoryEntry[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([])

  // États pour les filtres
  const [showFilters, setShowFilters] = useState(false)
  const [dateFilter, setDateFilter] = useState("")
  const [agentFilter, setAgentFilter] = useState("")
  const [actionFilter, setActionFilter] = useState("")
  const [formIdFilter, setFormIdFilter] = useState("")
  const [formTypeFilter, setFormTypeFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // États pour les options uniques (pour les filtres)
  const [uniqueAgents, setUniqueAgents] = useState<string[]>([])
  const [uniqueActions, setUniqueActions] = useState<string[]>([])
  const [uniqueFormTypes, setUniqueFormTypes] = useState<string[]>([])

  // État pour le tri
  const [sortField, setSortField] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(20)

  // Charger toutes les fiches et extraire l'historique
  useEffect(() => {
    try {
      const stored = localStorage.getItem("radioEquipmentForms")
      if (stored) {
        const forms = JSON.parse(stored)

        // Extraire et consolider tout l'historique
        const consolidatedHistory: HistoryEntry[] = []

        forms.forEach((form: any) => {
          if (form.history && form.history.length > 0) {
            form.history.forEach((entry: any) => {
              consolidatedHistory.push({
                ...entry,
                formId: form.id,
                formType: form.type,
                formStatus: form.status || "submitted",
              })
            })
          }
        })

        setAllHistory(consolidatedHistory)
        setFilteredHistory(consolidatedHistory)

        // Extraire les valeurs uniques pour les filtres
        setUniqueAgents([...new Set(consolidatedHistory.map((entry) => entry.agent))])

        const actions = [
          ...new Set(
            consolidatedHistory.map((entry) => {
              const actionParts = entry.action.split(".")
              return actionParts[0].trim()
            }),
          ),
        ]
        setUniqueActions(actions)

        setUniqueFormTypes([...new Set(forms.map((form: any) => form.type))])
      }
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      setLoading(false)
    }
  }, [])

  // Appliquer les filtres et le tri
  useEffect(() => {
    if (!allHistory.length) return

    let filtered = [...allHistory]

    // Appliquer les filtres
    if (dateFilter) {
      const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0)
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date).setHours(0, 0, 0, 0)
        return entryDate === filterDate
      })
    }

    if (agentFilter) {
      filtered = filtered.filter((entry) => entry.agent === agentFilter)
    }

    if (actionFilter) {
      filtered = filtered.filter((entry) => entry.action.startsWith(actionFilter))
    }

    if (formIdFilter) {
      filtered = filtered.filter((entry) => entry.formId.toLowerCase().includes(formIdFilter.toLowerCase()))
    }

    if (formTypeFilter) {
      filtered = filtered.filter((entry) => entry.formType === formTypeFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.agent.toLowerCase().includes(query) ||
          entry.action.toLowerCase().includes(query) ||
          entry.formId.toLowerCase().includes(query),
      )
    }

    // Appliquer le tri
    filtered.sort((a, b) => {
      let valueA, valueB

      switch (sortField) {
        case "date":
          valueA = new Date(a.date).getTime()
          valueB = new Date(b.date).getTime()
          break
        case "agent":
          valueA = a.agent.toLowerCase()
          valueB = b.agent.toLowerCase()
          break
        case "action":
          valueA = a.action.toLowerCase()
          valueB = b.action.toLowerCase()
          break
        case "formId":
          valueA = a.formId.toLowerCase()
          valueB = b.formId.toLowerCase()
          break
        default:
          valueA = new Date(a.date).getTime()
          valueB = new Date(b.date).getTime()
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    setFilteredHistory(filtered)
    setCurrentPage(1) // Réinitialiser à la première page après filtrage
  }, [
    allHistory,
    dateFilter,
    agentFilter,
    actionFilter,
    formIdFilter,
    formTypeFilter,
    searchQuery,
    sortField,
    sortDirection,
  ])

  // Calculer les entrées à afficher pour la pagination actuelle
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage
    return filteredHistory.slice(startIndex, startIndex + entriesPerPage)
  }, [filteredHistory, currentPage, entriesPerPage])

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredHistory.length / entriesPerPage)

  // Fonction pour changer de page
  const changePage = (page: number) => {
    if (page < 1) page = 1
    if (page > totalPages) page = totalPages
    setCurrentPage(page)
  }

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setDateFilter("")
    setAgentFilter("")
    setActionFilter("")
    setFormIdFilter("")
    setFormTypeFilter("")
    setSearchQuery("")
  }

  // Fonction pour changer le tri
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc") // Par défaut, tri descendant
    }
  }

  // Fonction pour voir les détails d'une fiche
  const viewFormDetails = (formId: string) => {
    router.push(`/radio-equipment-detail/${formId}`)
  }

  // Fonction pour exporter les données filtrées
  const exportData = () => {
    // Créer un CSV à partir des données filtrées
    const headers = ["Date", "Agent", "Action", "ID Fiche", "Type", "Statut"]
    const csvContent = [
      headers.join(","),
      ...filteredHistory.map((entry) =>
        [
          new Date(entry.date).toLocaleString(),
          entry.agent,
          entry.action,
          entry.formId,
          entry.formType,
          entry.formStatus,
        ].join(","),
      ),
    ].join("\n")

    // Créer un blob et un lien de téléchargement
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `journal-audit-radio-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/radio-equipment-list")} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste des fiches
              </Button>
              <CardTitle>Journal d'audit des fiches radio</CardTitle>
              <CardDescription>
                Historique complet des modifications apportées aux fiches de perception et réintégration
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-8 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-9" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                  {showFilters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                </Button>
                <Button variant="outline" size="sm" className="h-9" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Filtres avancés</h3>
                <Button variant="ghost" size="sm" className="h-7 p-1" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-1" /> Réinitialiser
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Agent</label>
                  <select
                    value={agentFilter}
                    onChange={(e) => setAgentFilter(e.target.value)}
                    className="w-full h-8 text-sm rounded-md border border-input bg-background px-3 py-1"
                  >
                    <option value="">Tous les agents</option>
                    {uniqueAgents.map((agent, index) => (
                      <option key={index} value={agent}>
                        {agent}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Type d'action</label>
                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="w-full h-8 text-sm rounded-md border border-input bg-background px-3 py-1"
                  >
                    <option value="">Toutes les actions</option>
                    {uniqueActions.map((action, index) => (
                      <option key={index} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ID de fiche</label>
                  <Input
                    type="text"
                    placeholder="Ex: RADIO-123456"
                    value={formIdFilter}
                    onChange={(e) => setFormIdFilter(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Type de fiche</label>
                  <select
                    value={formTypeFilter}
                    onChange={(e) => setFormTypeFilter(e.target.value)}
                    className="w-full h-8 text-sm rounded-md border border-input bg-background px-3 py-1"
                  >
                    <option value="">Tous les types</option>
                    {uniqueFormTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type === "perception" ? "Perception" : "Réintégration"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Tableau d'historique */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th
                      className="py-3 px-4 text-left font-medium cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Date / Heure
                        {sortField === "date" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ChevronDown className="h-3 w-3 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-left font-medium cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("agent")}
                    >
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        Agent
                        {sortField === "agent" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ChevronDown className="h-3 w-3 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-left font-medium cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("action")}
                    >
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Action
                        {sortField === "action" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ChevronDown className="h-3 w-3 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-left font-medium cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("formId")}
                    >
                      <div className="flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        Fiche
                        {sortField === "formId" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ChevronDown className="h-3 w-3 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left font-medium">Type</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.length > 0 ? (
                    paginatedHistory.map((entry, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{new Date(entry.date).toLocaleString()}</td>
                        <td className="py-2 px-4 font-medium">{entry.agent}</td>
                        <td className="py-2 px-4">{entry.action}</td>
                        <td className="py-2 px-4">
                          <div className="flex items-center">
                            <span className="font-mono">{entry.formId}</span>
                            <Badge
                              className={`ml-2 ${
                                entry.formStatus === "modified"
                                  ? "bg-amber-100 text-amber-800"
                                  : entry.formStatus === "draft"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {entry.formStatus === "modified"
                                ? "Modifié"
                                : entry.formStatus === "draft"
                                  ? "Brouillon"
                                  : "Soumis"}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <Badge className="bg-gray-100 text-gray-800">
                            {entry.formType === "perception" ? "Perception" : "Réintégration"}
                          </Badge>
                        </td>
                        <td className="py-2 px-4">
                          <Button variant="ghost" size="sm" onClick={() => viewFormDetails(entry.formId)}>
                            <Eye className="h-3 w-3 mr-1" /> Voir
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                        Aucune entrée d'historique ne correspond aux critères de recherche
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredHistory.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Affichage de {Math.min(filteredHistory.length, (currentPage - 1) * entriesPerPage + 1)} à{" "}
                {Math.min(filteredHistory.length, currentPage * entriesPerPage)} sur {filteredHistory.length} entrées
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Logique pour afficher les pages autour de la page actuelle
                    let pageToShow
                    if (totalPages <= 5) {
                      pageToShow = i + 1
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i
                    } else {
                      pageToShow = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageToShow ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => changePage(pageToShow)}
                      >
                        {pageToShow}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
