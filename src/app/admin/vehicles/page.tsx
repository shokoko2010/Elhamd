"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, Upload, Image as ImageIcon, Car } from "lucide-react";
import { Vehicle, VehicleCategory } from "@/lib/db";
import { VehicleImageManager } from "./components/vehicle-image-manager";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);

  // Form state for creating/editing vehicles
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    specifications: "{}",
    highlights: "[]",
    features: "[]",
  });

  useEffect(() => {
    fetchVehicles();
    fetchCategories();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/admin/vehicles");
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/vehicle-categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleCreateVehicle = async () => {
    try {
      const response = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          specifications: JSON.parse(formData.specifications),
          highlights: JSON.parse(formData.highlights),
          features: JSON.parse(formData.features),
        }),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          category: "",
          specifications: "{}",
          highlights: "[]",
          features: "[]",
        });
        fetchVehicles();
      }
    } catch (error) {
      console.error("Failed to create vehicle:", error);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const response = await fetch(`/api/admin/vehicles/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchVehicles();
        }
      } catch (error) {
        console.error("Failed to delete vehicle:", error);
      }
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = vehicle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || vehicle.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage your vehicle inventory and specifications</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>
                Create a new vehicle entry with specifications and features
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Vehicle title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Vehicle description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="specifications">Specifications (JSON)</Label>
                <Textarea
                  id="specifications"
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  placeholder='{"engine": "2.0L", "power": "150hp"}'
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="highlights">Highlights (JSON Array)</Label>
                <Textarea
                  id="highlights"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder='[{"label": "Power", "value": "150hp"}]'
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="features">Features (JSON Array)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder='["Feature 1", "Feature 2"]'
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateVehicle}>
                  Create Vehicle
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Inventory</CardTitle>
          <CardDescription>
            Manage your vehicle fleet, specifications, and images
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vehicle.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {vehicle.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getCategoryName(vehicle.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={vehicle.status === "ACTIVE" ? "default" : "secondary"}>
                          {vehicle.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setIsImageManagerOpen(true);
                          }}
                        >
                          <ImageIcon className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </TableCell>
                      <TableCell>
                        {new Date(vehicle.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              // TODO: Implement edit dialog
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredVehicles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vehicles found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedVehicle && (
        <VehicleImageManager
          vehicle={selectedVehicle}
          open={isImageManagerOpen}
          onOpenChange={setIsImageManagerOpen}
          onUpdate={fetchVehicles}
        />
      )}
    </div>
  );
}