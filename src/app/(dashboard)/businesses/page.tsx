"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/star-rating";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
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
import { Building2, Plus, Search, ExternalLink, QrCode, LinkIcon, CheckCircle, AlertCircle, RefreshCw, Trash2, MoreVertical, Unplug, Chrome, MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Business {
  id: string;
  businessName: string;
  businessType: string | null;
  placeId: string | null;
  reviewLink: string | null;
  qrCodeUrl: string | null;
  isConnected: boolean;
  totalReviews: number;
  averageRating: number;
  createdAt: string;
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBusiness, setNewBusiness] = useState({ businessName: "", placeId: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<"placeId" | "google">("google");
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [syncingBusiness, setSyncingBusiness] = useState<string | null>(null);
  const [deletingBusiness, setDeletingBusiness] = useState<string | null>(null);
  const [disconnectingBusiness, setDisconnectingBusiness] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    try {
      // Use cache-busting for fresh data
      const response = await fetch('/api/business/list', {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses || []);
      } else {
        // If list endpoint doesn't exist, try profile endpoint
        const profileResponse = await fetch('/api/business/profile', {
          cache: "no-store",
        });
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          if (data.business) {
            setBusinesses([data.business]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleAddBusiness = async () => {
    if (!newBusiness.businessName.trim() || !newBusiness.placeId.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch('/api/business/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: newBusiness.businessName.trim(),
          placeId: newBusiness.placeId.trim(),
        }),
      });

      if (response.ok) {
        toast.success("Business added successfully!");
        setNewBusiness({ businessName: "", placeId: "" });
        setIsAddDialogOpen(false);
        fetchBusinesses();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to add business");
      }
    } catch (error) {
      console.error('Error adding business:', error);
      toast.error("Failed to add business");
    } finally {
      setIsAdding(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      // Open Google OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        '/api/auth/google-business',
        'google-business-auth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      // Listen for message from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_BUSINESS_CONNECTED') {
          toast.success('Google Business connected successfully!');
          setIsAddDialogOpen(false);
          fetchBusinesses();
          popup?.close();
        } else if (event.data.type === 'GOOGLE_BUSINESS_ERROR') {
          toast.error(event.data.error || 'Failed to connect Google Business');
        }
        
        window.removeEventListener('message', handleMessage);
        setIsConnectingGoogle(false);
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed without completing
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsConnectingGoogle(false);
        }
      }, 500);

    } catch (error) {
      console.error('Error connecting Google:', error);
      toast.error('Failed to connect Google Business');
      setIsConnectingGoogle(false);
    }
  };

  const handleGenerateQR = async (businessId: string) => {
    setGeneratingQR(businessId);
    try {
      const response = await fetch('/api/business/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      if (response.ok) {
        toast.success("QR code generated successfully!");
        fetchBusinesses();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to generate QR code");
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      toast.error("Failed to generate QR code");
    } finally {
      setGeneratingQR(null);
    }
  };

  const handleSyncReviews = async (businessId: string, businessName: string) => {
    setSyncingBusiness(businessId);
    try {
      const response = await fetch(`/api/business/${businessId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Synced ${data.newReviews || 0} new reviews for ${businessName}`);
        fetchBusinesses();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to sync reviews");
      }
    } catch (error) {
      console.error('Error syncing reviews:', error);
      toast.error("Failed to sync reviews");
    } finally {
      setSyncingBusiness(null);
    }
  };

  const handleDisconnectBusiness = async (businessId: string, businessName: string) => {
    if (!confirm(`Are you sure you want to disconnect "${businessName}" from Google? The business will remain but won't sync reviews.`)) {
      return;
    }

    setDisconnectingBusiness(businessId);
    try {
      const response = await fetch(`/api/business/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isConnected: false }),
      });

      if (response.ok) {
        toast.success(`"${businessName}" disconnected successfully`);
        fetchBusinesses();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to disconnect business");
      }
    } catch (error) {
      console.error('Error disconnecting business:', error);
      toast.error("Failed to disconnect business");
    } finally {
      setDisconnectingBusiness(null);
    }
  };

  const handleDeleteBusiness = async (businessId: string, businessName: string, isConnected: boolean, totalReviews: number) => {
    const warningMessage = isConnected && totalReviews > 0
      ? `Are you sure you want to delete "${businessName}"?

This will permanently delete:
• The business profile
• ${totalReviews} review(s)
• All analytics data
• QR codes and review links

This action cannot be undone.`
      : `Are you sure you want to delete "${businessName}"? This action cannot be undone.`;

    if (!confirm(warningMessage)) {
      return;
    }

    setDeletingBusiness(businessId);
    try {
      const response = await fetch(`/api/business/${businessId}`, {
        method: 'DELETE',
        cache: 'no-store',
      });

      if (response.ok) {
        toast.success(`"${businessName}" deleted successfully`);
        // Remove the deleted business from the local state immediately
        setBusinesses(prev => prev.filter(b => b.id !== businessId));
        // Then refresh the list from server
        fetchBusinesses();
      } else {
        const data = await response.json();
        console.error('Delete business error:', data);
        toast.error(data.error || data.details || "Failed to delete business");
      }
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error("Failed to delete business. Please try again.");
    } finally {
      setDeletingBusiness(null);
    }
  };

  const filteredBusinesses = businesses.filter((b) =>
    b.businessName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Businesses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Manage your business locations and Google profiles
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 h-11">
                <Plus className="w-4 h-4" />
                Add Business
              </Button>
            }
          />
          <DialogContent className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-gray-800 sm:max-w-lg">
            <DialogHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Add New Business
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400 pt-2">
                Connect your Google Business Profile to start managing reviews
              </DialogDescription>
            </DialogHeader>
            
            {/* Connection Method Toggle */}
            <div className="grid grid-cols-2 gap-3 py-4">
              <button
                onClick={() => setConnectionMethod("google")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  connectionMethod === "google"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  connectionMethod === "google"
                    ? "bg-indigo-100 dark:bg-indigo-900/40"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}>
                  <Chrome className={`w-6 h-6 ${
                    connectionMethod === "google"
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500"
                  }`} />
                </div>
                <div className="text-center">
                  <p className={`font-medium text-sm ${
                    connectionMethod === "google"
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}>Google Account</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">One-click connect</p>
                </div>
                {connectionMethod === "google" && (
                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-0 text-xs">
                    Recommended
                  </Badge>
                )}
              </button>
              
              <button
                onClick={() => setConnectionMethod("placeId")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  connectionMethod === "placeId"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  connectionMethod === "placeId"
                    ? "bg-indigo-100 dark:bg-indigo-900/40"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}>
                  <MapPin className={`w-6 h-6 ${
                    connectionMethod === "placeId"
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500"
                  }`} />
                </div>
                <div className="text-center">
                  <p className={`font-medium text-sm ${
                    connectionMethod === "placeId"
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}>Place ID</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Manual entry</p>
                </div>
              </button>
            </div>

            {/* Google OAuth Connection */}
            {connectionMethod === "google" && (
              <div className="space-y-4 py-4">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Connect with Google</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Sign in with your Google account to automatically import your business profile and reviews.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Auto-fetch all existing reviews</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Generate QR code automatically</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI-powered reply suggestions</span>
                  </div>
                </div>

                <Button
                  onClick={handleConnectGoogle}
                  disabled={isConnectingGoogle}
                  className="w-full h-12 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium shadow-sm transition-all"
                >
                  {isConnectingGoogle ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Place ID Connection */}
            {connectionMethod === "placeId" && (
              <div className="space-y-5 py-4">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Downtown Cafe"
                    value={newBusiness.businessName}
                    onChange={(e) =>
                      setNewBusiness({ ...newBusiness, businessName: e.target.value })
                    }
                    className="h-11 rounded-xl border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="placeId" className="text-sm font-medium text-gray-700 dark:text-gray-300">Google Place ID</Label>
                  <Input
                    id="placeId"
                    placeholder="ChIJ..."
                    value={newBusiness.placeId}
                    onChange={(e) =>
                      setNewBusiness({ ...newBusiness, placeId: e.target.value })
                    }
                    className="h-11 rounded-xl border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500">
                    Find your Place ID at{" "}
                    <a
                      href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      Google&apos;s Place ID Finder
                    </a>
                  </p>
                </div>
                <Button
                  onClick={handleAddBusiness}
                  disabled={isAdding || !newBusiness.businessName.trim() || !newBusiness.placeId.trim()}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 font-medium"
                >
                  {isAdding ? "Connecting..." : "Connect Business"}
                </Button>
              </div>
            )}
            
            <DialogFooter className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="ghost"
                onClick={() => setIsAddDialogOpen(false)}
                className="w-full h-10 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search businesses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-xl max-w-md h-11 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
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
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBusinesses.map((business) => (
            <Card key={business.id} className="group border-0 shadow-soft bg-white dark:bg-[#1a1a1f] hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="pb-3 relative">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {business.businessName}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {business.isConnected ? (
                        <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                      {business.businessType && (
                        <Badge variant="secondary" className="text-xs border-0">
                          {business.businessType.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {business.isConnected && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleSyncReviews(business.id, business.businessName)}
                              disabled={syncingBusiness === business.id}
                              className="cursor-pointer"
                            >
                              <RefreshCw className={`w-4 h-4 mr-2 ${syncingBusiness === business.id ? 'animate-spin' : ''}`} />
                              {syncingBusiness === business.id ? 'Syncing...' : 'Sync Reviews'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDisconnectBusiness(business.id, business.businessName)}
                              disabled={disconnectingBusiness === business.id}
                              className="cursor-pointer text-amber-600 dark:text-amber-400"
                            >
                              <Unplug className="w-4 h-4 mr-2" />
                              {disconnectingBusiness === business.id ? 'Disconnecting...' : 'Disconnect'}
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteBusiness(business.id, business.businessName, business.isConnected, business.totalReviews)}
                          disabled={deletingBusiness === business.id}
                          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingBusiness === business.id ? 'Deleting...' : 'Delete Business'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <StarRating rating={business.averageRating || 0} size="sm" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {(business.averageRating || 0).toFixed(1)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-0">
                    {business.totalReviews || 0} reviews
                  </Badge>
                </div>

                {business.placeId && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    <LinkIcon className="w-3 h-3 inline mr-1" />
                    Place ID: {business.placeId}
                  </p>
                )}

                <div className="flex gap-2">
                  <Link href={`/reviews?business=${business.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-lg border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      Reviews
                    </Button>
                  </Link>
                  {business.isConnected ? (
                    business.qrCodeUrl ? (
                      <Link href={`/qr-codes?business=${business.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full rounded-lg border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                          <QrCode className="w-4 h-4 mr-1.5" />
                          QR Code
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg border-gray-200 dark:border-gray-700"
                        onClick={() => handleGenerateQR(business.id)}
                        disabled={generatingQR === business.id}
                      >
                        <QrCode className="w-4 h-4 mr-1.5" />
                        {generatingQR === business.id ? "Generating..." : "Generate QR"}
                      </Button>
                    )
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1 rounded-lg" disabled>
                      <QrCode className="w-4 h-4 mr-1.5" />
                      Connect First
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
