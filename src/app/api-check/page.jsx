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
                {connectionStatus.url && (
                  <div>
                    <span className="font-semibold">Testing URL:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                      {connectionStatus.url}
                    </code>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Status Code:</span>{' '}
                  {connectionStatus.status || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Message:</span>{' '}
                  <div className="mt-1 p-2 bg-gray-50 rounded text-xs whitespace-pre-wrap">
                    {connectionStatus.message}
                  </div>
                </div>
                {connectionStatus.error && (
                  <div>
                    <span className="font-semibold">Error Type:</span>{' '}
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
          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-1">1. Set Missing Environment Variables:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <code className="bg-blue-100 px-1 rounded">NEXTAUTH_URL</code> - Set to your frontend URL (e.g.,{' '}
                  <code className="bg-blue-100 px-1 rounded">https://store-henna-tau.vercel.app</code>)
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">2. Verify Backend Connection:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  Check if <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_API_BASE_URL</code> is correct
                </li>
                <li>
                  Test the backend URL directly in browser: <code className="bg-blue-100 px-1 rounded break-all">
                    {envVars.NEXT_PUBLIC_API_BASE_URL || 'your-backend-url'}/setting/global
                  </code>
                </li>
                <li>
                  Ensure your backend is deployed and running on Vercel
                </li>
                <li>
                  Check backend CORS settings allow requests from{' '}
                  <code className="bg-blue-100 px-1 rounded">store-henna-tau.vercel.app</code>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">3. Backend CORS Configuration:</h4>
              <p className="ml-4">
                In your backend code, ensure CORS allows your frontend domain:
              </p>
              <pre className="bg-blue-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`app.use(cors({
  origin: [
    'https://store-henna-tau.vercel.app',
    'https://horeca1-frontend.vercel.app'
  ],
  credentials: true
}));`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

