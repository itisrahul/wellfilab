import Link from "next/link";

export default function Home() {
  return (
    <main className="text-gray-900">
      {/* Navbar */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
            Wellfilab
          </h1>
          <nav className="space-x-6 font-medium text-gray-700">
            <Link href="/">Home</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section with subtle image background */}
      <section
        className="h-screen flex flex-col justify-center items-center text-center px-6 text-white relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Balance Your Health & Wealth
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mb-8 opacity-90">
            Smart calculators and insights to help you plan better, live healthier, and grow wealthier.
          </p>
          <Link href="/tools">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition">
              Explore Tools
            </button>
          </Link>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-10 bg-gray-50">
        {[
          { title: "BMI Calculator", desc: "Track your body mass index instantly.", link: "/tools/bmi" },
          { title: "SIP Calculator", desc: "Plan your investments with ease.", link: "/tools/sip" },
          { title: "EMI Calculator", desc: "Calculate loan repayments quickly.", link: "/tools/emi" },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-xl shadow-md p-10 hover:shadow-xl transition transform hover:-translate-y-1"
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
      <section className="py-24 px-6 text-center bg-gray-100">
        <h2 className="text-3xl font-extrabold mb-6">About Wellfilab</h2>
        <p className="max-w-3xl mx-auto text-gray-700 leading-relaxed">
          Wellfilab helps you make smarter decisions for your health and wealth. 
          Our interactive tools simplify complex planning so you can focus on living better.
        </p>
      </section>

      {/* CTA Section */}
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