import React from 'react';
import { Award, Calendar, Mail, Shield, ArrowRight, Users, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const GradientText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{children}</span>
);

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
}> = ({ title, description, icon: Icon }) => (
  <div className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 transition group-hover:opacity-100" />
    <div className="relative">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold">
              C
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">CertGen</span>
          </Link>
          <nav className="hidden gap-6 text-sm text-gray-600 md:flex">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#how" className="hover:text-gray-900">How it works</a>
            <a href="#contact" className="hover:text-gray-900">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <LogIn className="h-4 w-4" /> Admin Login
            </Link>
            <Link
              to="/participate"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95"
            >
              Participate Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-gray-50" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Celebrate Achievements with <GradientText>Beautiful Certificates</GradientText>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Join events, track your participation, and download verified certificates in seconds. Designed for a smooth participant experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/participate"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-white shadow-md hover:opacity-95"
              >
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-gray-700 hover:bg-gray-50"
              >
                Learn More
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> Verified Certificates</div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-purple-600" /> Trusted by Organizers</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-blue-200/40 blur-2xl" />
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-purple-200/40 blur-2xl" />
            <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
              <div className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-0.5">
                <div className="rounded-xl bg-white p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Calendar className="h-4 w-4 text-blue-600" /> Upcoming Event
                      </div>
                      <p className="text-sm text-gray-600">Hackathon 2025 • Aug 30</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Award className="h-4 w-4 text-purple-600" /> Your Certificates
                      </div>
                      <p className="text-sm text-gray-600">3 certificates available</p>
                    </div>
                    <div className="col-span-2 rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Mail className="h-4 w-4 text-blue-600" /> Email Delivery
                      </div>
                      <p className="text-sm text-gray-600">Get certificates directly in your inbox</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Designed for <GradientText>Participants</GradientText>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Everything you need to register, participate, and receive your certificate without hassle.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Quick Registration"
            description="Join events in a few clicks and keep track of your participation."
            icon={Calendar}
          />
          <FeatureCard
            title="Instant Certificates"
            description="Download professionally designed certificates as soon as they’re issued."
            icon={Award}
          />
          <FeatureCard
            title="Secure & Verified"
            description="Each certificate is uniquely generated and verifiable by organizers."
            icon={Shield}
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <h3 className="text-2xl font-bold text-gray-900">How it works</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {["Register for an event", "Participate and get verified", "Receive and download your certificate"].map((step, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                  {i + 1}
                </div>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} CertGen. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <a href="mailto:support@example.com" className="hover:text-gray-900">support@example.com</a>
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
