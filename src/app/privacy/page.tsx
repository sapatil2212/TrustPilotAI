"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Star, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f14]">
      <Navbar />
      
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-semibold text-xl tracking-tight">TrustPilotAI</span>
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-500 dark:text-gray-400">Last Updated: March 10, 2026</p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrustPilotAI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a software platform operated by Digiworld Infotech that helps businesses monitor and manage their online reviews using artificial intelligence tools.
          </p>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            This Privacy Policy explains how we collect, use, and protect information when you use the TrustPilotAI platform.
          </p>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            By using our services, you agree to the terms described in this Privacy Policy.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We may collect the following types of information when you use our platform:
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Account Information</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            When you create an account, we may collect:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-2">
            <li>Name</li>
            <li>Email address</li>
            <li>Business name</li>
            <li>Contact information</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Google Account Data</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            If you connect your Google account through OAuth, we may access certain Google Business Profile data with your permission.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            This may include:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-2">
            <li>Business profile information</li>
            <li>Business locations</li>
            <li>Customer reviews</li>
            <li>Ratings associated with your business profile</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
            TrustPilotAI does NOT access or store your Google account password. All Google authentication is handled securely through Google&apos;s OAuth system.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We use collected information only for the following purposes:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-2">
            <li>To provide review monitoring services</li>
            <li>To display customer reviews inside the dashboard</li>
            <li>To help businesses generate reply suggestions using AI</li>
            <li>To allow businesses to respond to reviews through authorized APIs</li>
            <li>To provide analytics related to business reviews</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
            We do NOT create or submit reviews on behalf of users.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">3. Google User Data</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrustPilotAI uses Google APIs only after explicit authorization from the business owner.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Data accessed from Google Business Profile APIs is used solely for:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-2">
            <li>displaying reviews</li>
            <li>helping businesses manage and respond to reviews</li>
            <li>generating insights and analytics</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
            We do not sell, rent, or share Google user data with third parties.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrustPilotAI&apos;s use of information received from Google APIs adheres to the Google API Services User Data Policy.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">4. Data Storage and Security</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We implement industry-standard security practices to protect user information.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            These include:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-2">
            <li>secure HTTPS connections</li>
            <li>encrypted data storage</li>
            <li>restricted internal access to sensitive data</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
            However, no online service can guarantee absolute security.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">5. Data Sharing</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We do not sell or rent your personal data.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We may share information only in the following cases:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-2">
            <li>when required by law</li>
            <li>to comply with legal obligations</li>
            <li>to protect the security of our platform</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">6. Cookies and Analytics</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrustPilotAI may use cookies or analytics tools to improve platform performance and understand usage patterns.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            These technologies help us improve user experience.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">7. User Rights</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Users may:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-2">
            <li>request deletion of their account</li>
            <li>request removal of stored data</li>
            <li>disconnect Google integrations at any time</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
            Requests can be sent to our support team.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">8. Third-Party Services</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrustPilotAI may integrate with third-party services such as Google APIs.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            These services operate under their own privacy policies. We encourage users to review those policies.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">9. Changes to This Policy</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We may update this Privacy Policy from time to time.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Updates will be posted on this page with the revised date.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">10. Contact Information</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            If you have questions about this Privacy Policy, please contact:
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
            <strong>Digiworld Infotech</strong><br />
            Email: <a href="mailto:digiworldtechnologiesindia@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">digiworldtechnologiesindia@gmail.com</a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">© 2026 TrustPilotAI. All rights reserved.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A product of <a href="https://digiworldtechnologies.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Digiworld Infotech</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
