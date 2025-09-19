"use client";

export default function OfflinePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">You are offline</h1>
      <p className="text-gray-700">Some features are unavailable without internet. Please check your connection and try again.</p>
      <div>
        <a href="/" className="rounded-md bg-brand px-4 py-2 text-white">Go Home</a>
      </div>
    </div>
  );
}