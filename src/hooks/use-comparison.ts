'use client'

import { useState, useEffect } from 'react'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  category: string
  fuelType: string
  transmission: string
  mileage?: number
  color?: string
  description?: string
  status: string
  images: { imageUrl: string; isPrimary: boolean }[]
  engine?: string
  horsepower?: number
  acceleration?: number
  topSpeed?: number
  fuelEfficiency?: number
  seats?: number
  doors?: number
  features?: string[]
}

export function useComparison() {
  const [comparisonVehicles, setComparisonVehicles] = useState<Vehicle[]>([])

  // Load comparison vehicles from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vehicle-comparison')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setComparisonVehicles(parsed)
        }
      } catch (error) {
        console.error('Error loading comparison vehicles from localStorage:', error)
      }
    }
  }, [])

  // Save comparison vehicles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vehicle-comparison', JSON.stringify(comparisonVehicles))
  }, [comparisonVehicles])

  const addToComparison = (vehicle: Vehicle) => {
    if (comparisonVehicles.length >= 4) {
      throw new Error('يمكنك مقارنة حتى 4 سيارات كحد أقصى')
    }
    
    if (!comparisonVehicles.find(v => v.id === vehicle.id)) {
      setComparisonVehicles(prev => [...prev, vehicle])
    }
  }

  const removeFromComparison = (vehicleId: string) => {
    setComparisonVehicles(prev => prev.filter(v => v.id !== vehicleId))
  }

  const clearComparison = () => {
    setComparisonVehicles([])
  }

  const isInComparison = (vehicleId: string) => {
    return comparisonVehicles.some(v => v.id === vehicleId)
  }

  const getComparisonCount = () => {
    return comparisonVehicles.length
  }

  const canAddToComparison = () => {
    return comparisonVehicles.length < 4
  }

  return {
    comparisonVehicles,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    getComparisonCount,
    canAddToComparison
  }
}