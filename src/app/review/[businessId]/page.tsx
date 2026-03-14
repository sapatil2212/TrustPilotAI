"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Star, Loader2, Sparkles, Copy, ExternalLink, CheckCircle, ArrowRight, Building2, ThumbsUp, Edit3, Clipboard, MousePointer } from "lucide-react";

interface BusinessInfo {
  id: string;
  businessName: string;
  businessType: string;
  reviewLink: string;
}

interface ReviewSuggestion {
  id: number;
  text: string;
}

export default function ReviewFunnelPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"rating" | "review" | "success">("rating");
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[]>([]);
  const [selectedReview, setSelectedReview] = useState("");
  const [generatingReviews, setGeneratingReviews] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  const fetchBusinessInfo = useCallback(async () => {
    try {
      const response = await fetch(`/api/review-funnel/${businessId}/info`);
      if (response.ok) {
        const data = await response.json();
        setBusiness(data.business);
      } else {
        toast.error("Business not found");
      }
    } catch (error) {
      console.error("Error fetching business:", error);
      toast.error("Failed to load business info");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const createFunnelSession = useCallback(async () => {
    try {
      const response = await fetch("/api/review-funnel/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session.id);
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchBusinessInfo();
      createFunnelSession();
    }
  }, [businessId, fetchBusinessInfo, createFunnelSession]);

  const handleRatingSelect = async (rating: number) => {
    setSelectedRating(rating);
    
    // Update session with rating
    if (sessionId) {
      fetch(`/api/review-funnel/session/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratingSelected: rating }),
      });
    }

    // Generate AI review suggestions
    setGeneratingReviews(true);
    setStep("review");
    
    try {
      const response = await fetch("/api/ai/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: business?.businessName,
          serviceType: business?.businessType?.replace(/_/g, " ").toLowerCase(),
          rating,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(
          data.reviews.map((text: string, index: number) => ({
            id: index + 1,
            text,
          }))
        );
        // Auto-select the first suggestion
        if (data.reviews.length > 0) {
          setSelectedReview(data.reviews[0]);
        }
      } else {
        toast.error("Failed to generate review suggestions");
      }
    } catch (error) {
      console.error("Error generating reviews:", error);
      toast.error("Failed to generate reviews");
    } finally {
      setGeneratingReviews(false);
    }
  };

  const handleSelectSuggestion = (text: string) => {
    setSelectedReview(text);
    setIsCustom(false);
  };

  const handleCustomEdit = () => {
    setIsCustom(true);
  };

  const handlePostReview = async () => {
    // Copy review to clipboard
    try {
      await navigator.clipboard.writeText(selectedReview);
      setCopied(true);
      toast.success("Review copied! Opening Google Reviews...", {
        duration: 5000,
      });

      // Update session
      if (sessionId) {
        fetch(`/api/review-funnel/session/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aiReviewGenerated: selectedReview,
            redirectedToGoogle: true,
          }),
        });
      }

      // Show success state with instructions
      setStep("success");
      
      // Open Google review page in a new tab immediately
      if (business?.reviewLink) {
        // Small delay to show success state
        setTimeout(() => {
          window.open(business.reviewLink, "_blank");
        }, 1500);
      }
    } catch (error) {
      console.error("Clipboard error:", error);
      // Show manual copy fallback
      toast.error("Could not copy automatically. Please copy the review manually.");
      setStep("success");
    }
  };

  const getRatingLabel = (rating: number) => {
    const labels = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Great",
      5: "Excellent",
    };
    return labels[rating as keyof typeof labels] || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-ping opacity-20" />
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-600"
                style={{
                  animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
                }}
              />
            ))}
          </div>
          <p className="text-gray-500">Loading...</p>
        </div>
        <style jsx>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Business Not Found
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              This review link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30">
            <Star className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {business.businessName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            We&apos;d love to hear your feedback!
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            step === "rating" ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"
          }`}>
            {step !== "rating" ? <CheckCircle className="w-5 h-5" /> : "1"}
          </div>
          <div className={`w-16 h-1 rounded transition-all ${step !== "rating" ? "bg-indigo-600" : "bg-gray-200"}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            step === "review" ? "bg-indigo-600 text-white" : step === "success" ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-500"
          }`}>
            {step === "success" ? <CheckCircle className="w-5 h-5" /> : "2"}
          </div>
          <div className={`w-16 h-1 rounded transition-all ${step === "success" ? "bg-indigo-600" : "bg-gray-200"}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            step === "success" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
          }`}>
            {step === "success" ? <CheckCircle className="w-5 h-5" /> : "3"}
          </div>
        </div>

        {/* Step 1: Rating Selection */}
        {step === "rating" && (
          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white text-center">
              <h2 className="text-lg font-semibold">Rate Your Experience</h2>
              <p className="text-sm text-white/80">Tap a star to get started</p>
            </div>
            <CardContent className="pt-8 pb-8">
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onMouseEnter={() => setHoveredRating(rating)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => handleRatingSelect(rating)}
                    className="p-2 transition-all hover:scale-125 active:scale-95"
                  >
                    <Star
                      className={`w-12 h-12 transition-all drop-shadow-lg ${
                        rating <= (hoveredRating || selectedRating)
                          ? "text-yellow-400 fill-yellow-400 scale-110"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {hoveredRating > 0 && (
                <p className="text-center text-lg font-semibold text-indigo-600 animate-fade-in">
                  {getRatingLabel(hoveredRating)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Review Generation */}
        {step === "review" && (
          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Your Review</h2>
                  <p className="text-sm text-white/80">AI-generated for you</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`w-5 h-5 ${
                        rating <= selectedRating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <CardContent className="pt-6 pb-6">
              {generatingReviews ? (
                <div className="text-center py-12">
                  <div className="relative inline-block">
                    <Sparkles className="w-12 h-12 text-indigo-600 animate-pulse" />
                    <div className="absolute -inset-2 bg-indigo-600/20 rounded-full animate-ping" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4 font-medium">
                    Creating personalized reviews...
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Our AI is crafting the perfect review for you
                  </p>
                </div>
              ) : (
                <>
                  {/* AI Suggestions */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Choose a review:
                      </p>
                      <button
                        onClick={handleCustomEdit}
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Write custom
                      </button>
                    </div>
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSelectSuggestion(suggestion.text)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedReview === suggestion.text && !isCustom
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                            : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            selectedReview === suggestion.text && !isCustom
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                          }`}>
                            {selectedReview === suggestion.text && !isCustom ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <span className="text-xs">{suggestion.id}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {suggestion.text}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Review */}
                  {isCustom && (
                    <div className="space-y-2 mb-6 animate-fade-in">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Your custom review:
                      </label>
                      <Textarea
                        value={selectedReview}
                        onChange={(e) => setSelectedReview(e.target.value)}
                        placeholder="Write your own review..."
                        className="min-h-[120px] rounded-xl border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {/* Post Button */}
                  <Button
                    onClick={handlePostReview}
                    disabled={!selectedReview.trim()}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    Post Review on Google
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    Your review will be copied to clipboard and Google will open
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Review Copied!</h2>
              <p className="text-white/90 mt-1">Opening Google Reviews...</p>
            </div>
            <CardContent className="pt-6 pb-6">
              {/* Instructions */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3 text-center">
                  Final Step: Paste Your Review
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                    <span className="text-gray-700 dark:text-gray-300">Google Reviews page will open</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-gray-700 dark:text-gray-300">Click the review text box</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                    <div className="text-gray-700 dark:text-gray-300">
                      <span>Press </span>
                      <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+V</kbd>
                      <span> or </span>
                      <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Cmd+V</kbd>
                      <span> to paste</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">4</div>
                    <span className="text-gray-700 dark:text-gray-300">Select stars and submit!</span>
                  </div>
                </div>
              </div>

              {/* Copied review preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4 text-sm text-gray-600 dark:text-gray-400 max-h-24 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400 font-medium">
                  <Clipboard className="w-4 h-4" />
                  <span>Copied to clipboard:</span>
                </div>
                <p className="italic">"{selectedReview.slice(0, 100)}{selectedReview.length > 100 ? '...' : ''}"</p>
              </div>

              {/* Copy again button */}
              <Button
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(selectedReview);
                  toast.success("Review copied again!");
                }}
                className="w-full mb-3 rounded-xl"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Review Again
              </Button>
              
              {/* Manual link */}
              <Button
                onClick={() => business?.reviewLink && window.open(business.reviewLink, '_blank')}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Google Reviews
              </Button>

              <p className="text-xs text-center text-gray-400 mt-4">
                For security reasons, browsers don't allow auto-paste. Please paste manually.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Powered by TrustPilotAI
        </p>
      </div>
    </div>
  );
}
