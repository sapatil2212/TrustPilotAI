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
    
    try {
      const response = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewText: review,
          tone: tone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedReply(data.reply || data.aiReplySuggestion || '');
        toast.success("AI reply generated!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to generate reply");
        // Fallback to local generation
        const replies: Record<string, string> = {
          professional: "Thank you for taking the time to share your feedback. We truly appreciate your business and are committed to providing exceptional service.",
          friendly: "Thanks so much for your review! We're so happy you had a great experience with us. Hope to see you again soon!",
          short: "Thank you for your feedback! We appreciate your support.",
          detailed: "Thank you for your detailed review. We're delighted to hear about your positive experience. We strive to provide excellent service to all our customers.",
        };
        setGeneratedReply(replies[tone]);
      }
    } catch (error) {
      console.error('Error generating reply:', error);
      toast.error("Failed to generate reply");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    toast.success("Reply copied to clipboard");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">AI Replies</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
          Generate professional replies to customer reviews using AI
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Original Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste the customer review here..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="min-h-[180px] sm:min-h-[200px] resize-none rounded-xl border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reply Tone</label>
              <Select value={tone} onValueChange={(v) => setTone(v || "professional")}>
                <SelectTrigger className="rounded-xl h-11 border-gray-200 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <div className="font-medium">{t.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={generateReply}
              disabled={isGenerating || !review.trim()}
              className="w-full rounded-xl gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 h-11"
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
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">AI Generated Reply</CardTitle>
            {generatedReply && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy} className="rounded-lg text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copy
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedReply ? (
              <>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 min-h-[180px] sm:min-h-[200px]">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{generatedReply}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg gap-1.5 flex-1 sm:flex-none border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-800">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg gap-1.5 flex-1 sm:flex-none border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800">
                      <ThumbsDown className="w-4 h-4" />
                      Not helpful
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateReply}
                    disabled={isGenerating}
                    className="rounded-lg gap-1.5 border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[180px] sm:min-h-[200px] text-gray-400 dark:text-gray-500">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-indigo-500/50" />
                </div>
                <p className="text-sm">Enter a review and click Generate to see AI reply</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Tips for Better AI Replies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Be Specific", desc: "Include specific details from the review in your response" },
              { title: "Stay Professional", desc: "Maintain a courteous tone even with negative reviews" },
              { title: "Thank Customers", desc: "Always thank customers for taking time to leave feedback" },
              { title: "Take Action", desc: "Mention any steps you're taking to address concerns" },
            ].map((tip) => (
              <div key={tip.title} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{tip.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
