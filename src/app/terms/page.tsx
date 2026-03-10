"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Star, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms and Conditions</h1>
          <p className="text-gray-500 dark:text-gray-400">Last Updated: March 10, 2026</p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            These Terms and Conditions govern the use of TrustPilotAI, a software platform operated by Digiworld Infotech.
          </p>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            By accessing or using our services, you agree to these terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">1. Description of Service</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrustPilotAI is a software platform designed to help businesses monitor and manage their online reviews.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            The platform provides tools such as:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-2">
            <li>review monitoring</li>
            <li>AI-generated reply suggestions</li>
            <li>analytics related to customer feedback</li>
            <li>reputation management tools</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
            TrustPilotAI does not create or post reviews on behalf of users. All reviews are submitted directly by customers through third-party platforms such as Google.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">2. Account Registration</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            To use TrustPilotAI, users must create an account and provide accurate information.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Users are responsible for maintaining the confidentiality of their account credentials.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">3. Google Business Profile Integration</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrustPilotAI allows users to connect their Google Business Profile via Google&apos;s OAuth authorization process.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            By connecting their account, users authorize TrustPilotAI to access permitted business profile data such as reviews and ratings.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Users can revoke this access at any time through their Google account settings.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">4. Acceptable Use</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Users agree not to:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-2">
            <li>misuse the platform</li>
            <li>attempt to manipulate or falsify reviews</li>
            <li>violate the policies of third-party platforms such as Google</li>
            <li>use the service for unlawful purposes</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
            TrustPilotAI reserves the right to suspend accounts that violate these rules.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">5. Free Trial</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            New users may receive a 14-day free trial period.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            After the trial period ends, continued access to the platform may require a paid subscription.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrustPilotAI reserves the right to modify pricing or trial terms at any time.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">6. Payments and Subscriptions</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Subscription fees may apply for continued use of the platform.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Payments are processed through secure third-party payment providers.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Failure to complete payment may result in suspension of services.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">7. Limitation of Liability</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrustPilotAI provides software tools to help businesses manage their reputation.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We do not guarantee specific results related to review ratings, rankings, or customer behavior.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Digiworld Infotech shall not be liable for any indirect or consequential damages resulting from the use of the platform.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">8. Termination</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We reserve the right to suspend or terminate accounts that violate these terms or misuse the platform.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Users may also discontinue use of the service at any time.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">9. Changes to Terms</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            These Terms and Conditions may be updated periodically.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Users will be notified of significant updates.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Continued use of the service indicates acceptance of updated terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4">10. Contact</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            For questions regarding these terms, please contact:
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
