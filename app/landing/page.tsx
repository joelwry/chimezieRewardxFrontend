"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Coins, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  DollarSign,
  Clock,
  Lock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  Award,
  Target,
  Wallet,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

interface FAQItem {
  question: string
  answer: string
}

interface Testimonial {
  name: string
  role: string
  content: string
  rating: number
  avatar: string
}

interface Benefit {
  icon: any
  title: string
  description: string
}

export default function LandingPage() {
  const router = useRouter()
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const benefits: Benefit[] = [
    {
      icon: Zap,
      title: "Instant Rewards",
      description: "Earn money immediately upon completing tasks. No waiting, no delays."
    },
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "Your funds are protected with bank-level security and encryption."
    },
    {
      icon: TrendingUp,
      title: "High Returns",
      description: "Earn up to 40% returns on investments and lock periods."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of users earning daily rewards together."
    }
  ]

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Freelance Designer",
      content: "I've earned over ₦150,000 in just 3 months! The platform is incredibly user-friendly and the rewards are real.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Student",
      content: "Perfect for students like me. I can earn money while studying. The investment features are amazing!",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Aisha Bello",
      role: "Entrepreneur",
      content: "The best reward platform I've used. Transparent, fast payouts, and excellent customer support.",
      rating: 5,
      avatar: "AB"
    }
  ]

  const faqs: FAQItem[] = [
    {
      question: "Why do I need to activate?",
      answer: "Activation ensures your account is verified and secure. It's a one-time process that takes less than 2 minutes and helps us protect your funds and prevent fraud."
    },
    {
      question: "Is my money safe?",
      answer: "Absolutely! We use bank-level security encryption, secure payment gateways, and your funds are protected by our comprehensive security measures. We've never had a security breach."
    },
    {
      question: "How fast do I earn?",
      answer: "You can start earning immediately! Complete simple tasks and earn rewards instantly. For investments, returns are calculated daily and paid according to your chosen lock period."
    },
    {
      question: "What types of tasks are available?",
      answer: "We offer surveys, video watching, link sharing, deposits, and investment opportunities. New tasks are added daily with varying reward amounts."
    },
    {
      question: "How do I withdraw my earnings?",
      answer: "Withdrawals are processed within 24-48 hours. You can withdraw to your bank account or crypto wallet. Minimum withdrawal is ₦1,000."
    },
    {
      question: "Are there any hidden fees?",
      answer: "No hidden fees! We're transparent about all costs. There are no monthly fees, and withdrawal fees are clearly displayed before you confirm."
    }
  ]

  const stats = [
    { number: "50,000+", label: "Active Users" },
    { number: "₦2.5B+", label: "Total Rewards Paid" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support Available" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Coins className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">RewardX</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
                Testimonials
              </Link>
              <Link href="#faq" className="text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </Link>
              <ThemeToggle />
              <Button variant="outline" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button onClick={() => router.push('/register')}>
                Get Started
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/50">
              <nav className="flex flex-col gap-4">
                <Link 
                  href="#features" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  href="#testimonials" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Testimonials
                </Link>
                <Link 
                  href="#faq" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <div className="flex flex-col gap-2 pt-2">
                  <Button variant="outline" onClick={() => router.push('/login')}>
                    Sign In
                  </Button>
                  <Button onClick={() => router.push('/register')}>
                    Get Started
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge 
              variant="secondary" 
              className="mb-6 animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 50,000+ Users
            </Badge>
            
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              Earn Money While You{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Sleep
              </span>
            </h1>
            
            <p 
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              Complete simple tasks, invest smartly, and watch your money grow. 
              Join thousands of users earning daily rewards on Africa's fastest-growing reward platform.
            </p>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                onClick={() => router.push('/register')}
              >
                Start Earning Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose RewardX?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've built the most user-friendly and profitable reward platform in Africa
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card 
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-fade-in-up bg-background/60 backdrop-blur-sm border border-border/50"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See Your Earnings Grow
            </h2>
            <p className="text-xl text-muted-foreground">
              Track your progress with our intuitive dashboard
            </p>
          </div>
          
          <div className="relative max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Real-time Tracking</h3>
                    <p className="text-muted-foreground">Watch your balance grow in real-time</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Smart Analytics</h3>
                    <p className="text-muted-foreground">Detailed insights into your earning patterns</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Achievement System</h3>
                    <p className="text-muted-foreground">Unlock bonuses and special rewards</p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <Card className="p-6 bg-background/80 backdrop-blur-sm border border-border/50 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Dashboard Overview</h3>
                      <Badge variant="secondary">Live</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-green-500/10">
                        <div className="text-2xl font-bold text-green-600">₦45,250</div>
                        <div className="text-sm text-muted-foreground">Total Balance</div>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-500/10">
                        <div className="text-2xl font-bold text-blue-600">₦12,800</div>
                        <div className="text-sm text-muted-foreground">This Month</div>
                      </div>
                    </div>
                    
                    <div className="h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-lg font-semibold">Earnings Chart</div>
                        <div className="text-sm opacity-90">Visual representation of your growth</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied users earning daily
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-fade-in-up bg-background/60 backdrop-blur-sm border border-border/50"
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about RewardX
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-all duration-200 animate-fade-in-up bg-background/60 backdrop-blur-sm border border-border/50"
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <div className={`transition-transform duration-300 ${activeFAQ === index ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <CardContent className="pt-0 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who are already earning daily rewards. 
              It only takes 2 minutes to get started.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                onClick={() => router.push('/register')}
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free to join • Start earning immediately
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Coins className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">RewardX</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Africa's fastest-growing reward platform
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
              <Link href="/support" className="hover:text-primary">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 