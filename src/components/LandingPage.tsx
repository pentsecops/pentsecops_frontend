import { Button } from './ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, FileText, BarChart3, Users, Lock, Zap, Check, ArrowRight, Activity, X, Globe } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useState, useRef } from 'react';
import originalLogo from '../assets/7229b0821d8e9c8aaa09c785bc1c544e3bbd5c83.png';
import logoImage from '../assets/logo.png';

export function LandingPage() {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organisation: '',
    query: ''
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect with backend
    console.log('Form submitted:', formData);
    alert('Thank you for your inquiry! We will get back to you soon.');
    setIsContactFormOpen(false);
    setFormData({ name: '', email: '', organisation: '', query: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-900 relative overflow-hidden">
      {/* Clean Parallax Background */}
      <motion.div
        style={{ y: backgroundY }}
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-300/5 to-blue-300/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </motion.div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-gray-200/60 shadow-sm">
        <div className="container mx-auto px-6 lg:px-8 py-4 flex items-center justify-between max-w-7xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <Shield className="w-8 h-8 text-cyan-600" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              PentSecOps
            </span>
          </motion.div>

          {/* Navigation Links */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-6"
          >
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-700 hover:text-cyan-600 font-semibold transition-colors duration-200 text-base"
            >
              About Us
            </button>
            <button
              onClick={() => setIsContactFormOpen(true)}
              className="text-gray-700 hover:text-cyan-600 font-semibold transition-colors duration-200 text-base"
            >
              Contact Us
            </button>
            <a
              href="/log-in"
              className="px-6 py-2.5 !bg-black hover:!bg-gray-800 !text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-base"
            >
              Login
            </a>
          </motion.nav>
        </div>
      </header>

      <div className="relative z-10">
        {/* Hero Section - Enhanced Design */}
        <section className="container mx-auto px-6 lg:px-8 py-16 lg:py-24 min-h-[calc(100vh-80px)] flex items-center max-w-7xl relative">
          {/* Clean Floating Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ y: [-20, 20, -20] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl opacity-20 blur-sm"
            />
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/3 left-1/4 w-8 h-8 border-2 border-cyan-300 rounded-lg opacity-20"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
            {/* Left - Enhanced Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8 relative z-10"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-full text-sm border border-cyan-200 shadow-lg backdrop-blur-sm"
                >
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="font-medium">Advanced Security Tracking Operations</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="text-5xl lg:text-7xl font-black leading-tight relative"
                >
                  <span className="bg-gradient-to-r from-gray-900 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    PentSecOps
                  </span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mt-2 rounded-full"
                  />
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                  className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg"
                >
                  Comprehensive penetration testing operations platform for
                  <span className="font-semibold text-cyan-600"> streamlined vulnerability management</span> and
                  <span className="font-semibold text-blue-600"> team collaboration</span>
                </motion.p>
              </div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="grid grid-cols-3 gap-4 py-6"
              >
                {[
                  { number: "99.9%", label: "Uptime", color: "from-green-500 to-emerald-500" },
                  { number: "<2min", label: "Response", color: "from-cyan-500 to-blue-500" },
                  { number: "24/7", label: "Support", color: "from-purple-500 to-pink-500" }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <Button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-6 shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-300 hover:bg-gray-50 hover:border-cyan-400 text-gray-900 px-8 py-6 transition-all duration-300 group"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Contact Support
                  <motion.div
                    className="w-2 h-2 bg-cyan-500 rounded-full ml-2 opacity-0 group-hover:opacity-100"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </Button>
              </motion.div>

              {/* Enhanced Feature badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="flex flex-wrap items-center gap-4 pt-4"
              >
                {[
                  { text: 'Multi-role dashboards', icon: Users },
                  { text: 'SLA compliance tracking', icon: BarChart3 },
                  { text: 'Secure file storage', icon: Lock }
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-3 text-sm text-gray-700 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 hover:border-cyan-300 transition-all duration-300 group"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Enhanced Logo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="relative lg:h-[600px] h-[400px] flex items-center justify-center"
            >
              {/* Animated rings around logo */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-cyan-200 rounded-full opacity-30"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-8 border border-blue-200 rounded-full opacity-20"
              />

              {/* Logo container with hover effects */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full flex items-center justify-center p-8 group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/50 to-blue-100/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                <img
                  src={originalLogo}
                  alt="PentSecOps Logo"
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                />

                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [-10, 10, -10],
                      x: [-5, 5, -5],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5
                    }}
                    className={`absolute w-2 h-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full`}
                    style={{
                      top: `${20 + i * 10}%`,
                      left: `${15 + i * 12}%`
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" className="bg-gradient-to-b from-white to-gray-50 py-20 lg:py-28">
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-black mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Core Features
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Everything you need to manage penetration testing operations efficiently
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Role-Based Access',
                  description: 'Secure dashboards for Admins, Pentesters, and Stakeholders with granular permissions',
                  gradient: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: FileText,
                  title: 'Report Management',
                  description: 'Streamlined report submission, review, and distribution workflow',
                  gradient: 'from-cyan-500 to-teal-500'
                },
                {
                  icon: BarChart3,
                  title: 'Vulnerability Tracking',
                  description: 'Comprehensive vulnerability management with severity tagging and SLA monitoring',
                  gradient: 'from-purple-500 to-pink-500'
                },
                {
                  icon: Users,
                  title: 'Team Collaboration',
                  description: 'Efficient task assignment and internal communication between team members',
                  gradient: 'from-pink-500 to-rose-500'
                },
                {
                  icon: Lock,
                  title: 'Compliance Monitoring',
                  description: 'Track SLA agreements, MTTD, MTTR metrics, and overdue vulnerabilities',
                  gradient: 'from-orange-500 to-amber-500'
                },
                {
                  icon: Zap,
                  title: 'Real-Time Updates',
                  description: 'Instant notifications and alerts for critical security events',
                  gradient: 'from-green-500 to-emerald-500'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <Card className="bg-white border-2 border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 h-full group relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    <CardHeader className="relative z-10">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                        className={`w-14 h-14 mb-4 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <feature.icon className="w-7 h-7 text-white" />
                      </motion.div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Section - Fixed Alignment */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-black mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Why Choose PentSecOps?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl">
                Built for modern security teams who need efficient collaboration and comprehensive visibility
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-12 items-start">
              {/* Left column - Benefits */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {[
                  'Reduce admin time by 30-40% with automated workflows',
                  'Centralized vulnerability management and tracking',
                  'Bridge technical-business communication gap',
                  'Scalable solution for growing security teams',
                  'Comprehensive audit trails and activity logging'
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 text-lg leading-relaxed">{benefit}</span>
                  </motion.div>
                ))}


              </motion.div>

              {/* Middle column - Market Impact */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex justify-center"
              >
                <Card className="bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 border-2 border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 max-w-sm w-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Market Impact</h3>

                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="group text-center"
                    >
                      <div className="text-4xl font-black mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent group-hover:from-cyan-500 group-hover:to-blue-500 transition-all">
                        $2.1B
                      </div>
                      <p className="text-gray-600 text-sm">Global pentest market size</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="group text-center"
                    >
                      <div className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-pink-500 transition-all">
                        15%
                      </div>
                      <p className="text-gray-600 text-sm">Annual growth rate (CAGR)</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="group text-center"
                    >
                      <div className="text-4xl font-black mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:from-green-500 group-hover:to-emerald-500 transition-all">
                        30-40%
                      </div>
                      <p className="text-gray-600 text-sm">Time saved on admin tasks</p>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>

              {/* Right column - Security Analytics Dashboard */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center justify-center"
              >
                <div className="relative w-full max-w-sm h-80 bg-gradient-to-br from-white via-gray-50 to-cyan-50 rounded-2xl p-6 overflow-hidden border-2 border-gray-200 shadow-2xl">
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `
                        radial-gradient(circle at 25% 25%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
                      `
                    }} />
                  </div>

                  {/* Header */}
                  <div className="relative z-10 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <Shield className="w-5 h-5 text-cyan-600" />
                      </motion.div>
                      <h4 className="text-lg font-bold text-gray-900">Security Analytics</h4>
                    </div>
                    <p className="text-sm text-gray-600">Real-time monitoring dashboard</p>
                  </div>

                  {/* Animated metrics */}
                  <div className="relative z-10 space-y-4">
                    {[
                      { label: 'Vulnerabilities Detected', value: '247', color: 'text-red-600', bg: 'bg-red-100' },
                      { label: 'Security Score', value: '94%', color: 'text-green-600', bg: 'bg-green-100' },
                      { label: 'Active Scans', value: '12', color: 'text-blue-600', bg: 'bg-blue-100' },
                      { label: 'Compliance Status', value: '98%', color: 'text-cyan-600', bg: 'bg-cyan-100' }
                    ].map((metric, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                            className={`w-3 h-3 rounded-full ${metric.bg} border-2 border-white shadow-sm`}
                          />
                          <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                        </div>
                        <motion.span
                          animate={{
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                          className={`text-lg font-bold ${metric.color}`}
                        >
                          {metric.value}
                        </motion.span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bottom status bar */}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg border border-cyan-200">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2 h-2 bg-green-500 rounded-full"
                        />

                      </div>

                    </div>
                  </div>

                  {/* Floating data points */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [-10, 10, -10],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.4
                      }}
                      className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-40"
                      style={{
                        top: `${20 + i * 10}%`,
                        right: `${10 + i * 5}%`
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24 lg:py-32 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white">
                Ready to Transform Your <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Security Operations?
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                Join the future of penetration testing management
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-gray-500 hover:bg-white/10 hover:border-gray-400 text-white px-10 py-7 transition-all duration-300 text-lg"
                  onClick={() => setIsContactFormOpen(true)}
                  id="contact"
                >
                  Contact Us
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 py-12 lg:py-16">
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <div className="grid md:grid-cols-4 gap-10 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-7 h-7 text-cyan-500" />
                  <span className="text-lg font-bold text-white">PentSecOps</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Comprehensive penetration testing operations platform
                </p>
              </div>

              <div>
                <h4 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Product</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">Features</li>
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">Pricing</li>
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">Security</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Company</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">About</li>
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">Blog</li>
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">Careers</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Support</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">Documentation</li>
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">Contact</li>
                  <li className="hover:text-cyan-400 cursor-pointer transition-colors">Status</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
              <p>&copy; 2025 PentSecOps. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Contact Form Modal */}
      {isContactFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Contact Us</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsContactFormOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="your.email@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="organisation" className="block text-sm font-medium text-gray-700 mb-1">
                    Organisation Name *
                  </label>
                  <input
                    type="text"
                    id="organisation"
                    name="organisation"
                    required
                    value={formData.organisation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                    Query *
                  </label>
                  <textarea
                    id="query"
                    name="query"
                    required
                    rows={4}
                    value={formData.query}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    placeholder="Please describe your inquiry..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsContactFormOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
