import Link from 'next/link';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You are offline
        </h1>
        
        <p className="text-gray-600 mb-8">
          It looks like you have lost your internet connection. 
          Some features may not be available until you are back online.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary btn-lg w-full"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
          
          <Link href="/" className="btn-outline btn-lg w-full inline-flex items-center justify-center">
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
          <h3 className="font-medium text-gray-900 mb-2">While offline, you can:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>- View your cached appointments</li>
            <li>- Browse previously loaded photos</li>
            <li>- Read saved messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
