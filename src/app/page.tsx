export default function Home() {
  return (
    <main className="relative bg-gradient-to-br from-zinc-100 to-white dark:from-zinc-900 dark:to-black">
      <section className="h-[80vh] bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col justify-center items-center text-center px-6">
      <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-4 max-w-3xl">
        AI-Powered Automation for Modern SaaS
      </h2>
      <p className="text-xl mb-8 max-w-xl">
        Build smarter, launch faster, and scale easier with AI-driven backend workflows.
      </p>
      <a href="/login" className="bg-white text-black px-6 py-3 rounded text-lg hover:bg-gray-200 transition">
        Get Started
      </a>
    </section>
    </main>
  );
}
