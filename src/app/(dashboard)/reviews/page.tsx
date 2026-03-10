"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/shared/star-rating";
import { EmptyState } from "@/components/shared/empty-state";
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
import { MessageSquare, Search, Sparkles, Reply, CheckCircle } from "lucide-react";
import { MOCK_REVIEWS } from "@/lib/constants";
import { Review } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AI_REPLY_TEMPLATES = {
  professional: "Thank you for your feedback. We appreciate your business and are committed to providing excellent service.",
  friendly: "Thanks so much for the kind words! We're thrilled you had a great experience with us!",
  short: "Thank you for your review!",
  detailed: "Thank you for taking the time to share your experience with us. We're delighted to hear that you enjoyed our service and look forward to serving you again soon.",
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [aiReply, setAiReply] = useState("");
  const [replyTone, setReplyTone] = useState<keyof typeof AI_REPLY_TEMPLATES>("professional");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating =
      ratingFilter === "all" || review.rating.toString() === ratingFilter;
    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;
    return matchesSearch && matchesRating && matchesStatus;
  });

  const generateAIReply = async (review: Review) => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    let reply = AI_REPLY_TEMPLATES[replyTone];
    if (review.rating <= 2) {
      reply = "We sincerely apologize for your experience. We'd love to make this right. Please contact us directly so we can address your concerns.";
    }
    
    setAiReply(reply);
    setIsGenerating(false);
  };

  const postReply = () => {
    if (selectedReview && aiReply) {
      setReviews(
        reviews.map((r) =>
          r.id === selectedReview.id
            ? { ...r, status: "replied" as const, reply: aiReply }
            : r
        )
      );
      toast.success("Reply posted successfully!");
      setSelectedReview(null);
      setAiReply("");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reviews</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Monitor and respond to customer reviews
          </p>
        </div>
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
        <Select value={ratingFilter} onValueChange={(v) => setRatingFilter(v || "all")}>
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
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-full sm:w-[140px] rounded-xl h-11 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews found"
          description="Reviews will appear here once customers start leaving them"
        />
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f] hover:shadow-soft-lg transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium">
                      {review.reviewerAvatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{review.reviewerName}</span>
                      <StarRating rating={review.rating} size="sm" />
                      <Badge
                        variant={review.status === "replied" ? "secondary" : "outline"}
                        className={cn(
                          "text-xs border-0",
                          review.status === "replied" 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        )}
                      >
                        {review.status === "replied" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : null}
                        {review.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-2 sm:mt-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">{review.text}</p>
                    {review.reply && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Your Reply:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{review.reply}</p>
                      </div>
                    )}
                  </div>
                  {review.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review);
                        generateAIReply(review);
                      }}
                      className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      AI Reply
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Reply Sheet */}
      <Sheet open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Generate AI Reply</SheetTitle>
          </SheetHeader>
          {selectedReview && (
            <div className="mt-6 space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Original Review:</p>
                <p className="text-sm text-muted-foreground">{selectedReview.text}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <Select
                  value={replyTone}
                  onValueChange={(v) => {
                    setReplyTone(v as keyof typeof AI_REPLY_TEMPLATES);
                    generateAIReply(selectedReview);
                  }}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">AI Generated Reply:</label>
                <textarea
                  value={aiReply}
                  onChange={(e) => setAiReply(e.target.value)}
                  className="w-full min-h-[120px] p-3 rounded-lg border bg-background text-sm resize-none"
                  placeholder="AI reply will appear here..."
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIReply(selectedReview)}
                  disabled={isGenerating}
                  className="rounded-full"
                >
                  {isGenerating ? "Generating..." : "Regenerate"}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={postReply}
                  disabled={!aiReply}
                  className="flex-1 rounded-full"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Post Reply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedReview(null)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
