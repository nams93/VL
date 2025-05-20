"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCloudSyncService } from "@/lib/cloud-sync-service"
import { v4 as uuidv4 } from "uuid"
import { Loader2, Plus, Check } from "lucide-react"

export function AddSyncData() {
  const [dataType, setDataType] = useState("inspection")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: "",
    agentId: "",
    comment: "",
    view: "front",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccess(false)

    try {
      const syncService = getCloudSyncService()
      await syncService.init()

      if (dataType === "inspection") {
        await syncService.addInspection({
          id: uuidv4(),
          vehicleId: formData.vehicleId,
          agentId: formData.agentId,
          data: {
            status: "completed",
            notes: formData.comment,
            timestamp: Date.now(),
          },
          timestamp: Date.now(),
          syncStatus: "pending",
        })
      } else if (dataType === "photo") {
        await syncService.addPhoto({
          id: uuidv4(),
          inspectionId: formData.vehicleId, // Utiliser vehicleId comme inspectionId pour simplifier
          view: formData.view,
          dataUrl:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", // Image vide
          comment: formData.comment,
          timestamp: Date.now(),
          syncStatus: "pending",
        })
      } else if (dataType === "radioEquipment") {
        await syncService.addRadioEquipment({
          id: uuidv4(),
          vehicleId: formData.vehicleId,
          agentId: formData.agentId,
          data: {
            status: "operational",
            notes: formData.comment,
            timestamp: Date.now(),
          },
          timestamp: Date.now(),
          syncStatus: "pending",
        })
      }

      setSuccess(true)
      // Réinitialiser le formulaire
      setFormData({
        vehicleId: "",
        agentId: "",
        comment: "",
        view: "front",
      })
    } catch (error) {
      console.error("Erreur lors de l'ajout des données:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter des Données de Test</CardTitle>
        <CardDescription>Créez des données de test pour tester la synchronisation avec Supabase</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data-type">Type de données</Label>
            <Select value={dataType} onValueChange={(value) => setDataType(value)}>
              <SelectTrigger id="data-type">
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="radioEquipment">Équipement Radio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleId">ID du véhicule</Label>
            <Input
              id="vehicleId"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleInputChange}
              placeholder="ex: VEH-001"
              required
            />
          </div>

          {(dataType === "inspection" || dataType === "radioEquipment") && (
            <div className="space-y-2">
              <Label htmlFor="agentId">ID de l'agent</Label>
              <Input
                id="agentId"
                name="agentId"
                value={formData.agentId}
                onChange={handleInputChange}
                placeholder="ex: AGENT-001"
                required
              />
            </div>
          )}

          {dataType === "photo" && (
            <div className="space-y-2">
              <Label htmlFor="view">Vue</Label>
              <Select value={formData.view} onValueChange={(value) => handleSelectChange("view", value)}>
                <SelectTrigger id="view">
                  <SelectValue placeholder="Sélectionnez une vue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Avant</SelectItem>
                  <SelectItem value="back">Arrière</SelectItem>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                  <SelectItem value="interior">Intérieur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire</Label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Entrez un commentaire..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ajout en cours...
              </>
            ) : success ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Données ajoutées
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter des données
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
