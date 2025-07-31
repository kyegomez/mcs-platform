import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Heart, 
  Brain, 
  Shield, 
  Clock, 
  Users, 
  Stethoscope, 
  TrendingUp, 
  MessageSquare,
  FileText,
  Bell,
  Zap,
  Globe,
  Award,
  Target,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Healthcare",
      description: "Advanced AI specialists provide personalized medical advice and health insights tailored to your unique needs."
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Intelligent Chat System",
      description: "Converse with specialized AI health agents that understand your medical history and provide contextual guidance."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Smart Health Notes",
      description: "Automatically organize and analyze your health information with AI-powered note-taking and insights."
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Proactive Reminders",
      description: "Never miss medication, appointments, or health goals with intelligent reminder systems."
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Health Analytics",
      description: "Track your health journey with detailed analytics and personalized recommendations for improvement."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Privacy & Security",
      description: "Your health data is protected with enterprise-grade security and complete privacy compliance."
    }
  ]

  const benefits = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "24/7 Availability",
      description: "Get health guidance anytime, anywhere"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Personalized Care",
      description: "Tailored advice based on your unique health profile"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Insights",
      description: "Immediate analysis and recommendations"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Expert Knowledge",
      description: "Access to vast medical knowledge databases"
    }
  ]

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Profile",
      description: "Set up your comprehensive health profile with medical history, conditions, and goals."
    },
    {
      step: "2", 
      title: "Connect with AI Specialists",
      description: "Choose from various AI health specialists tailored to your specific needs and conditions."
    },
    {
      step: "3",
      title: "Get Personalized Guidance",
      description: "Receive intelligent health advice, track progress, and optimize your wellness journey."
    },
    {
      step: "4",
      title: "Achieve Better Health",
      description: "Follow data-driven recommendations to reach your health goals and live your best life."
    }
  ]

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-foreground/[0.02] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,122,255,0.03)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(0,112,243,0.03)_0%,transparent_50%)]" />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 page-transition">
        <div className="max-w-6xl mx-auto text-center">
          <div className="spring-bounce">
            <Badge className="mb-8 px-6 py-3 glass-card text-foreground/90 border-border/20 hover:border-border/40 transition-all duration-300">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              The Future of Healthcare
            </Badge>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-semibold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent mb-8 leading-tight tracking-tight spring-bounce">
            Modern Care System
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-4xl mx-auto leading-relaxed font-light spring-bounce">
            Revolutionizing healthcare with AI-powered personalized medicine. 
            Your intelligent health companion for living an exceptionally healthy life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center spring-bounce">
            <Button size="lg" className="px-10 py-4 text-lg bg-background/10 hover:bg-background/20 border border-border/20 hover:border-border/40 backdrop-blur-xl text-foreground btn-interactive transition-all duration-300">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-10 py-4 text-lg border-border/30 text-foreground/90 hover:bg-background/10 backdrop-blur-xl btn-interactive">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-semibold text-foreground mb-8 tracking-tight">Our Mission</h2>
            <p className="text-xl text-foreground/70 max-w-4xl mx-auto leading-relaxed font-light">
              Empowering every human to live an extraordinarily healthy life through intelligent, 
              personalized healthcare technology that makes expert medical guidance accessible to all.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl card-interactive stagger-item">
              <Heart className="h-14 w-14 mx-auto mb-6 text-red-400" />
              <h3 className="text-xl font-medium text-foreground mb-4 text-center">Democratize Healthcare</h3>
              <p className="text-foreground/70 text-center leading-relaxed">
                Make high-quality healthcare guidance accessible to everyone, regardless of location or economic status.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-3xl card-interactive stagger-item">
              <Brain className="h-14 w-14 mx-auto mb-6 text-blue-400" />
              <h3 className="text-xl font-medium text-foreground mb-4 text-center">Advance Medical AI</h3>
              <p className="text-foreground/70 text-center leading-relaxed">
                Push the boundaries of AI in healthcare to provide more accurate, personalized medical insights.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-3xl card-interactive stagger-item">
              <Globe className="h-14 w-14 mx-auto mb-6 text-green-400" />
              <h3 className="text-xl font-medium text-foreground mb-4 text-center">Global Health Impact</h3>
              <p className="text-foreground/70 text-center leading-relaxed">
                Create a healthier world by enabling preventive care and early intervention at scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-semibold text-foreground mb-8 tracking-tight">How MCS Works</h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed font-light">
              Our AI-powered platform provides personalized healthcare guidance through an intuitive, 
              four-step process designed for optimal health outcomes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center stagger-item">
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto glass-card rounded-full flex items-center justify-center text-2xl font-medium text-foreground border-2 border-border/20">
                    {item.step}
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
                  )}
                </div>
                <h3 className="text-xl font-medium text-foreground mb-4">{item.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-semibold text-foreground mb-8 tracking-tight">Powerful Features</h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed font-light">
              Comprehensive healthcare tools powered by cutting-edge AI technology to support 
              every aspect of your health journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-card p-8 rounded-3xl card-interactive stagger-item">
                <div className="text-blue-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-medium text-foreground mb-4">{feature.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-semibold text-foreground mb-8 tracking-tight">Why Choose MCS?</h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed font-light">
              Experience the advantages of next-generation healthcare technology designed to optimize your health outcomes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-8 rounded-2xl glass hover:bg-accent transition-all duration-300 card-interactive stagger-item">
                <div className="text-blue-400 mb-4 flex justify-center">{benefit.icon}</div>
                <h3 className="text-lg font-medium text-foreground mb-3">{benefit.title}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-semibold text-foreground mb-8 tracking-tight">Impact by Numbers</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-12 text-center">
            <div className="stagger-item">
              <div className="text-5xl md:text-6xl font-light text-foreground mb-4 tracking-tight">99.7%</div>
              <div className="text-foreground/70 text-lg">Accuracy Rate</div>
            </div>
            <div className="stagger-item">
              <div className="text-5xl md:text-6xl font-light text-foreground mb-4 tracking-tight">24/7</div>
              <div className="text-foreground/70 text-lg">Availability</div>
            </div>
            <div className="stagger-item">
              <div className="text-5xl md:text-6xl font-light text-foreground mb-4 tracking-tight">50+</div>
              <div className="text-foreground/70 text-lg">AI Specialists</div>
            </div>
            <div className="stagger-item">
              <div className="text-5xl md:text-6xl font-light text-foreground mb-4 tracking-tight">1M+</div>
              <div className="text-foreground/70 text-lg">Health Insights</div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-semibold text-foreground mb-8 tracking-tight">Advanced Technology</h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed font-light">
              Built on cutting-edge AI and machine learning technologies to provide the most accurate 
              and personalized healthcare guidance available.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-10 rounded-3xl card-interactive stagger-item">
              <Stethoscope className="h-14 w-14 text-blue-400 mb-6" />
              <h3 className="text-xl font-medium text-foreground mb-4">Medical AI Models</h3>
              <p className="text-foreground/70 mb-6 leading-relaxed">
                Proprietary AI models trained on vast medical datasets and continuously updated with the latest research.
              </p>
              <ul className="space-y-3 text-sm text-foreground/60">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-3 text-green-400" />Natural Language Processing</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-3 text-green-400" />Symptom Analysis</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-3 text-green-400" />Drug Interaction Checking</li>
              </ul>
            </div>
            
            <div className="glass-card p-10 rounded-3xl card-interactive stagger-item">
              <Shield className="h-14 w-14 text-green-400 mb-6" />
              <h3 className="text-xl font-medium text-foreground mb-4">Privacy & Security</h3>
              <p className="text-foreground/70 mb-6 leading-relaxed">
                Enterprise-grade security with end-to-end encryption and HIPAA compliance for complete data protection.
              </p>
              <ul className="space-y-3 text-sm text-foreground/60">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-3 text-green-400" />HIPAA Compliant</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-3 text-green-400" />End-to-End Encryption</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-3 text-green-400" />Zero Trust Architecture</li>
              </ul>
            </div>
            
            <div className="glass-card p-10 rounded-3xl card-interactive stagger-item">
              <Award className="h-14 w-14 text-purple-400 mb-6" />
              <h3 className="text-xl font-medium text-foreground mb-4">Evidence-Based</h3>
              <p className="text-foreground/70 mb-6 leading-relaxed">
                All recommendations are based on peer-reviewed medical research and clinical guidelines.
              </p>
              <ul className="space-y-3 text-sm text-foreground/60">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-3 text-green-400" />Clinical Validation</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-3 text-green-400" />Peer-Reviewed Sources</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-3 text-green-400" />Real-Time Updates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-semibold text-foreground mb-8 tracking-tight">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl text-foreground/70 mb-12 leading-relaxed font-light">
            Join thousands of users already living healthier lives with MCS. 
            Start your personalized health journey today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Link href="/chat">
              <Button size="lg" className="px-10 py-4 text-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-xl text-white btn-interactive transition-all duration-300">
                Start Your Health Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="px-10 py-4 text-lg border-white/30 text-white/90 hover:bg-white/10 backdrop-blur-xl btn-interactive">
                View Pricing Plans
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-foreground/50 font-light">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
} 