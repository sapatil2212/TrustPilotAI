"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

const BUSINESS_TYPES = [
  { value: "RESTAURANT", label: "Restaurant / Food Service" },
  { value: "RETAIL", label: "Retail Store" },
  { value: "HEALTHCARE", label: "Healthcare / Medical" },
  { value: "PROFESSIONAL_SERVICES", label: "Professional Services" },
  { value: "HOME_SERVICES", label: "Home Services" },
  { value: "AUTOMOTIVE", label: "Automotive" },
  { value: "BEAUTY_WELLNESS", label: "Beauty & Wellness" },
  { value: "FITNESS", label: "Fitness / Gym" },
  { value: "EDUCATION", label: "Education" },
  { value: "HOSPITALITY", label: "Hospitality / Hotel" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "TECHNOLOGY", label: "Technology / IT" },
  { value: "OTHER", label: "Other" },
];

type Step = "email" | "verify" | "details";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    businessType: "",
    agreeTerms: false,
  });
  const [otp, setOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send OTP");
        toast.error(data.error || "Failed to send OTP");
        return;
      }

      toast.success("OTP sent to your email!");
      setStep("verify");
    } catch (err) {
      console.error("Send OTP error:", err);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid OTP");
        toast.error(data.error || "Invalid OTP");
        return;
      }

      setIsEmailVerified(true);
      toast.success("Email verified successfully!");
      setStep("details");
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Complete signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!formData.businessType) {
      setError("Please select a business type");
      toast.error("Please select a business type");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          businessType: formData.businessType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        toast.error(data.error || "Signup failed");
        setIsLoading(false);
        return;
      }

      // Auto-login after signup
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Account created but login failed. Please login manually.");
        router.push("/login");
        return;
      }

      toast.success("Account created! Your 14-day trial has started.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {["email", "verify", "details"].map((s, i) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step === s
                ? "bg-indigo-600 text-white"
                : ["email", "verify", "details"].indexOf(step) > i
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500"
            }`}
          >
            {["email", "verify", "details"].indexOf(step) > i ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              i + 1
            )}
          </div>
          {i < 2 && (
            <div
              className={`w-12 h-0.5 mx-1 ${
                ["email", "verify", "details"].indexOf(step) > i
                  ? "bg-green-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {step === "email" && "Create your account"}
          {step === "verify" && "Verify your email"}
          {step === "details" && "Complete your profile"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          {step === "email" && "Start your 14-day free trial today"}
          {step === "verify" && `Enter the OTP sent to ${formData.email}`}
          {step === "details" && "Just a few more details to get started"}
        </p>
      </div>

      {renderStepIndicator()}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Step 1: Email Input */}
      {step === "email" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11 pl-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === "verify" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter OTP
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              required
              className="h-14 text-center text-2xl tracking-[0.5em] rounded-xl border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
                disabled={isLoading}
              >
                Resend OTP
              </button>
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 rounded-xl"
              onClick={() => setStep("email")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Profile Details */}
      {step === "details" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-600 dark:text-green-400">
              Email verified: {formData.email}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="h-11 rounded-xl border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Business Name
            </Label>
            <Input
              id="businessName"
              type="text"
              placeholder="My Awesome Business"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
              className="h-11 rounded-xl border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Business Type
            </Label>
            <Select
              value={formData.businessType || undefined}
              onValueChange={(value) => value && setFormData({ ...formData, businessType: value })}
            >
              <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-11 rounded-xl border-gray-200 dark:border-gray-700 pr-10 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
              className="rounded border-gray-300 dark:border-gray-600 mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm font-normal leading-relaxed text-gray-600 dark:text-gray-400">
              I agree to the{" "}
              <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account & Start Trial"
            )}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </div>
  );
}
