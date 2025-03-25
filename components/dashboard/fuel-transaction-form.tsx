"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

// Types
type Vehicle = {
  id: string
  immatriculation: string
  cardNumber: string
  currentKilometers?: number
}

type FuelTransactionFormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  vehicles: Vehicle[]
}

export function FuelTransactionForm({ isOpen, onClose, onSubmit, vehicles }: FuelTransactionFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [cardNumber, setCardNumber] = useState<string>("")
  const [station, setStation] = useState<string>("")
  const [fuelAmount, setFuelAmount] = useState<string>("")
  const [pricePerLiter, setPricePerLiter] = useState<string>("1.72")
  const [totalCost, setTotalCost] = useState<string>("")
  const [kilometers, setKilometers] = useState<string>("")
  const [driver, setDriver] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Vérifier les anomalies potentielles
  const checkForAnomalies = () => {
    const anomalies = []

    // Vérifier si le prix par litre est anormalement élevé ou bas
    const pricePerLiterNum = Number.parseFloat(pricePerLiter)
    if (pricePerLiterNum > 2.5) {
      anomalies.push("Le prix par litre semble anormalement élevé.")
    } else if (pricePerLiterNum < 1.2) {
      anomalies.push("Le prix par litre semble anormalement bas.")
    }

    // Vérifier si la quantité de carburant est anormalement élevée
    const fuelAmountNum = Number.parseFloat(fuelAmount)
    if (fuelAmountNum > 100) {
      anomalies.push("La quantité de carburant semble anormalement élevée.")
    }

    // Vérifier le kilométrage par rapport au dernier enregistrement
    if (selectedVehicle) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicle)
      if (vehicle && vehicle.currentKilometers) {
        const kmNum = Number.parseInt(kilometers)
        if (kmNum < vehicle.currentKilometers) {
          anomalies.push("Le kilométrage est inférieur au dernier enregistrement.")
        } else if (kmNum > vehicle.currentKilometers + 2000) {
          anomalies.push("L'augmentation du kilométrage semble anormalement élevée.")
        }
      }
    }

    return anomalies
  }

  // Mettre à jour le coût total lorsque la quantité ou le prix change
  useEffect(() => {
    if (fuelAmount && pricePerLiter) {
      const amount = Number.parseFloat(fuelAmount)
      const price = Number.parseFloat(pricePerLiter)
      if (!isNaN(amount) && !isNaN(price)) {
        setTotalCost((amount * price).toFixed(2))
      } else {
        setTotalCost("")
      }
    } else {
      setTotalCost("")
    }
  }, [fuelAmount, pricePerLiter])

  // Mettre à jour le numéro de carte lorsque le véhicule change
  useEffect(() => {
    if (selectedVehicle) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicle)
      if (vehicle) {
        setCardNumber(vehicle.cardNumber)
        if (vehicle.currentKilometers && !kilometers) {
          setKilometers(vehicle.currentKilometers.toString())
        }
      }
    } else {
      setCardNumber("")
    }
  }, [selectedVehicle, vehicles, kilometers])

  // Réinitialiser le formulaire
  const resetForm = () => {
    setDate(new Date())
    setSelectedVehicle("")
    setCardNumber("")
    setStation("")
    setFuelAmount("")
    setPricePerLiter("1.72")
    setTotalCost("")
    setKilometers("")
    setDriver("")
    setNotes("")
  }

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Vérifier que tous les champs obligatoires sont remplis
    if (!selectedVehicle || !date || !fuelAmount || !pricePerLiter || !kilometers) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    // Vérifier les anomalies potentielles
    const anomalies = checkForAnomalies()
    if (anomalies.length > 0) {
      const proceed = window.confirm(
        `Attention, des anomalies ont été détectées:\n\n${anomalies.join("\n")}\n\nVoulez-vous continuer quand même?`,
      )
      if (!proceed) return
    }

    // Créer l'objet de transaction
    const vehicle = vehicles.find((v) => v.id === selectedVehicle)
    const transaction = {
      id: `TX-${new Date().getTime().toString().slice(-6)}`,
      vehicleId: selectedVehicle,
      immatriculation: vehicle?.immatriculation || "",
      cardNumber,
      date: format(date, "dd/MM/yyyy"),
      amount: Number.parseFloat(fuelAmount),
      pricePerLiter: Number.parseFloat(pricePerLiter),
      cost: Number.parseFloat(totalCost),
      location: station,
      kilometerReading: Number.parseInt(kilometers),
      driver,
      notes,
      status: "en attente",
      timestamp: new Date().toISOString(),
    }

    // Soumettre la transaction
    onSubmit(transaction)
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle transaction de carburant</DialogTitle>
          <DialogDescription>
            Enregistrez une nouvelle transaction de carte essence. Les champs marqués d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Véhicule *</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle} required>
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Sélectionner un véhicule" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.immatriculation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      date && setDate(date)
                      setCalendarOpen(false)
                    }}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Numéro de carte</Label>
              <Input
                id="card-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Numéro de carte essence"
                disabled={!!selectedVehicle}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="station">Station-service *</Label>
              <Input
                id="station"
                value={station}
                onChange={(e) => setStation(e.target.value)}
                placeholder="Nom et lieu de la station"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuel-amount">Quantité (L) *</Label>
              <Input
                id="fuel-amount"
                type="number"
                step="0.01"
                min="0"
                value={fuelAmount}
                onChange={(e) => setFuelAmount(e.target.value)}
                placeholder="Ex: 45.5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price-per-liter">Prix par litre (€) *</Label>
              <Input
                id="price-per-liter"
                type="number"
                step="0.001"
                min="0"
                value={pricePerLiter}
                onChange={(e) => setPricePerLiter(e.target.value)}
                placeholder="Ex: 1.72"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total-cost">Coût total (€)</Label>
              <Input
                id="total-cost"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder="Calculé automatiquement"
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kilometers">Kilométrage actuel *</Label>
              <Input
                id="kilometers"
                type="number"
                min="0"
                value={kilometers}
                onChange={(e) => setKilometers(e.target.value)}
                placeholder="Ex: 12500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver">Conducteur</Label>
              <Input
                id="driver"
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                placeholder="Nom du conducteur"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Observations</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires..."
              className="min-h-[80px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer la transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

