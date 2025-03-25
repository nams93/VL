"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, FileText } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Données fictives pour l'historique des inspections
const inspectionData = [
  {
    id: "INS-001",
    vehicleId: "v1",
    immatriculation: "AB-123-CD",
    date: new Date(2023, 5, 15),
    agent: "Jean Dupont",
    status: "conforme",
    issues: 0,
  },
  {
    id: "INS-002",
    vehicleId: "v2",
    immatriculation: "EF-456-GH",
    date: new Date(2023, 5, 20),
    agent: "Marie Martin",
    status: "non-conforme",
    issues: 3,
  },
  {
    id: "INS-003",
    vehicleId: "v3",
    immatriculation: "IJ-789-KL",
    date: new Date(2023, 6, 5),
    agent: "Pierre Durand",
    status: "conforme",
    issues: 0,
  },
  {
    id: "INS-004",
    vehicleId: "v1",
    immatriculation: "AB-123-CD",
    date: new Date(2023, 7, 10),
    agent: "Sophie Petit",
    status: "conforme",
    issues: 0,
  },
  {
    id: "INS-005",
    vehicleId: "v4",
    immatriculation: "MN-012-OP",
    date: new Date(2023, 7, 25),
    agent: "Lucas Bernard",
    status: "non-conforme",
    issues: 2,
  },
]

export function InspectionHistory() {
  const [filter, setFilter] = useState("all")

  // Filtrer les inspections selon le statut
  const filteredInspections =
    filter === "all" ? inspectionData : inspectionData.filter((inspection) => inspection.status === filter)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Historique des Inspections</CardTitle>
            <CardDescription>Consultez l'historique des inspections techniques des véhicules</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              Tous
            </Button>
            <Button
              variant={filter === "conforme" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("conforme")}
            >
              Conformes
            </Button>
            <Button
              variant={filter === "non-conforme" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("non-conforme")}
            >
              Non-conformes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Immatriculation</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInspections.map((inspection) => (
              <TableRow key={inspection.id}>
                <TableCell className="font-medium">{inspection.id}</TableCell>
                <TableCell>{inspection.immatriculation}</TableCell>
                <TableCell>{format(inspection.date, "dd MMMM yyyy", { locale: fr })}</TableCell>
                <TableCell>{inspection.agent}</TableCell>
                <TableCell>
                  <Badge variant={inspection.status === "conforme" ? "success" : "destructive"}>
                    {inspection.status === "conforme" ? "Conforme" : `Non-conforme (${inspection.issues})`}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

