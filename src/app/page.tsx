import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900">
      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-r from-blue-600 via-green-500 to-teal-400 text-white">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Wellfilab
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-8 opacity-90">
          Balance your health and wealth with smart calculators and insights.
        </p>
        <Link href="/tools">
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition">
            Explore Tools
          </button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        {[
          { title: "BMI Calculator", desc: "Track your body mass index instantly.", link: "/tools/bmi" },
          { title: "SIP Calculator", desc: "Plan your investments with ease.", link: "/tools/sip" },
          { title: "EMI Calculator", desc: "Calculate loan repayments quickly.", link: "/tools/emi" },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-xl shadow-lg p-10 hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            <h3 className="text-2xl font-bold mb-3 text-blue-600">{item.title}</h3>
            <p className="text-gray-600 mb-6">{item.desc}</p>
            <Link href={item.link}>
              <button className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-5 py-2 rounded-full font-medium hover:opacity-90">
                Try Now
              </button>
            </Link>
          </div>
        ))}
      </section>

      {/* About Section */}
      <section className="py-24 px-6 text-center bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100">
        <h2 className="text-3xl font-extrabold mb-6">About Wellfilab</h2>
        <p className="max-w-3xl mx-auto text-gray-700 leading-relaxed">
          Wellfilab is your trusted companion for balancing health and wealth. 
          We provide modern, interactive tools designed to simplify complex decisions 
          and empower you to live a smarter, healthier, and wealthier life.
        </p>
      </section>

      {/* Blog Highlights */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center mb-12">Latest Articles</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Top 5 Wealth Habits", desc: "Simple habits to grow your wealth." },
            { title: "Healthy Living Tips", desc: "Daily routines for better health." },
            { title: "Retirement Planning Basics", desc: "Start early, retire stress-free." },
          ].map((blog) => (
            <div key={blog.title} className="bg-white shadow-lg rounded-xl p-8 hover:shadow-2xl transition">
              <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
              <p className="text-gray-600">{blog.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-24 text-center bg-gradient-to-r from-teal-400 to-green-500 text-white">
        <h2 className="text-3xl font-extrabold mb-6">Ready to Plan Smarter?</h2>
        <p className="max-w-xl mx-auto mb-8 opacity-90">
          Join thousands of users who trust Wellfilab for their health and wealth planning.
        </p>
        <Link href="/signup">
          <button className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition">
            Get Started
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center bg-gray-900 text-gray-300">
        <p>© {new Date().getFullYear()} Wellfilab. All rights reserved.</p>
        <div className="mt-4 space-x-4">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </footer>
    </main>
  );
}
