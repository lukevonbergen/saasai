export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Hero Section */}
      <section className="px-6 pt-24 pb-32 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Build Automations That <span className="text-blue-600">Scale</span>
        </h1>
        <p className="max-w-xl mx-auto text-lg md:text-xl text-gray-600 mb-8">
          Ship backend automations faster with AI + workflows. No engineering team required.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition">
            Get Started
          </button>
          <button className="border border-gray-300 text-gray-800 font-medium py-3 px-6 rounded-full hover:bg-gray-100 transition">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">Visual Workflows</h3>
            <p className="text-gray-600">Drag-and-drop automation builder. Connect tools. Automate anything.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">AI Built-In</h3>
            <p className="text-gray-600">Trigger actions using natural language. Let AI build flows for you.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Self-Hosted</h3>
            <p className="text-gray-600">Run securely on your own server. Full control over data and execution.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Built by Luke Von Bergen — All rights reserved.
      </footer>
    </div>
  );
}