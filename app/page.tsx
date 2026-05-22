'use client'

import { Button } from "@/components/ui/button"
import { ChevronDownIcon, HeartIcon,  CheckCircledIcon, BarChartIcon, StarIcon, LockClosedIcon, PersonIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"

const LandingPage = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: "smooth" })
  }
  const router = useRouter();

  return (
    <div className="w-full max-w-screen overflow-hidden">
      {/* Sheet 1: Hero Section */}
      <section
        id="hero"
        className="w-full max-w-screen h-screen bg-linear-to-br from-blue-600 via-blue-500 to-cyan-400 flex flex-col items-center justify-center text-white px-4"
      >
        <div className="text-center space-y-6 max-w-2xl">
          <h1 className="text-6xl md:text-7xl font-bold">Ayushman.</h1>
          <p className="text-xl md:text-2xl font-light">
            Your AI based companion that helps you keep your relationships with your fellow humans healthy.
          </p>
          <p className="text-lg opacity-90">
            Track your commitments, manage interactions, and achieve your health goals
          </p>
          <div className="space-y-4 pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/register")}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg"
              >
                Get Started
              </Button>
              <Button
                onClick={() => router.push("/login")}
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold rounded-lg"
              >
                Sign In
              </Button>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => scrollToSection("features")}
                className="animate-bounce text-white"
              >
                <ChevronDownIcon width={32} height={32} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sheet 2: Features Overview */}
      <section
        id="features"
        className="w-full max-w-screen min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-20 flex items-center"
      >
        <div className="mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage your health</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex space-x-6">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-blue-600">
                  <HeartIcon width={32} height={32} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Health Tracking</h3>
                <p className="mt-2 text-gray-600">
                  Monitor your health metrics and track your wellness journey with detailed insights
                </p>
              </div>
            </div>

            <div className="flex space-x-6">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-green-600">
                  <CheckCircledIcon width={32} height={32} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Commitment Goals</h3>
                <p className="mt-2 text-gray-600">
                  Set and manage your health commitments with easy-to-track milestones
                </p>
              </div>
            </div>

            <div className="flex space-x-6">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-purple-600">
                  <PersonIcon width={32} height={32} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">People Network</h3>
                <p className="mt-2 text-gray-600">
                  Connect with others on similar health journeys and share experiences
                </p>
              </div>
            </div>

            <div className="flex space-x-6">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-orange-600">
                  <BarChartIcon width={32} height={32} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Progress Analytics</h3>
                <p className="mt-2 text-gray-600">
                  Visualize your progress with comprehensive analytics and reports
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button
              onClick={() => scrollToSection("benefits")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg"
            >
              Explore Benefits
            </Button>
          </div>
        </div>
      </section>

      {/* Sheet 3: Benefits */}
      <section
        id="benefits"
        className="w-full max-w-screen min-h-screen bg-linear-to-b from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-20 flex items-center"
      >
        <div className="mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Why Choose Ayushman?</h2>
            <p className="text-xl text-gray-600">Trusted by thousands for their health journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Easy to Use",
                description: "Intuitive interface designed for everyone. No complicated setup needed.",
                icon: StarIcon,
              },
              {
                title: "Real Results",
                description: "See tangible progress with our advanced tracking and analytics tools.",
                icon: CheckCircledIcon,
              },
              {
                title: "Community Support",
                description: "Join thousands of users sharing their health stories and success.",
                icon: PersonIcon,
              },
              {
                title: "Privacy First",
                description: "Your health data is encrypted and secure. We prioritize your privacy.",
                icon: LockClosedIcon,
              },
              {
                title: "24/7 Available",
                description: "Access your health data anytime, anywhere from any device.",
                icon: ExclamationTriangleIcon,
              },
              {
                title: "Expert Insights",
                description: "Get personalized recommendations based on your health data.",
                icon: PersonIcon,
              },
            ].map((benefit, idx) => {
              const IconComponent = benefit.icon;
              return (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4"><IconComponent width={32} height={32} className="mx-auto text-blue-600" /></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            );
            })}
          </div>

          <div className="text-center mt-16">
            <Button
              onClick={() => scrollToSection("contact")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Sheet 4: Call to Action */}
      <section
        id="contact"
        className="w-full max-w-screen min-h-screen bg-linear-to-br from-blue-600 to-cyan-500 px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-white"
      >
        <div className="mx-auto w-full text-center space-y-8">
          <div>
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Ready to Transform Yourself?</h2>
          </div>

          <div className="space-y-4 py-8">
            <div className="text-lg">
              <p className="mb-2">✓ Free to start • ✓ No credit card required • ✓ Cancel anytime</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg">
              Start Free Trial
            </Button>
            <Button className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold rounded-lg">
              Learn More
            </Button>
          </div>

          <div className="pt-12 text-sm opacity-75">
            <p>Questions? Contact us at support@ayushman.com</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage