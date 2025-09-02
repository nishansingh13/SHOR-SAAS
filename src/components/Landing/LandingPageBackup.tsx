import React, { useEffect } from 'react';
import { Award, Calendar, Mail, Shield, ArrowRight, Users, LogIn, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Particle Background Component
const ParticleBackground: React.FC = () => {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.width = Math.random() * 4 + 2 + 'px';
      particle.style.height = particle.style.width;
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
      
      const container = document.querySelector('.particles-bg');
      if (container) {
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 15000);
      }
    };

    const interval = setInterval(createParticle, 300);
    return () => clearInterval(interval);
  }, []);

  return <div className="particles-bg" />;
};

const GradientText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-gradient-to-r from-emerald-600 to-blue-700 bg-clip-text text-transparent font-bold">{children}</span>
);

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleOnHover = {
  whileHover: { scale: 1.05, transition: { duration: 0.2 } },
  whileTap: { scale: 0.95 }
};

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
}> = ({ title, description, icon: Icon }) => (
  <motion.div 
    className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-emerald-200"
    {...scaleOnHover}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
  >
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-blue-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative">
      <motion.div 
        className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-blue-700 text-white shadow-lg"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        <Icon className="h-7 w-7" />
      </motion.div>
      <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const LandingPage: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Top Nav */}
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center group">
            <motion.div 
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-blue-700 text-white flex items-center justify-center font-bold shadow-lg group-hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              S
            </motion.div>
            <span className="ml-3 text-2xl font-bold text-gray-900">SETU</span>
            <span className="ml-2 text-sm font-medium text-gray-500">Certificate Platform</span>
          </Link>
          <nav className="hidden gap-8 text-sm font-medium text-gray-600 md:flex">
            <motion.a 
              href="#features" 
              className="hover:text-emerald-600 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Features
            </motion.a>
            <motion.a 
              href="#how" 
              className="hover:text-emerald-600 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              How it works
            </motion.a>
            <motion.a 
              href="#stats" 
              className="hover:text-emerald-600 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Success Stories
            </motion.a>
            <motion.a 
              href="#contact" 
              className="hover:text-emerald-600 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Contact
            </motion.a>
          </nav>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <LogIn className="h-4 w-4" /> Admin Portal
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/participate"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-blue-800 transition-all"
              >
                Join Events <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <ParticleBackground />
        <div className="absolute inset-0 -z-10">
          <motion.div 
            className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2 
            }}
          />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28 lg:py-32">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-4">
              <motion.div 
                className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Award className="h-4 w-4" />
                Professional Certificate Platform
              </motion.div>
              <motion.h1 
                className="text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Elevate Your 
                <br />
                <GradientText>Learning Journey</GradientText>
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-600 leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Join prestigious events, showcase your achievements, and receive professionally verified certificates that advance your career.
              </motion.p>
            </div>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/participate"
                  className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1 button-shine animate-pulse-glow"
                >
                  <motion.span
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    Start Your Journey
                  </motion.span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="#features"
                  className="inline-flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-emerald-200 transition-all duration-300"
                >
                  Explore Features
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              className="flex items-center gap-8 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <motion.div 
                className="flex items-center gap-2 text-gray-600"
                whileHover={{ scale: 1.05 }}
              >
                <Shield className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">Blockchain Verified</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 text-gray-600"
                whileHover={{ scale: 1.05 }}
              >
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">10,000+ Participants</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 text-gray-600"
                whileHover={{ scale: 1.05 }}
              >
                <Award className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Industry Recognized</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          >
            {/* Decorative elements */}
            <motion.div 
              className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.7, 0.4] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl"
              animate={{ 
                scale: [1.3, 1, 1.3],
                opacity: [0.7, 0.4, 0.7] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1.5 
              }}
            />
            
            {/* Main Certificate Mockup */}
            <motion.div 
              className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl"
              initial={{ rotate: 2, scale: 0.9 }}
              animate={{ 
                rotate: 2, 
                scale: 1,
                y: [-10, 10, -10]
              }}
              whileHover={{ rotate: 0, scale: 1.02, y: 0 }}
              transition={{ 
                rotate: { duration: 0.5 },
                scale: { duration: 0.5 },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-600/5 to-blue-700/5" />
              <div className="relative">
                {/* Certificate Header */}
                <div className="text-center border-b border-gray-100 pb-6 mb-6">
                  <motion.div 
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-blue-700 px-4 py-2 text-white font-semibold mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, duration: 0.5, type: "spring" }}
                  >
                    <Award className="h-5 w-5" />
                    CERTIFICATE OF ACHIEVEMENT
                  </motion.div>
                  <motion.h3 
                    className="text-2xl font-bold text-gray-900"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                  >
                    SETU Platform
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                  >
                    Professional Learning Verification
                  </motion.p>
                </div>

                {/* Certificate Body */}
                <div className="text-center space-y-4">
                  <motion.p 
                    className="text-gray-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.4 }}
                  >
                    This certifies that
                  </motion.p>
                  <motion.div 
                    className="text-3xl font-bold text-gray-900 border-b-2 border-emerald-600 pb-2 mb-4 inline-block"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.8, duration: 0.6, type: "spring" }}
                  >
                    John Doe
                  </motion.div>
                  <motion.p 
                    className="text-gray-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0, duration: 0.4 }}
                  >
                    has successfully completed
                  </motion.p>
                  <motion.div 
                    className="text-xl font-semibold text-emerald-700 mb-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2, duration: 0.5 }}
                  >
                    Advanced Web Development Workshop
                  </motion.div>
                  <motion.p 
                    className="text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.4, duration: 0.4 }}
                  >
                    on September 15, 2025
                  </motion.p>
                </div>

                {/* Certificate Footer */}
                <motion.div 
                  className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.6, duration: 0.5 }}
                >
                  <div className="text-left">
                    <div className="w-24 border-t-2 border-gray-900 mb-2"></div>
                    <p className="text-sm text-gray-600">Authorized Signature</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Certificate ID: SETU-2025-001</p>
                    <p className="text-xs text-gray-500">Verified by SETU Platform</p>
                  </div>
                </motion.div>
              </div>

              {/* Floating stats */}
              <motion.div 
                className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg border border-gray-100 p-3"
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 2.8, duration: 0.5, type: "spring" }}
              >
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-semibold">Verified</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div 
              className="absolute top-8 -left-6 bg-white rounded-lg shadow-lg border border-gray-100 p-4 transform -rotate-6"
              initial={{ opacity: 0, x: -50, rotate: -20 }}
              animate={{ opacity: 1, x: 0, rotate: -6 }}
              transition={{ delay: 1.5, duration: 0.6, type: "spring" }}
              whileHover={{ rotate: 0, scale: 1.05 }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Live Events</p>
                  <p className="text-xs text-gray-600">15 ongoing</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-8 -right-6 bg-white rounded-lg shadow-lg border border-gray-100 p-4 transform rotate-6"
              initial={{ opacity: 0, x: 50, rotate: 20 }}
              animate={{ opacity: 1, x: 0, rotate: 6 }}
              transition={{ delay: 1.8, duration: 0.6, type: "spring" }}
              whileHover={{ rotate: 0, scale: 1.05 }}
            >
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Instant Delivery</p>
                  <p className="text-xs text-gray-600">Email + Download</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="text-center space-y-4 mb-16" data-aos="fade-up">
          <motion.div 
            className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Shield className="h-4 w-4" />
            Why Choose SETU
          </motion.div>
          <motion.h2 
            className="text-4xl font-bold text-gray-900 md:text-5xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Built for <GradientText>Excellence</GradientText>
          </motion.h2>
          <motion.p 
            className="mx-auto max-w-3xl text-xl text-gray-600 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Experience seamless event participation with industry-leading certificate generation and verification technology.
          </motion.p>
        </div>

        <motion.div 
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <FeatureCard
            title="Smart Registration"
            description="Effortless event registration with real-time availability tracking and instant confirmation notifications."
            icon={Calendar}
          />
          <FeatureCard
            title="Premium Certificates"
            description="Professionally designed, customizable certificates with blockchain verification and anti-fraud protection."
            icon={Award}
          />
          <FeatureCard
            title="Instant Delivery"
            description="Automated email delivery with downloadable PDFs and shareable digital credentials for LinkedIn."
            icon={Mail}
          />
          <FeatureCard
            title="Enterprise Security"
            description="Bank-grade security with encrypted data storage and tamper-proof certificate generation."
            icon={Shield}
          />
          <FeatureCard
            title="Global Recognition"
            description="Certificates accepted by leading institutions and employers worldwide for career advancement."
            icon={Users}
          />
          <FeatureCard
            title="24/7 Support"
            description="Round-the-clock technical support and customer service for all your certification needs."
            icon={LogIn}
          />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white" data-aos="fade-up">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold md:text-4xl mb-4">
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
              Join thousands of learners who have advanced their careers with SETU certificates
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { value: "50K+", label: "Certificates Issued", delay: 0.1 },
              { value: "500+", label: "Events Hosted", delay: 0.2 },
              { value: "98%", label: "Satisfaction Rate", delay: 0.3 },
              { value: "24/7", label: "Support Available", delay: 0.4 }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: stat.delay }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="text-4xl md:text-5xl font-bold mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: stat.delay + 0.2,
                    type: "spring",
                    bounce: 0.4
                  }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-emerald-100 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Calendar className="h-4 w-4" />
              Simple Process
            </motion.div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Certified in <GradientText>3 Easy Steps</GradientText>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process ensures you can focus on learning while we handle the certification
            </p>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Discover & Register",
                description: "Browse available events and register with just your email. Get instant confirmation and event details.",
                icon: Calendar,
                color: "from-blue-600 to-blue-700"
              },
              {
                step: "2", 
                title: "Participate & Excel",
                description: "Attend the event, complete requirements, and get verified by organizers through our secure system.",
                icon: Users,
                color: "from-emerald-600 to-emerald-700"
              },
              {
                step: "3",
                title: "Receive Certificate",
                description: "Download your professional certificate instantly via email or directly from your participant portal.",
                icon: Award,
                color: "from-yellow-500 to-yellow-600"
              }
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={i} 
                  className="relative"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  viewport={{ once: true }}
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                >
                  {/* Connection line for desktop */}
                  {i < 2 && (
                    <motion.div 
                      className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent z-0"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: (i * 0.2) + 0.5 }}
                      viewport={{ once: true }}
                    />
                  )}
                  
                  <motion.div 
                    className="relative bg-white rounded-2xl border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    whileHover={{ y: -5 }}
                  >
                    <motion.div 
                      className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${step.color} text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {step.step}
                    </motion.div>
                    <div className="mb-4 flex items-center gap-3">
                      <Icon className="h-6 w-6 text-gray-700" />
                      <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <motion.div 
            className="rounded-3xl bg-gradient-to-r from-emerald-600 to-blue-700 p-12 md:p-16 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            data-aos="zoom-in"
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to Start Your Learning Journey?
            </motion.h2>
            <motion.p 
              className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join thousands of professionals who trust SETU for their certification needs. 
              Start participating in events and building your credential portfolio today.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/participate"
                  className="inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-emerald-700 shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Browse Events <Calendar className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-3 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white hover:bg-white/20 transition-all duration-300"
                >
                  Organization Portal <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Footer Content */}
          <motion.div 
            className="grid gap-8 md:grid-cols-4 mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            data-aos="fade-up"
          >
            {/* Brand */}
            <div className="md:col-span-2">
              <motion.div 
                className="flex items-center mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-blue-700 text-white flex items-center justify-center font-bold"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  S
                </motion.div>
                <span className="ml-3 text-2xl font-bold">SETU</span>
              </motion.div>
              <motion.p 
                className="text-gray-300 mb-4 max-w-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Empowering professionals through verified learning experiences and industry-recognized certifications.
              </motion.p>
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-2 text-emerald-400">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Enterprise Grade Security</span>
                </div>
              </motion.div>
            </div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-300">
                <motion.li whileHover={{ x: 5 }}><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></motion.li>
                <motion.li whileHover={{ x: 5 }}><a href="#how" className="hover:text-emerald-400 transition-colors">How it Works</a></motion.li>
                <motion.li whileHover={{ x: 5 }}><Link to="/participate" className="hover:text-emerald-400 transition-colors">Browse Events</Link></motion.li>
                <motion.li whileHover={{ x: 5 }}><Link to="/login" className="hover:text-emerald-400 transition-colors">Admin Portal</Link></motion.li>
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <motion.li whileHover={{ x: 5 }}><a href="mailto:support@setu.com" className="hover:text-emerald-400 transition-colors">Contact Support</a></motion.li>
                <motion.li whileHover={{ x: 5 }}><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></motion.li>
                <motion.li whileHover={{ x: 5 }}><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></motion.li>
                <motion.li whileHover={{ x: 5 }}><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></motion.li>
              </ul>
            </motion.div>
          </motion.div>

          {/* Footer Bottom */}
          <motion.div 
            className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400">© {new Date().getFullYear()} SETU Platform. All rights reserved.</p>
            <motion.div 
              className="flex items-center gap-6 text-gray-400"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm">Made with ❤️ for learners worldwide</span>
            </motion.div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
