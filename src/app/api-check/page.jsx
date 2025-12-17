'use client';

import { useEffect, useState } from 'react';
import { checkBackendConnection } from '@services/CommonService';

export default function ApiCheckPage() {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [envVars, setEnvVars] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check environment variables (client-side accessible ones)
    setEnvVars({
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '❌ NOT SET',
      NEXT_PUBLIC_API_SOCKET_URL: process.env.NEXT_PUBLIC_API_SOCKET_URL || '❌ NOT SET',
      NEXT_PUBLIC_STORE_DOMAIN: process.env.NEXT_PUBLIC_STORE_DOMAIN || '❌ NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ NOT SET',
    });

    // Check backend connection
    checkBackendConnection()
      .then((status) => {
        setConnectionStatus(status);
        setLoading(false);
      })
      .catch((error) => {
        setConnectionStatus({
          connected: false,
          message: error.message,
        });
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Backend Connection Checker</h1>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-start gap-4">
                <span className="font-mono text-sm text-gray-600 w-64">{key}:</span>
                <span
                  className={`font-mono text-sm ${
                    value === '❌ NOT SET' ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {value || '(empty)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Backend Connection Status</h2>
          {loading ? (
            <div className="text-gray-600">Checking connection...</div>
          ) : connectionStatus ? (
            <div>
              <div
                className={`inline-block px-4 py-2 rounded-lg mb-4 ${
                  connectionStatus.connected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {connectionStatus.connected ? '✅ Connected' : '❌ Not Connected'}
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Status Code:</span>{' '}
                  {connectionStatus.status || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Message:</span>{' '}
                  {connectionStatus.message}
                </div>
                {connectionStatus.error && (
                  <div>
                    <span className="font-semibold">Error:</span>{' '}
                    {connectionStatus.error}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-red-600">Failed to check connection</div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">How to Fix:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>
              Make sure <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_API_BASE_URL</code> is set in your
              deployment environment (Vercel/Netlify)
            </li>
            <li>
              The URL should point to your backend API (e.g.,{' '}
              <code className="bg-blue-100 px-1 rounded">https://your-backend.vercel.app/v1</code>)
            </li>
            <li>
              Ensure your backend is running and accessible from the internet
            </li>
            <li>
              Check that your backend CORS settings allow requests from your frontend domain
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

