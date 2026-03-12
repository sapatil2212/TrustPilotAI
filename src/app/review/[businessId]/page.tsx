"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Star, Loader2, Sparkles, Copy, ExternalLink, CheckCircle } from "lucide-react";

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

  useEffect(() => {
    if (businessId) {
      fetchBusinessInfo();
      createFunnelSession();
    }
  }, [businessId]);

  const fetchBusinessInfo = async () => {
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
  };

  const createFunnelSession = async () => {
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
  };

  const handleRatingSelect = async (rating: number) => {
    setSelectedRating(rating);
    
    // Update session with rating
    if (sessionId) {
      await fetch(`/api/review-funnel/${sessionId}`, {
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
  };

  const handleCopyAndRedirect = async () => {
    // Copy review to clipboard
    await navigator.clipboard.writeText(selectedReview);
    setCopied(true);
    toast.success("Review copied to clipboard!");

    // Update session
    if (sessionId) {
      await fetch(`/api/review-funnel/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiReviewGenerated: selectedReview,
          redirectedToGoogle: true,
        }),
      });
    }

    // Show success state briefly before redirect
    setStep("success");
    
    // Redirect to Google review page after a short delay
    setTimeout(() => {
      if (business?.reviewLink) {
        window.open(business.reviewLink, "_blank");
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
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
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Star className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {business.businessName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            We'd love to hear your feedback!
          </p>
        </div>

        {/* Step 1: Rating Selection */}
        {step === "rating" && (
          <Card className="shadow-xl border-0">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-6">
                How would you rate your experience?
              </h2>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onMouseEnter={() => setHoveredRating(rating)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => handleRatingSelect(rating)}
                    className="p-2 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        rating <= (hoveredRating || selectedRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Click a star to continue
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Review Generation */}
        {step === "review" && (
          <Card className="shadow-xl border-0">
            <CardContent className="pt-6 pb-6">
              {/* Rating Display */}
              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`w-6 h-6 ${
                      rating <= selectedRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {generatingReviews ? (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 text-indigo-600 animate-pulse" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Generating personalized review suggestions...
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose a review or write your own:
                  </h3>
                  
                  {/* AI Suggestions */}
                  <div className="space-y-2 mb-4">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSelectSuggestion(suggestion.text)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedReview === suggestion.text
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                        }`}
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {suggestion.text}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Custom Review */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Or write your own:
                    </label>
                    <Textarea
                      value={selectedReview}
                      onChange={(e) => setSelectedReview(e.target.value)}
                      placeholder="Share your experience..."
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleCopyAndRedirect}
                    disabled={!selectedReview.trim()}
                    className="w-full mt-4 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy & Post on Google
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>

                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                    Your review will be copied. Paste it on the Google review page.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <Card className="shadow-xl border-0">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Review Copied!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Redirecting you to Google Reviews...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
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
