import Link from 'next/link';

export default function DisclaimerPage() {
  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Medical Disclaimer</h1>
      <p className="text-sm text-gray-600 mb-4">Extended Fasting & Wellness</p>

      <div className="space-y-4 text-sm text-gray-700">
        <p>
          Success Muslim provides fasting tracking as a convenience tool only. It is not
          intended as medical advice. Fasting, especially for 24 hours or more, may not be
          suitable for everyone.
        </p>

        <p>
          <strong>Please consult your doctor or healthcare provider</strong> before
          starting any extended fasting (24+ hours), especially if you have:
        </p>
        <ul className="list-disc list-inside ml-2 space-y-1">
          <li>Diabetes or blood sugar conditions</li>
          <li>Heart conditions</li>
          <li>Pregnancy or breastfeeding</li>
          <li>Eating disorders</li>
          <li>Any other health concerns</li>
        </ul>

        <p>
          The app does not provide medical, nutritional, or religious rulings. Use at your
          own discretion.
        </p>
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
