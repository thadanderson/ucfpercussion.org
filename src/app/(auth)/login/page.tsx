import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-ucf-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ucf-gold">UCF Percussion</h1>
          <p className="text-ucf-white mt-2 text-sm">Studio Dashboard</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={signIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ucf-gold focus:border-ucf-gold"
                placeholder="you@ucf.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ucf-gold focus:border-ucf-gold"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-ucf-gold text-ucf-black font-semibold rounded-md hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Access is by invitation only.
          </p>
        </div>
      </div>
    </div>
  );
}
