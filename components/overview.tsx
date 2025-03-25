"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Lun",
    distance: 580,
    consommation: 240,
  },
  {
    name: "Mar",
    distance: 420,
    consommation: 180,
  },
  {
    name: "Mer",
    distance: 650,
    consommation: 280,
  },
  {
    name: "Jeu",
    distance: 590,
    consommation: 250,
  },
  {
    name: "Ven",
    distance: 720,
    consommation: 300,
  },
  {
    name: "Sam",
    distance: 320,
    consommation: 130,
  },
  {
    name: "Dim",
    distance: 180,
    consommation: 70,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value} km`}
        />
        <Tooltip />
        <Bar dataKey="distance" fill="#adfa1d" radius={[4, 4, 0, 0]} name="Distance (km)" />
        <Bar dataKey="consommation" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Consommation (L)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

