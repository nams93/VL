"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Upload } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type FuelImportFormProps = {
  isOpen: boolean
  onClose: () => void
  onImport: (data: any[]) => void
}

export function FuelImportForm({ isOpen, onClose, onImport }: FuelImportFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)

    // Vérifier le type de fichier
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Veuillez sélectionner un fichier CSV")
      return
    }

    // Lire le fichier
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string
        const lines = csv.split("\n")
        const headers = lines[0].split(",").map((h) => h.trim())

        // Vérifier les en-têtes requis
        const requiredHeaders = ["date", "vehicule", "litres", "prix", "kilometrage"]
        const missingHeaders = requiredHeaders.filter(
          (h) => !headers.some((header) => header.toLowerCase().includes(h.toLowerCase())),
        )

        if (missingHeaders.length > 0) {
          setError(`Colonnes manquantes: ${missingHeaders.join(", ")}`)
          return
        }

        // Analyser les données
        const data = []
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue

          const values = lines[i].split(",").map((v) => v.trim())
          if (values.length !== headers.length) continue

          const entry: any = {}
          headers.forEach((header, index) => {
            entry[header] = values[index]
          })

          data.push(entry)
        }

        setPreview(data.slice(0, 5)) // Afficher les 5 premières lignes
      } catch (err) {
        setError("Erreur lors de l'analyse du fichier CSV")
        console.error(err)
      }
    }

    reader.readAsText(selectedFile)
  }

  const handleImport = () => {
    if (!file) return

    setImporting(true)

    // Simuler un traitement
    setTimeout(() => {
      // Dans un environnement réel, nous traiterions le fichier complet ici
      onImport(preview)
      setImporting(false)
      onClose()

      // Réinitialiser le formulaire
      setFile(null)
      setPreview([])
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer des transactions de carburant</DialogTitle>
          <DialogDescription>Importez des transactions de carburant à partir d'un fichier CSV.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Fichier CSV</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="cursor-pointer" />
            <p className="text-xs text-muted-foreground">
              Le fichier doit contenir les colonnes: date, vehicule, litres, prix, kilometrage
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Aperçu des données</h3>
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(preview[0]).map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, i) => (
                          <TableCell key={i}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground">Affichage des 5 premières lignes sur {file?.name}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={importing}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!file || preview.length === 0 || importing}
            className="flex items-center"
          >
            {importing ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Importation...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importer les données
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

