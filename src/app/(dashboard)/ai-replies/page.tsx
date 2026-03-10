"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Copy, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

const TONES = [
  { value: "professional", label: "Professional", description: "Formal and business-like" },
  { value: "friendly", label: "Friendly", description: "Warm and approachable" },
  { value: "short", label: "Short", description: "Brief and to the point" },
  { value: "detailed", label: "Detailed", description: "Comprehensive response" },
];

export default function AIRepliesPage() {
  const [review, setReview] = useState("");
  const [tone, setTone] = useState("professional");
  const [generatedReply, setGeneratedReply] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReply = async () => {
    if (!review.trim()) {
      toast.error("Please enter a review first");
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const replies: Record<string, string> = {
      professional: "Thank you for taking the time to share your feedback. We truly appreciate your business and are committed to providing exceptional service. Your comments help us improve.",
      friendly: "Thanks so much for your review! We're so happy you had a great experience with us. Hope to see you again soon!",
      short: "Thank you for your feedback! We appreciate your support.",
      detailed: "Thank you for your detailed review. We're delighted to hear about your positive experience with our team. We strive to provide excellent service to all our customers, and your feedback confirms we're on the right track. We look forward to serving you again.",
    };
    
    setGeneratedReply(replies[tone]);
    setIsGenerating(false);
    toast.success("AI reply generated!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    toast.success("Reply copied to clipboard");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Replies</h1>
        <p className="text-muted-foreground mt-1">
          Generate professional replies to customer reviews using AI
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Original Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste the customer review here..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="min-h-[200px] resize-none rounded-lg"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Reply Tone</label>
              <Select value={tone} onValueChange={(v) => setTone(v || "professional")}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <div className="font-medium">{t.label}</div>
                        <div className="text-xs text-muted-foreground">{t.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={generateReply}
              disabled={isGenerating || !review.trim()}
              className="w-full rounded-full gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Reply
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>AI Generated Reply</CardTitle>
            {generatedReply && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy} className="rounded-full">
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedReply ? (
              <>
                <div className="p-4 bg-muted rounded-lg min-h-[200px]">
                  <p className="text-foreground leading-relaxed">{generatedReply}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full gap-1">
                      <ThumbsDown className="w-4 h-4" />
                      Not helpful
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateReply}
                    disabled={isGenerating}
                    className="rounded-full gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
                <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                <p>Enter a review and click Generate to see AI reply</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Better AI Replies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: "Be Specific", desc: "Include specific details from the review in your response" },
              { title: "Stay Professional", desc: "Maintain a courteous tone even with negative reviews" },
              { title: "Thank Customers", desc: "Always thank customers for taking time to leave feedback" },
              { title: "Take Action", desc: "Mention any steps you're taking to address concerns" },
            ].map((tip) => (
              <div key={tip.title} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-medium">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
