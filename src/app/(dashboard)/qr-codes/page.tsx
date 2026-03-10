"use client";

import { useState, useRef } from "react";
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
import { Download, Copy, Check } from "lucide-react";
import { MOCK_BUSINESSES } from "@/lib/constants";
import { toast } from "sonner";

// Simple QR Code SVG component
function QRCodeSVG({ size = 200 }: { value?: string; size?: number }) {
  // This is a placeholder QR code pattern
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className="bg-white rounded-lg"
    >
      <rect width="200" height="200" fill="white" />
      {/* QR Code pattern - simplified for demo */}
      <rect x="20" y="20" width="50" height="50" fill="black" />
      <rect x="25" y="25" width="40" height="40" fill="white" />
      <rect x="30" y="30" width="30" height="30" fill="black" />
      
      <rect x="130" y="20" width="50" height="50" fill="black" />
      <rect x="135" y="25" width="40" height="40" fill="white" />
      <rect x="140" y="30" width="30" height="30" fill="black" />
      
      <rect x="20" y="130" width="50" height="50" fill="black" />
      <rect x="25" y="135" width="40" height="40" fill="white" />
      <rect x="30" y="140" width="30" height="30" fill="black" />
      
      {/* Data modules - random pattern for demo */}
      {Array.from({ length: 100 }).map((_, i) => (
        <rect
          key={i}
          x={80 + (i % 10) * 8}
          y={80 + Math.floor(i / 10) * 8}
          width="6"
          height="6"
          fill={Math.random() > 0.5 ? "black" : "white"}
        />
      ))}
    </svg>
  );
}

export default function QRCodesPage() {
  const [selectedBusiness, setSelectedBusiness] = useState(MOCK_BUSINESSES[0].id);
  const [qrStyle, setQrStyle] = useState("classic");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const business = MOCK_BUSINESSES.find((b) => b.id === selectedBusiness);
  const reviewUrl = `https://g.page/${business?.name.toLowerCase().replace(/\s+/g, "-")}/review`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "png" | "svg") => {
    toast.success(`QR Code downloaded as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
        <p className="text-muted-foreground mt-1">
          Generate QR codes to collect more reviews
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configure QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Business</Label>
              <Select
                value={selectedBusiness}
                onValueChange={(v) => setSelectedBusiness(v || MOCK_BUSINESSES[0].id)}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_BUSINESSES.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>QR Code Style</Label>
              <Select
                value={qrStyle}
                onValueChange={(v) => setQrStyle(v || "classic")}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="dots">Dots</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Review Link</Label>
              <div className="flex gap-2">
                <Input value={reviewUrl} readOnly className="rounded-lg" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0 rounded-lg"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Download Options</h4>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => handleDownload("png")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  PNG
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => handleDownload("svg")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  SVG
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-full">
                <TabsTrigger value="qr" className="rounded-full">QR Code</TabsTrigger>
                <TabsTrigger value="card" className="rounded-full">Review Card</TabsTrigger>
              </TabsList>
              <TabsContent value="qr" className="mt-6">
                <div className="flex flex-col items-center">
                  <div
                    ref={qrRef}
                    className="p-8 bg-white rounded-2xl shadow-saas-lg"
                  >
                    <QRCodeSVG value={reviewUrl} size={200} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Scan this code to leave a review for{" "}
                    <span className="font-medium text-foreground">
                      {business?.name}
                    </span>
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="card" className="mt-6">
                <div className="p-8 bg-gradient-to-br from-primary to-trust-blue rounded-2xl text-white text-center">
                  <Badge variant="secondary" className="mb-4">
                    Google Review
                  </Badge>
                  <h3 className="text-2xl font-bold mb-2">{business?.name}</h3>
                  <p className="text-white/80 mb-6">{business?.location}</p>
                  <div className="bg-white p-4 rounded-xl inline-block">
                    <QRCodeSVG value={reviewUrl} size={120} />
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
