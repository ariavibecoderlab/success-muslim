import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-4">Last updated: February 2025</p>

      <div className="space-y-4 text-sm text-gray-700">
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Data We Collect</h2>
          <p>
            Success Muslim collects the information you provide during signup and use of the app:
            name, email, daily goals, check-in status, prayer preferences, fasting sessions,
            movement logs, and family group membership.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">How We Use Your Data</h2>
          <p>
            Your data is used to deliver the app features: daily routine tracking, prayer times,
            fasting timer, learn feed, and family group overview. We do not sell your data.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Family Data</h2>
          <p>
            Family members can see each other&apos;s daily completion percentage. Only members
            you invite to your family group have access to this information.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Security</h2>
          <p>
            Data is stored securely and transmitted over HTTPS. Passwords are encrypted.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-2">Contact</h2>
          <p>
            For questions about this policy, please contact us through the app.
          </p>
        </section>
      </div>

      <Link
        href="/app/today"
        className="block mt-8 text-primary font-medium hover:underline"
      >
        Back to App
      </Link>
    </div>
  );
}
