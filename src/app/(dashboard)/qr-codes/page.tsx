"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Download, Copy, Check, QrCode, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
// Use regular img for data URLs and external URLs

interface Business {
  id: string;
  businessName: string;
  businessType: string | null;
  placeId: string | null;
  reviewLink: string | null;
  qrCodeUrl: string | null;
  isConnected: boolean;
}

function QRCodesContent() {
  const searchParams = useSearchParams();
  const businessParam = searchParams.get("business");
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await fetch('/api/business/list');
      if (response.ok) {
        const data = await response.json();
        const businessList = data.businesses || [];
        setBusinesses(businessList);
        
        // Set default selection
        if (businessList.length > 0) {
          if (businessParam && businessList.find((b: Business) => b.id === businessParam)) {
            setSelectedBusiness(businessParam);
          } else {
            setSelectedBusiness(businessList[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  }, [businessParam]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const business = businesses.find((b) => b.id === selectedBusiness);
  const reviewFunnelUrl = business ? `${window.location.origin}/review/${business.id}` : "";

  const handleCopyLink = () => {
    if (reviewFunnelUrl) {
      navigator.clipboard.writeText(reviewFunnelUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedBusiness) return;
    
    setGenerating(true);
    try {
      const response = await fetch('/api/business/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: selectedBusiness }),
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
      setGenerating(false);
    }
  };

  const handleDownload = async (format: "png" | "svg") => {
    if (!business?.qrCodeUrl) {
      toast.error("Please generate a QR code first");
      return;
    }

    try {
      // For Cloudinary URLs, we can download directly
      const link = document.createElement('a');
      link.href = business.qrCodeUrl;
      link.download = `qr-code-${business.businessName.replace(/\s+/g, '-')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`QR Code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading QR:', error);
      toast.error("Failed to download QR code");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <EmptyState
          icon={AlertCircle}
          title="No Business Found"
          description="Please add a business first to generate QR codes"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
        <p className="text-muted-foreground mt-1">
          Generate QR codes to collect more reviews
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Configuration */}
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Configure QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Business</Label>
              <Select
                value={selectedBusiness}
                onValueChange={(v) => v && setSelectedBusiness(v)}
              >
                <SelectTrigger className="rounded-xl h-11 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Select a business" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {business && !business.isConnected && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Please connect your business with a Place ID first to generate QR codes.
                </p>
              </div>
            )}

            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Review Funnel Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={reviewFunnelUrl} 
                  readOnly 
                  className="rounded-xl h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" 
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  disabled={!reviewFunnelUrl}
                  className="shrink-0 rounded-xl h-11 w-11 border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Customers will scan the QR code and land on this page to submit AI-generated reviews.
              </p>
            </div>

            {business?.isConnected && (
              <div className="pt-5 border-t border-gray-100 dark:border-gray-800">
                {!business.qrCodeUrl ? (
                  <Button
                    onClick={handleGenerateQR}
                    disabled={generating}
                    className="w-full rounded-xl h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate QR Code
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Download Options</h4>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl h-11 border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800"
                        onClick={() => handleDownload("png")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PNG
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl h-11 border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800"
                        onClick={() => handleDownload("svg")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        SVG
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleGenerateQR}
                      disabled={generating}
                      className="w-full mt-3 text-gray-500 hover:text-indigo-600"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                      Regenerate QR Code
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                <TabsTrigger value="qr" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">QR Code</TabsTrigger>
                <TabsTrigger value="card" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Review Card</TabsTrigger>
              </TabsList>
              <TabsContent value="qr" className="mt-6">
                <div className="flex flex-col items-center">
                  <div className="p-8 bg-white rounded-2xl shadow-soft-lg border border-gray-100">
                    {business?.qrCodeUrl ? (
                      <img
                        src={business.qrCodeUrl}
                        alt="QR Code"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="text-center text-gray-500 p-4">
                          <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">QR code will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                    Scan this code to leave a review for{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {business?.businessName}
                    </span>
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="card" className="mt-6">
                <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl text-white text-center shadow-lg shadow-indigo-500/25">
                  <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-0">
                    Google Review
                  </Badge>
                  <h3 className="text-2xl font-bold mb-2">{business?.businessName}</h3>
                  {business?.businessType && (
                    <p className="text-white/80 mb-6">{business.businessType.replace(/_/g, " ")}</p>
                  )}
                  <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
                    {business?.qrCodeUrl ? (
                      <img
                        src={business.qrCodeUrl}
                        alt="QR Code"
                        width={120}
                        height={120}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-[120px] h-[120px] flex items-center justify-center bg-gray-100 rounded-lg">
                        <QrCode className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-white/70 mt-4">
                    Scan to leave us a review!
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function QRCodesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>}>
      <QRCodesContent />
    </Suspense>
  );
}
