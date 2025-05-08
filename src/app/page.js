import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Trucking Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Streamline your fleet management with our comprehensive trucking dashboard.
            Monitor routes, track deliveries, and optimize your operations in real-time.
          </p>
          
          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Link href="/login" className="inline-block">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Login
              </button>
            </Link>
            <button className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-8 rounded-lg border border-gray-300 transition-colors duration-200">
              Learn More
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Real-time Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">Monitor your fleet&apos;s location and status in real-time</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Route Optimization</h3>
              <p className="text-gray-600 dark:text-gray-300">Optimize delivery routes for maximum efficiency</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Analytics Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-300">Comprehensive insights into your fleet&apos;s performance</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
