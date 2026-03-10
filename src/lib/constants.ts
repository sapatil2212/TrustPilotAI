import { PricingPlan } from "@/types";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 999,
    currency: "₹",
    period: "month",
    description: "Perfect for small businesses getting started with review management",
    features: [
      "1 business location",
      "Review monitoring",
      "AI reply suggestions",
      "QR review funnel",
      "Basic analytics",
      "Email support",
    ],
    ctaText: "Start 14 Day Free Trial",
  },
  {
    id: "growth",
    name: "Growth",
    price: 2499,
    currency: "₹",
    period: "month",
    description: "Best for growing businesses with multiple locations",
    features: [
      "Up to 5 locations",
      "AI auto replies",
      "Review analytics",
      "QR code campaigns",
      "Email notifications",
      "Priority support",
      "Team collaboration",
    ],
    highlighted: true,
    ctaText: "Start 14 Day Free Trial",
  },
  {
    id: "agency",
    name: "Agency",
    price: 6999,
    currency: "₹",
    period: "month",
    description: "For agencies managing multiple client accounts",
    features: [
      "Unlimited businesses",
      "Agency dashboard",
      "Multi-client management",
      "Advanced analytics",
      "Priority support",
      "White-label options",
      "API access",
      "Custom integrations",
    ],
    ctaText: "Start 14 Day Free Trial",
  },
];

export const NAVIGATION_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Businesses", href: "/businesses", icon: "Building2" },
  { name: "Reviews", href: "/reviews", icon: "MessageSquare" },
  { name: "AI Replies", href: "/ai-replies", icon: "Sparkles" },
  { name: "Review Funnels", href: "/funnels", icon: "Funnel" },
  { name: "QR Codes", href: "/qr-codes", icon: "QrCode" },
  { name: "Analytics", href: "/analytics", icon: "BarChart3" },
  { name: "Settings", href: "/settings", icon: "Settings" },
];

export const SETTINGS_NAVIGATION = [
  { name: "Profile", href: "/settings/profile", icon: "User" },
  { name: "Team Members", href: "/settings/team", icon: "Users" },
  { name: "Billing", href: "/settings/billing", icon: "CreditCard" },
  { name: "Integrations", href: "/settings/integrations", icon: "Plug" },
  { name: "API Keys", href: "/settings/api-keys", icon: "Key" },
];

export const FEATURES = [
  {
    title: "AI Review Replies",
    description: "Generate professional, personalized responses to reviews in seconds using advanced AI technology.",
    icon: "Sparkles",
  },
  {
    title: "Smart Review Funnel",
    description: "Guide happy customers to leave reviews while privately collecting feedback from unhappy ones.",
    icon: "Funnel",
  },
  {
    title: "Review Analytics",
    description: "Track your reputation metrics, sentiment trends, and response rates with detailed analytics.",
    icon: "BarChart3",
  },
  {
    title: "Multi-Location Management",
    description: "Manage reviews across all your business locations from a single, unified dashboard.",
    icon: "Building2",
  },
  {
    title: "QR Code Review System",
    description: "Generate custom QR codes that direct customers straight to your Google review page.",
    icon: "QrCode",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Connect Google Business Profile",
    description: "Link your Google Business Profile in just a few clicks. We support multiple locations.",
  },
  {
    step: 2,
    title: "Monitor Reviews",
    description: "Get real-time notifications when new reviews are posted across all your locations.",
  },
  {
    step: 3,
    title: "Reply Using AI",
    description: "Generate professional, personalized responses with one click using our AI assistant.",
  },
  {
    step: 4,
    title: "Grow Your Reputation",
    description: "Watch your ratings improve as you respond faster and collect more positive reviews.",
  },
];

export const MOCK_REVIEWS = [
  {
    id: "1",
    businessId: "1",
    reviewerName: "Sarah Johnson",
    reviewerAvatar: "SJ",
    rating: 5,
    text: "Amazing service! The team went above and beyond to help me. Highly recommend to everyone looking for quality service.",
    status: "replied" as const,
    sentiment: "positive" as const,
    createdAt: new Date("2026-03-08"),
  },
  {
    id: "2",
    businessId: "1",
    reviewerName: "Michael Chen",
    reviewerAvatar: "MC",
    rating: 4,
    text: "Good experience overall. The staff was friendly and professional. Would visit again.",
    status: "pending" as const,
    sentiment: "positive" as const,
    createdAt: new Date("2026-03-07"),
  },
  {
    id: "3",
    businessId: "1",
    reviewerName: "Emily Davis",
    reviewerAvatar: "ED",
    rating: 2,
    text: "Wait time was longer than expected. The service was okay but could be improved.",
    status: "pending" as const,
    sentiment: "negative" as const,
    createdAt: new Date("2026-03-06"),
  },
  {
    id: "4",
    businessId: "1",
    reviewerName: "James Wilson",
    reviewerAvatar: "JW",
    rating: 5,
    text: "Absolutely fantastic! Best experience I've had in years. The attention to detail was remarkable.",
    status: "replied" as const,
    sentiment: "positive" as const,
    createdAt: new Date("2026-03-05"),
  },
  {
    id: "5",
    businessId: "1",
    reviewerName: "Amanda Brown",
    reviewerAvatar: "AB",
    rating: 3,
    text: "Average experience. Nothing special but nothing terrible either.",
    status: "pending" as const,
    sentiment: "neutral" as const,
    createdAt: new Date("2026-03-04"),
  },
];

export const MOCK_BUSINESSES = [
  {
    id: "1",
    name: "Downtown Cafe",
    location: "123 Main St, New York, NY",
    rating: 4.5,
    totalReviews: 128,
    createdAt: new Date("2026-01-15"),
  },
  {
    id: "2",
    name: "Westside Bistro",
    location: "456 West Ave, New York, NY",
    rating: 4.8,
    totalReviews: 256,
    createdAt: new Date("2026-01-20"),
  },
  {
    id: "3",
    name: "Eastside Grill",
    location: "789 East Blvd, New York, NY",
    rating: 4.2,
    totalReviews: 89,
    createdAt: new Date("2026-02-01"),
  },
];
