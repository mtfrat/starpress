import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            ⭐ StarPress
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last updated: August 28, 2026
        </p>

        <div className="prose prose-gray dark:prose-invert mt-8 max-w-none space-y-6 text-gray-600 dark:text-gray-400">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              1. Introduction
            </h2>
            <p>
              StarPress (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting
              your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              2. Information We Collect
            </h2>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Account Information
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address</li>
              <li>Name (if provided via Google OAuth)</li>
              <li>Profile picture (if provided via Google OAuth)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
              Business Information
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Google Maps URLs you submit for analysis</li>
              <li>Business names and locations</li>
              <li>Widget configurations</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
              Review Data
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Publicly available Google reviews for your submitted locations</li>
              <li>Review author names, ratings, text, and dates</li>
              <li>Feedback submitted through your QR codes</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
              Usage Data
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Pages visited and features used</li>
              <li>API call frequency</li>
              <li>Device type and browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and maintain the Service</li>
              <li>To process your transactions and manage subscriptions</li>
              <li>To generate AI-powered insights from your review data</li>
              <li>To send you alerts about negative reviews (if enabled)</li>
              <li>To improve and optimize the Service</li>
              <li>To communicate with you about your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              4. How We Share Your Information
            </h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Service Providers:</strong> Supabase (database), Stripe
                (payments), Apify (web scraping), OpenAI (AI analysis), Resend
                (email delivery)
              </li>
              <li>
                <strong>Google:</strong> When you connect your Google Business
                Profile or when reviews are displayed via the embed widget
              </li>
              <li>
                <strong>Legal Requirements:</strong> If required by law or to
                protect our rights
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              5. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active. If you
              delete your account, we will remove your personal data within 30
              days, except where required by law. Review cache data may be
              retained for up to 90 days after account deletion for backup
              purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              6. Your Rights (GDPR)
            </h2>
            <p>If you are located in the European Economic Area, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:privacy@starpress.app"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                privacy@starpress.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              7. California Residents (CCPA)
            </h2>
            <p>
              If you are a California resident, you have the right to know what
              personal information we collect, use, and disclose, and the right
              to request deletion of your personal information. We do not sell
              personal information as defined by the CCPA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              8. Cookies and Tracking
            </h2>
            <p>
              We use essential cookies for authentication and session management.
              We do not use third-party tracking cookies. Supabase uses
              localStorage for session tokens. The embed widget does not set
              cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              9. Security
            </h2>
            <p>
              We implement industry-standard security measures including HTTPS
              encryption, Row Level Security in our database, and encrypted data
              at rest. However, no method of transmission over the Internet is
              100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              10. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not intended for use by children under 13. We do not
              knowingly collect personal information from children under 13. If
              we become aware that we have collected personal information from a
              child under 13, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              12. Contact
            </h2>
            <p>
              For questions about this Privacy Policy, contact us at{" "}
              <a
                href="mailto:privacy@starpress.app"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                privacy@starpress.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
