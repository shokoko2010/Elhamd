
import {
    Car, Phone, Mail, MapPin, Calendar, Wrench, Star,
    ArrowLeft, ChevronLeft, ChevronRight, Play, Pause,
    AlertCircle, Package, Shield, Award, Users, Clock,
    Zap, Heart, Eye, Grid, List, Home,
    Truck, Settings, Droplet, Facebook, Instagram,
    Linkedin, Twitter, Youtube, MessageCircle
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
    Car, Phone, Mail, MapPin, Calendar, Wrench, Star,
    ArrowLeft, ChevronLeft, ChevronRight, Play, Pause,
    AlertCircle, Package, Shield, Award, Users, Clock,
    Zap, Heart, Eye, Grid, List, Home,
    Truck, Settings, Droplet, Facebook, Instagram,
    Linkedin, Twitter, Youtube, MessageCircle
}

export const resolveServiceIcon = (iconName?: string): LucideIcon => {
    if (!iconName) return Wrench
    const trimmed = iconName.trim()
    if (!trimmed) return Wrench

    // Direct match
    if (ICON_MAP[trimmed]) return ICON_MAP[trimmed]

    // PascalCase match attempt
    const pascalCase = trimmed
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
        .join('')

    if (ICON_MAP[pascalCase]) return ICON_MAP[pascalCase]

    // Fallback
    return Wrench
}
