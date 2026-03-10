"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/star-rating";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Building2, Plus, Search, MapPin, ExternalLink, QrCode } from "lucide-react";
import { MOCK_BUSINESSES } from "@/lib/constants";
import { Business } from "@/types";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBusiness, setNewBusiness] = useState({ name: "", location: "" });

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBusiness = () => {
    if (newBusiness.name && newBusiness.location) {
      const business: Business = {
        id: Date.now().toString(),
        name: newBusiness.name,
        location: newBusiness.location,
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
      };
      setBusinesses([...businesses, business]);
      setNewBusiness({ name: "", location: "" });
      setIsAddDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Businesses</h1>
          <p className="text-muted-foreground mt-1">
            Manage your business locations and Google profiles
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger>
            <Button className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              Add Business
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Business</DialogTitle>
              <DialogDescription>
                Connect a new business location to manage its reviews
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Downtown Cafe"
                  value={newBusiness.name}
                  onChange={(e) =>
                    setNewBusiness({ ...newBusiness, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., 123 Main St, New York, NY"
                  value={newBusiness.location}
                  onChange={(e) =>
                    setNewBusiness({ ...newBusiness, location: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBusiness}>Add Business</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search businesses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-lg max-w-md"
        />
      </div>

      {filteredBusinesses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No businesses found"
          description="Add your first business to start managing reviews"
          actionLabel="Add Business"
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBusinesses.map((business) => (
            <Card key={business.id} className="group hover:shadow-saas-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {business.location}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <StarRating rating={business.rating} size="sm" />
                    <span className="font-medium">{business.rating}</span>
                  </div>
                  <Badge variant="secondary">{business.totalReviews} reviews</Badge>
                </div>
                <div className="flex gap-2">
                  <Link href={`/reviews?business=${business.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-full">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Reviews
                    </Button>
                  </Link>
                  <Link href={`/qr-codes?business=${business.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-full">
                      <QrCode className="w-4 h-4 mr-1" />
                      QR Code
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
