"use client"
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Sparkles, Zap, MessageCircle, Shield, Menu, X, ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-dating.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '/pricing' },
  ];

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) {
      // Smooth scroll to section
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate to different page
      router.push(href);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b-brutal border-foreground bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <Heart className="w-8 h-8 fill-primary text-primary" />
              <h1 className="text-2xl font-display font-bold">Sparkle</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="text-sm font-semibold hover:text-primary transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="flex gap-3 items-center">
              <ThemeToggle />
              <div className="hidden md:flex gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push('/auth')}>Login</Button>
                <Button variant="default" size="sm" onClick={() => router.push('/auth')}>Sign Up</Button>
              </div>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-foreground/20">
              <div className="flex flex-col gap-3 mt-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className="text-left text-sm font-semibold hover:text-primary transition-colors py-2"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-foreground/20">
                  <Button variant="ghost" size="sm" onClick={() => router.push('/auth')} className="justify-start">
                    Login
                  </Button>
                  <Button variant="default" size="sm" onClick={() => router.push('/auth')} className="justify-start">
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-accent border-brutal border-foreground px-4 py-2 rotate-[-2deg] shadow-brutal-sm">
              <span className="font-bold text-sm">💫 Over 1M+ Matches Made</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-bold leading-tight">
              Find Your <span className="text-primary">Perfect</span> Match
            </h2>
            <p className="text-xl text-muted-foreground font-semibold">
              The bold new way to meet people. Swipe right on your future with Sparkle - where real connections happen.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="default" size="lg" onClick={() => router.push('/auth')}>
                Get Started Free
              </Button>
              <Button variant="secondary" size="lg" onClick={() => router.push('/auth')}>
                Sign In
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-3xl font-display font-bold">10M+</p>
                <p className="text-sm text-muted-foreground font-semibold">Active Users</p>
              </div>
              <div>
                <p className="text-3xl font-display font-bold">98%</p>
                <p className="text-sm text-muted-foreground font-semibold">Success Rate</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="border-brutal border-foreground shadow-brutal-lg overflow-hidden rounded-lg rotate-[2deg]">
              <Image src={heroImage} alt="Dating app illustration" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-primary/5 border-y-brutal border-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Why Choose <span className="text-primary">Sparkle?</span>
            </h3>
            <p className="text-xl text-muted-foreground font-semibold max-w-2xl mx-auto">
              We&apos;re not just another dating app. We&apos;re here to help you find genuine connections.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              bgColor="bg-secondary"
              title="Smart Matching"
              description="Our AI-powered algorithm finds people who truly match your vibe."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8" />}
              bgColor="bg-accent"
              title="Safe & Secure"
              description="Verified profiles and robust privacy controls keep you protected."
            />
            <FeatureCard 
              icon={<MessageCircle className="w-8 h-8" />}
              bgColor="bg-primary"
              title="Fun Conversations"
              description="Ice breakers and prompts make starting conversations easy."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h3 className="text-4xl md:text-5xl font-display font-bold mb-4">
            How It <span className="text-primary">Works</span>
          </h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard 
            number="1"
            title="Create Profile"
            description="Set up your profile in minutes with photos and fun prompts."
          />
          <StepCard 
            number="2"
            title="Start Swiping"
            description="Browse through profiles and swipe right on people you like."
          />
          <StepCard 
            number="3"
            title="Make Connections"
            description="Match, chat, and meet up for coffee or virtual dates."
          />
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-secondary/20 border-y-brutal border-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Real Love <span className="text-primary">Stories</span>
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="Met my soulmate on Sparkle after just 2 weeks! The matching algorithm really works."
              name="Sarah & Mike"
              color="bg-primary"
            />
            <TestimonialCard 
              quote="Best dating app I've used. The people are real and the conversations actually flow!"
              name="Alex K."
              color="bg-accent"
            />
            <TestimonialCard 
              quote="Finally, a dating app that doesn't feel like work. Fun, easy, and I met amazing people!"
              name="Jamie L."
              color="bg-secondary"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="bg-primary border-brutal border-foreground shadow-brutal-lg rounded-lg p-12 text-center rotate-[-1deg]">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary-foreground" />
          <h3 className="text-4xl md:text-5xl font-display font-bold mb-4 text-primary-foreground">
            Ready to Find Your Match?
          </h3>
          <p className="text-xl mb-8 text-primary-foreground font-semibold max-w-2xl mx-auto">
            Join millions of people finding love on Sparkle. Your perfect match is waiting!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="secondary" size="lg" onClick={() => router.push('/auth')}>
              Get Started Now
            </Button>
            <Button variant="outline" size="lg" className="bg-card" onClick={() => router.push('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-brutal border-foreground bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 fill-primary text-primary" />
                <h4 className="text-xl font-display font-bold">Sparkle</h4>
              </div>
              <p className="text-sm text-muted-foreground font-semibold">
                Making meaningful connections happen, one swipe at a time.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-3">Product</h5>
              <ul className="space-y-2 text-sm text-muted-foreground font-semibold">
                <li>Features</li>
                <li>Pricing</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-3">Company</h5>
              <ul className="space-y-2 text-sm text-muted-foreground font-semibold">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-3">Legal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground font-semibold">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Support</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t-brutal border-foreground text-center text-sm text-muted-foreground font-semibold">
            © 2025 Sparkle. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
interface FeatureCardProps {
  icon: React.ReactNode;
  bgColor: string;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, bgColor, title, description }: FeatureCardProps) => (
  <Card className={`${bgColor} border-brutal border-foreground shadow-brutal p-8 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`}>
    <div className="mb-4">{icon}</div>
    <h4 className="text-2xl font-display font-bold mb-3">{title}</h4>
    <p className="text-foreground/80 font-semibold">{description}</p>
  </Card>
);

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard = ({ number, title, description }: StepCardProps) => (
  <div className="text-center">
    <div className="inline-block bg-primary border-brutal border-foreground shadow-brutal w-16 h-16 rounded-full flex items-center justify-center mb-4">
      <span className="text-3xl font-display font-bold text-primary-foreground">{number}</span>
    </div>
    <h4 className="text-2xl font-display font-bold mb-3">{title}</h4>
    <p className="text-muted-foreground font-semibold">{description}</p>
  </div>
);

interface TestimonialCardProps {
  quote: string;
  name: string;
  color: string;
}

const TestimonialCard = ({ quote, name, color }: TestimonialCardProps) => (
  <Card className={`${color} border-brutal border-foreground shadow-brutal p-6 rotate-[1deg] hover:rotate-0 transition-transform`}>
    <p className="text-lg font-semibold mb-4 text-foreground">&quot;{quote}&quot;</p>
    <p className="font-bold text-foreground">— {name}</p>
  </Card>
);
