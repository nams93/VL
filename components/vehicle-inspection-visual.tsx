"\"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export function VehicleInspectionVisual() {
  const [front, setFront] = useState(false)
  const [back, setBack] = useState(false)
  const [left, setLeft] = useState(false)
  const [right, setRight] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspection Visuelle</CardTitle>
        <CardDescription>Vérifiez l'état extérieur du véhicule</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col items-center">
          <img src="/images/car-front.png" alt="Avant du véhicule" className="w-32 h-24 object-contain" />
          <div className="flex items-center space-x-2">
            <Checkbox id="front" checked={front} onCheckedChange={setFront} />
            <label
              htmlFor="front"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Avant
            </label>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <img src="/images/car-back.png" alt="Arrière du véhicule" className="w-32 h-24 object-contain" />
          <div className="flex items-center space-x-2">
            <Checkbox id="back" checked={back} onCheckedChange={setBack} />
            <label
              htmlFor="back"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Arrière
            </label>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <img src="/images/car-left.png" alt="Côté gauche du véhicule" className="w-32 h-24 object-contain" />
          <div className="flex items-center space-x-2">
            <Checkbox id="left" checked={left} onCheckedChange={setLeft} />
            <label
              htmlFor="left"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Gauche
            </label>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <img src="/images/car-right.png" alt="Côté droit du véhicule" className="w-32 h-24 object-contain" />
          <div className="flex items-center space-x-2">
            <Checkbox id="right" checked={right} onCheckedChange={setRight} />
            <label
              htmlFor="right"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Droite
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

