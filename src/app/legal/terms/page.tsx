import Link from "next/link";

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last updated: August 28, 2026
        </p>

        <div className="prose prose-gray dark:prose-invert mt-8 max-w-none space-y-6 text-gray-600 dark:text-gray-400">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using StarPress (&quot;the Service&quot;), you agree to be
              bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to
              these Terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              2. Description of Service
            </h2>
            <p>
              StarPress is a software-as-a-service platform that enables
              businesses to collect, analyze, display, and respond to their
              Google reviews. The Service includes review scraping, AI-powered
              analysis, embeddable widgets, feedback collection, and Google
              Business Profile integration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              3. Account Registration
            </h2>
            <p>
              You must provide accurate and complete information when creating an
              account. You are responsible for maintaining the confidentiality of
              your account credentials and for all activities under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              4. Subscriptions and Payment
            </h2>
            <p>
              The Service offers a free plan and a paid Pro plan. Pro plan
              subscriptions are processed through Stripe. By subscribing to the
              Pro plan, you authorize us to charge your payment method on a
              recurring basis. You may cancel your subscription at any time
              through the billing portal. Refunds are available within 7 days of
              your first payment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              5. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Use the Service for any unlawful purpose or in violation of any
                applicable law
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Service
              </li>
              <li>
                Interfere with or disrupt the Service or servers connected to the
                Service
              </li>
              <li>
                Use automated systems to access the Service except as intended
                through the embed widget
              </li>
              <li>
                Resell or redistribute the Service without written permission
              </li>
              <li>
                Use AI-generated content to spread misinformation or fake reviews
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              6. Intellectual Property
            </h2>
            <p>
              The Service, including its original content, features, and
              functionality, is owned by StarPress and protected by international
              copyright, trademark, patent, trade secret, and other intellectual
              property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              7. User Content
            </h2>
            <p>
              You retain ownership of any content you submit through the Service,
              including business information and responses to reviews. By using
              the Service, you grant us a limited license to process this content
              solely for the purpose of providing the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              8. Third-Party Services
            </h2>
            <p>
              The Service integrates with third-party services including Google
              Business Profile, Stripe, Apify, and OpenAI. Your use of these
              third-party services is subject to their respective terms of
              service. We are not responsible for the actions of third-party
              services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              9. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, StarPress shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of profits or revenues, whether
              incurred directly or indirectly, or any loss of data, use,
              goodwill, or other intangible losses resulting from your use of
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              10. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind, whether express or implied, including but
              not limited to implied warranties of merchantability, fitness for
              a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              11. Termination
            </h2>
            <p>
              We may terminate or suspend your account and access to the Service
              at our sole discretion, without prior notice, for conduct that we
              determine violates these Terms or is harmful to other users, us,
              or third parties, or for any other reason.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              12. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will
              notify you of any material changes by posting the new Terms on this
              page and updating the &quot;Last updated&quot; date. Your continued use of
              the Service after any changes constitutes acceptance of the new
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              13. Contact
            </h2>
            <p>
              If you have questions about these Terms, please contact us at{" "}
              <a
                href="mailto:support@starpress.app"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                support@starpress.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
