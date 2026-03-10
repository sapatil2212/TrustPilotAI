"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { 
  Star, 
  Menu, 
  Moon, 
  Sun,
  Building2,
  MessageSquare,
  Globe,
  ChevronDown
} from "lucide-react";

const services = [
  {
    title: "GMB Optimisation",
    description: "Optimize your Google Business Profile for maximum visibility",
    href: "/services/gmb-optimisation",
    icon: Building2,
  },
  {
    title: "Social Media Ads",
    description: "Targeted advertising campaigns across all platforms",
    href: "/services/social-media-ads",
    icon: MessageSquare,
  },
  {
    title: "Google Workspace",
    description: "Complete business productivity and collaboration tools",
    href: "/services/google-workspace",
    icon: Globe,
  },
];

export function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close services dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.services-dropdown')) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled 
            ? isDark 
              ? "bg-[#0f0f14]/95 backdrop-blur-xl border-b border-gray-800 shadow-lg" 
              : "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm"
            : isDark
              ? "bg-[#0f0f14]"
              : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <span className={`font-semibold text-lg tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                TrustPilotAI
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/" 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDark 
                    ? "text-gray-300 hover:text-white hover:bg-gray-800" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Home
              </Link>
              
              {/* Services Dropdown */}
              <div className="relative services-dropdown">
                <button 
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                    isDark 
                      ? "text-gray-300 hover:text-white hover:bg-gray-800" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  } ${servicesOpen ? (isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900") : ""}`}
                >
                  Our Services
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
                </button>
                
                {/* Dropdown Menu */}
                {servicesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-[520px] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className={`rounded-2xl shadow-2xl border overflow-hidden ${
                      isDark 
                        ? "bg-[#1a1a1f] border-gray-800" 
                        : "bg-white border-gray-200"
                    }`}>
                      <div className="flex">
                        {/* Left side - Services */}
                        <div className="flex-1 p-4">
                          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            Our Services
                          </h3>
                          <div className="space-y-1">
                            {services.map((service) => (
                              <Link
                                key={service.title}
                                href={service.href}
                                onClick={() => setServicesOpen(false)}
                                className={`flex items-start gap-3 p-3 rounded-xl transition-colors group ${
                                  isDark 
                                    ? "hover:bg-gray-800" 
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isDark 
                                    ? "bg-indigo-950/50 group-hover:bg-indigo-900/50" 
                                    : "bg-indigo-50 group-hover:bg-indigo-100"
                                }`}>
                                  <service.icon className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                                </div>
                                <div>
                                  <h4 className={`text-sm font-semibold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {service.title}
                                  </h4>
                                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {service.description}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                        
                        {/* Right side - Image */}
                        <div className="w-48 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex flex-col justify-center items-center text-white">
                          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
                            <Star className="w-8 h-8 text-white fill-white" />
                          </div>
                          <h4 className="text-sm font-semibold text-center mb-1">Trusted Solutions</h4>
                          <p className="text-xs text-white/80 text-center">Professional services for your business growth</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Link 
                href="/contact" 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDark 
                    ? "text-gray-300 hover:text-white hover:bg-gray-800" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Contact Us
              </Link>
            </nav>
            
            {/* Right Side */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`rounded-full w-9 h-9 ${isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Link href="/login" className="hidden md:block">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`font-medium ${isDark ? "text-gray-300 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Log in
                </Button>
              </Link>
              
              <Link href="/signup" className="hidden md:block">
                <Button 
                  size="sm" 
                  className="rounded-full px-5 font-medium bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  Get started
                </Button>
              </Link>
              
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger className="md:hidden">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-full w-9 h-9 ${isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className={`w-[320px] p-0 ${isDark ? "bg-[#0f0f14] border-gray-800" : "bg-white border-gray-200"}`}>
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className={`flex items-center justify-between p-4 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                      <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <Star className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>TrustPilotAI</span>
                      </Link>
                    </div>
                    
                    {/* Mobile Navigation */}
                    <nav className="flex-1 overflow-auto p-4">
                      <div className="space-y-1">
                        <Link 
                          href="/" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                            isDark 
                              ? "text-gray-300 hover:text-white hover:bg-gray-800" 
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          Home
                        </Link>
                        
                        {/* Mobile Services */}
                        <div className="py-2">
                          <p className={`px-4 text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            Our Services
                          </p>
                          {services.map((service) => (
                            <Link
                              key={service.title}
                              href={service.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                isDark 
                                  ? "text-gray-300 hover:text-white hover:bg-gray-800" 
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              }`}
                            >
                              <service.icon className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                              {service.title}
                            </Link>
                          ))}
                        </div>
                        
                        <Link 
                          href="/contact" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                            isDark 
                              ? "text-gray-300 hover:text-white hover:bg-gray-800" 
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          Contact Us
                        </Link>
                      </div>
                    </nav>
                    
                    {/* Mobile Footer */}
                    <div className={`p-4 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                      {/* Mobile Theme Toggle */}
                      <div className="flex items-center justify-between mb-4 px-2">
                        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>Theme</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTheme(isDark ? "light" : "dark")}
                          className={`rounded-lg ${isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
                        >
                          {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                          {isDark ? "Light Mode" : "Dark Mode"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          <Button 
                            variant="outline" 
                            className={`w-full rounded-xl ${isDark ? "border-gray-700 hover:bg-gray-800" : ""}`}
                          >
                            Log in
                          </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                          <Button 
                            className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                          >
                            Get started
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16" />
    </>
  );
}
