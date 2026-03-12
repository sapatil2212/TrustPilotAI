"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/shared/star-rating";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MessageSquare, Search, Sparkles, Reply, CheckCircle, RefreshCw, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  rating: number;
  reviewText: string | null;
  reviewDate: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  aiReplySuggestion: string | null;
  isReplied: boolean;
  createdAt: string;
}

interface BusinessData {
  id: string;
  businessName: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [aiReply, setAiReply] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      // First get the business profile
      const profileRes = await fetch('/api/business/profile');
      if (!profileRes.ok) {
        setLoading(false);
        return;
      }
      const profileData = await profileRes.json();
      
      if (!profileData.business?.id) {
        setLoading(false);
        return;
      }

      setBusiness({
        id: profileData.business.id,
        businessName: profileData.business.businessName,
      });

      // Then fetch reviews
      const res = await fetch(`/api/reviews/business/${profileData.business.id}?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const syncReviews = async () => {
    if (!business?.id) return;
    
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/reviews/sync?businessId=${business.id}`, {
        method: 'POST',
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success(`Synced ${data.newReviews || 0} new reviews`);
        fetchReviews();
      } else {
        toast.error('Failed to sync reviews');
      }
    } catch (error) {
      console.error('Error syncing reviews:', error);
      toast.error('Failed to sync reviews');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.reviewText?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesRating =
      ratingFilter === "all" || review.rating.toString() === ratingFilter;
    const matchesSentiment =
      sentimentFilter === "all" || review.sentiment === sentimentFilter;
    return matchesSearch && matchesRating && matchesSentiment;
  });

  const generateAIReply = async (review: Review) => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate: !review.aiReplySuggestion }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setAiReply(data.aiReplySuggestion || '');
        
        // Update the review in state
        setReviews(prev => prev.map(r => 
          r.id === review.id 
            ? { ...r, aiReplySuggestion: data.aiReplySuggestion }
            : r
        ));
      } else {
        toast.error('Failed to generate AI reply');
      }
    } catch (error) {
      console.error('Error generating AI reply:', error);
      toast.error('Failed to generate AI reply');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyReply = () => {
    if (aiReply) {
      navigator.clipboard.writeText(aiReply);
      toast.success('Reply copied to clipboard!');
    }
  };

  const markAsReplied = async () => {
    if (!selectedReview) return;
    
    try {
      const res = await fetch(`/api/reviews/${selectedReview.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReplied: true }),
      });
      
      if (res.ok) {
        setReviews(prev => prev.map(r => 
          r.id === selectedReview.id 
            ? { ...r, isReplied: true }
            : r
        ));
        toast.success('Review marked as replied!');
        setSelectedReview(null);
        setAiReply('');
      }
    } catch (error) {
      console.error('Error marking review as replied:', error);
      toast.error('Failed to mark as replied');
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'NEGATIVE':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="space-y-6 animate-fade-in">
        <EmptyState
          icon={AlertCircle}
          title="No Business Connected"
          description="Connect your business first to view and manage reviews"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reviews</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Monitor and respond to customer reviews for {business.businessName}
          </p>
        </div>
        <Button
          onClick={syncReviews}
          disabled={isSyncing}
          variant="outline"
          className="rounded-xl border-gray-200 dark:border-gray-700"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
          {isSyncing ? 'Syncing...' : 'Sync Reviews'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl h-11 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <Select value={ratingFilter} onValueChange={(v) => v && setRatingFilter(v)}>
          <SelectTrigger className="w-full sm:w-[140px] rounded-xl h-11 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sentimentFilter} onValueChange={(v) => v && setSentimentFilter(v)}>
          <SelectTrigger className="w-full sm:w-[140px] rounded-xl h-11 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="POSITIVE">Positive</SelectItem>
            <SelectItem value="NEUTRAL">Neutral</SelectItem>
            <SelectItem value="NEGATIVE">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews found"
          description={reviews.length === 0 
            ? "Reviews will appear here once customers start leaving them. Click 'Sync Reviews' to fetch latest reviews."
            : "No reviews match your current filters"}
        />
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f] hover:shadow-soft-lg transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium">
                      {review.reviewerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{review.reviewerName}</span>
                      <StarRating rating={review.rating} size="sm" />
                      <Badge
                        className={cn("text-xs border-0", getSentimentColor(review.sentiment))}
                      >
                        {review.sentiment}
                      </Badge>
                      {review.isReplied && (
                        <Badge
                          className="text-xs border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Replied
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(review.reviewDate).toLocaleDateString()}
                    </p>
                    <p className="mt-2 sm:mt-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                      {review.reviewText || 'No review text'}
                    </p>
                    {review.aiReplySuggestion && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">AI Suggested Reply:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{review.aiReplySuggestion}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedReview(review);
                      setAiReply(review.aiReplySuggestion || '');
                      if (!review.aiReplySuggestion) {
                        generateAIReply(review);
                      }
                    }}
                    className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    {review.aiReplySuggestion ? 'View Reply' : 'AI Reply'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Reply Sheet */}
      <Sheet open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <SheetContent className="w-full sm:max-w-lg bg-white dark:bg-[#0f0f14] border-l border-gray-200 dark:border-gray-800 p-0">
          <SheetHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              AI Reply Suggestion
            </SheetTitle>
          </SheetHeader>
          {selectedReview && (
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
              {/* Original Review */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Original Review</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedReview.reviewText || 'No review text'}</p>
                <div className="flex items-center gap-2 mt-3">
                  <StarRating rating={selectedReview.rating} size="sm" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">by {selectedReview.reviewerName}</span>
                </div>
              </div>

              {/* AI Generated Reply */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">AI Generated Reply</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateAIReply(selectedReview)}
                    disabled={isGenerating}
                    className="h-8 px-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    {isGenerating ? "Generating..." : "Regenerate"}
                  </Button>
                </div>
                <textarea
                  value={aiReply}
                  onChange={(e) => setAiReply(e.target.value)}
                  className="w-full min-h-[140px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  placeholder={isGenerating ? "Generating AI reply..." : "AI reply will appear here..."}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={copyReply}
                  disabled={!aiReply}
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-gray-200 dark:border-gray-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Reply
                </Button>
                <Button
                  onClick={markAsReplied}
                  disabled={!aiReply || selectedReview.isReplied}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 font-medium"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  {selectedReview.isReplied ? 'Already Replied' : 'Mark as Replied'}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Copy the reply and paste it directly on Google Reviews
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
