"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Home, FileText } from "lucide-react"
import Link from "next/link"

interface InspectionConfirmationProps {
  inspectionId: string
  vehicleInfo: {
    immatriculation: string
    date: string
  }
  agentName: string
}

export function InspectionConfirmation({ inspectionId, vehicleInfo, agentName }: InspectionConfirmationProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Simuler un temps d'attente avec un compteur
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Formater le temps écoulé en minutes et secondes
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
          <CardTitle className="text-xl">Inspection en attente de validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Numéro d'inspection:</span>
              <span className="text-sm">{inspectionId}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Véhicule:</span>
              <span className="text-sm">{vehicleInfo.immatriculation}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Date:</span>
              <span className="text-sm">{vehicleInfo.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Agent:</span>
              <span className="text-sm">{agentName}</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              <p>En attente de validation par le COS</p>
            </div>
            <p className="text-sm text-gray-500">Temps d'attente: {formatTime(timeElapsed)}</p>
          </div>

          <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
            <p className="text-sm text-amber-800">
              Votre inspection a été soumise avec succès et est en attente de validation par le COS. Vous pouvez quitter
              cette page et revenir à l'accueil.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Voir les détails
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

