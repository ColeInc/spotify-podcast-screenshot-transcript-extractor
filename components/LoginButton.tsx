"use client";

export function LoginButton() {
  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold">Spotify Podcast Player</h1>
      <p className="text-gray-400 text-center max-w-md">
        Play Spotify podcasts at specific timestamps using official Spotify APIs
      </p>

      <button
        onClick={handleLogin}
        className="bg-spotify-green hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
      >
        Login with Spotify
      </button>

      <div className="text-sm text-gray-500 max-w-md text-center">
        <p className="mb-2">This app requires the following permissions:</p>
        <ul className="list-disc list-inside text-left">
          <li>Streaming (play audio in browser)</li>
          <li>Read playback state</li>
          <li>Modify playback state</li>
        </ul>
        <p className="mt-4 text-xs text-gray-600">
          Note: Spotify Premium is required for playback
        </p>
      </div>
    </div>
  );
}
