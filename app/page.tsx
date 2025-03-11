import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Lightbulb, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 z-0"></div>
        <div className="absolute inset-0 opacity-30 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] bg-repeat"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in">
              <span className="gradient-text">Connection Manager</span>
            </h1>
            <p
              className="mt-3 max-w-md mx-auto text-xl text-gray-600 sm:text-2xl md:mt-5 md:max-w-3xl animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Manage your professional network with ease. Send connection requests, respond to invitations, and grow
              your network.
            </p>
            <div
              className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="rounded-md shadow">
                <Button asChild className="w-full btn-gradient">
                  <Link href="/login" className="flex items-center justify-center">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold gradient-text mb-8">Key Features</h2>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="card-modern p-6 animate-scale-in">
                <div className="rounded-full gradient-primary p-3 inline-flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect with Professionals</h3>
                <p className="text-gray-600">Build your network by connecting with professionals in your industry.</p>
              </div>

              <div className="card-modern p-6 animate-scale-in" style={{ animationDelay: "0.1s" }}>
                <div className="rounded-full gradient-primary p-3 inline-flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Discover Skills</h3>
                <p className="text-gray-600">Find professionals with the skills you need for your projects.</p>
              </div>

              <div className="card-modern p-6 animate-scale-in" style={{ animationDelay: "0.2s" }}>
                <div className="rounded-full gradient-primary p-3 inline-flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Messaging</h3>
                <p className="text-gray-600">
                  Communicate directly with your connections through our messaging system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-6">Ready to grow your network?</h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-3xl mx-auto">
            Join thousands of professionals who are already using our platform to connect and collaborate.
          </p>
          <Button asChild className="bg-white text-blue-600 hover:bg-gray-100">
            <Link href="/register">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold gradient-text">Connection Manager</h3>
              <p className="text-gray-600 mt-2">© 2025 All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

