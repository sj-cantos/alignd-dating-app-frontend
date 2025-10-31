'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Heart, MessageCircle, Shield, Sparkles, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import heroImage from '../../public/hero-dating.jpg'
import { Card } from '@/components/ui/card';
export default function Home() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Check if profile is complete
        if (user?.isProfileComplete) {
          router.push('/discover');
        } else {
          router.push('/setup');
        }
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, user?.isProfileComplete, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Navigation */}
      <div className="p-2">
        <nav className="bg-pink-400 border-brutal border-foreground shadow-brutal mx-auto max-w-7xl">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
              <div className="bg-primary border-2 border-foreground p-2 shadow-brutal-sm transition-all duration-300 group-hover:shadow-brutal group-hover:-translate-x-1 group-hover:-translate-y-1">
                <Heart className="w-6 h-6 fill-background text-background" />
              </div>
              <h1 className="text-2xl font-display font-bold transition-colors duration-300 group-hover:text-primary">Charmed</h1>
            </div>
            <div className="flex gap-3 items-center">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/auth')}
                className="border-2 border-foreground shadow-brutal-sm hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 bg-background"
              >
                Login
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => router.push('/auth')}
                className="border-2 border-foreground shadow-brutal-sm hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 bg-primary text-background"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-block bg-accent border-brutal border-foreground px-4 py-2 shadow-brutal-sm">
              <span className="font-bold text-sm">💫 Over 1M+ Matches Made</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-bold leading-tight">
              Find Your <span className="text-primary">Perfect</span> Match
            </h2>
            <p className="text-xl text-muted-foreground font-semibold">
              The bold new way to meet people. Swipe right on your future with Charm'd - where real connections happen.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="default" 
                size="lg" 
                onClick={() => router.push('/auth')}
                className="shadow-brutal"
              >
                Get Started Free
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => router.push('/auth')}
                className="shadow-brutal"
              >
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
          <div className="relative animate-fade-in-right animation-delay-400">
            <div className="border-brutal border-foreground shadow-brutal-lg overflow-hidden rounded-lg rotate-[2deg] transition-all duration-500 hover:rotate-0 hover:scale-105 hover:shadow-brutal-lg">
              <Image src={heroImage} alt="Dating app illustration" className="w-full h-auto transition-transform duration-500 hover:scale-110" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-primary/5 border-y-brutal border-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in-up">
            <h3 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Why Choose <span className="text-primary transition-colors duration-300 hover:text-secondary">Charm'd</span>
            </h3>
            <p className="text-xl text-muted-foreground font-semibold max-w-2xl mx-auto">
              We&apos;re not just another dating app. We&apos;re here to help you find genuine connections.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="animate-fade-in-up animation-delay-200">
              <FeatureCard 
                icon={<Zap className="w-8 h-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />}
                bgColor="bg-secondary"
                title="Smart Matching"
                description="Our AI-powered algorithm finds people who truly match your vibe."
              />
            </div>
            <div className="animate-fade-in-up animation-delay-400">
              <FeatureCard 
                icon={<Shield className="w-8 h-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />}
                bgColor="bg-accent"
                title="Safe & Secure"
                description="Verified profiles and robust privacy controls keep you protected."
              />
            </div>
            <div className="animate-fade-in-up animation-delay-600">
              <FeatureCard 
                icon={<MessageCircle className="w-8 h-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />}
                bgColor="bg-primary"
                title="Fun Conversations"
                description="Ice breakers and prompts make starting conversations easy."
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12 animate-fade-in-up">
          <h3 className="text-4xl md:text-5xl font-display font-bold mb-4">
            How It <span className="text-primary transition-colors duration-300 hover:text-secondary">Works</span>
          </h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="animate-fade-in-up animation-delay-200">
            <StepCard 
              number="1"
              title="Create Profile"
              description="Set up your profile in minutes with photos and fun prompts."
            />
          </div>
          <div className="animate-fade-in-up animation-delay-400">
            <StepCard 
              number="2"
              title="Start Swiping"
              description="Browse through profiles and swipe right on people you like."
            />
          </div>
          <div className="animate-fade-in-up animation-delay-600">
            <StepCard 
              number="3"
              title="Make Connections"
              description="Match, chat, and meet up for coffee or virtual dates."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-secondary/20 border-y-brutal border-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in-up">
            <h3 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Real Love <span className="text-primary transition-colors duration-300 hover:text-secondary">Stories</span>
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="animate-fade-in-up animation-delay-200">
              <TestimonialCard 
                quote="Met my soulmate on Charm'd after just 2 weeks! The matching algorithm really works."
                name="Jonel & Rose"
                color="bg-primary"
              />
            </div>
            <div className="animate-fade-in-up animation-delay-400">
              <TestimonialCard 
                quote="Best dating app I've used. The people are real and the conversations actually flow!"
                name="Joshua & Eliz"
                color="bg-accent"
              />
            </div>
            <div className="animate-fade-in-up animation-delay-600">
              <TestimonialCard 
                quote="Finally, a dating app that doesn't feel like work. Fun, easy, and I met amazing people!"
                name="Garret & Nicole"
                color="bg-secondary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="bg-primary border-brutal border-foreground shadow-brutal-lg rounded-lg p-12 text-center rotate-[-1deg] transition-all duration-500 hover:rotate-0 hover:scale-105 animate-fade-in-up">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary-foreground transition-transform duration-300 hover:scale-110 hover:rotate-12" />
          <h3 className="text-4xl md:text-5xl font-display font-bold mb-4 text-primary-foreground">
            Ready to Find Your Match?
          </h3>
          <p className="text-xl mb-8 text-primary-foreground font-semibold max-w-2xl mx-auto">
            Join millions of people finding love on Charm&apos;d. Your perfect match is waiting!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => router.push('/auth')}
              className="transition-all duration-300 hover:scale-105 hover:shadow-brutal-sm"
            >
              Get Started Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-card transition-all duration-300 hover:scale-105 hover:shadow-brutal-sm" 
              onClick={() => router.push('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-brutal border-foreground bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4 group cursor-pointer" onClick={() => router.push('/')}>
                <Heart className="w-6 h-6 fill-primary text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <h4 className="text-xl font-display font-bold transition-colors duration-300 group-hover:text-primary">Charm&apos;d</h4>
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
  <Card className={`${bgColor} border-brutal border-foreground shadow-brutal p-8 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-300 group`}>
    <div className="mb-4">{icon}</div>
    <h4 className="text-2xl font-display font-bold mb-3 transition-colors duration-300 group-hover:text-primary">{title}</h4>
    <p className="text-foreground/80 font-semibold transition-colors duration-300 group-hover:text-foreground">{description}</p>
  </Card>
);

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard = ({ number, title, description }: StepCardProps) => (
  <div className="text-center group">
    <div className="bg-primary border-brutal border-foreground shadow-brutal w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
      <span className="text-3xl font-display font-bold text-primary-foreground">{number}</span>
    </div>
    <h4 className="text-2xl font-display font-bold mb-3 transition-colors duration-300 group-hover:text-primary">{title}</h4>
    <p className="text-muted-foreground font-semibold transition-colors duration-300 group-hover:text-foreground">{description}</p>
  </div>
);

interface TestimonialCardProps {
  quote: string;
  name: string;
  color: string;
}

const TestimonialCard = ({ quote, name, color }: TestimonialCardProps) => (
  <Card className={`${color} border-brutal border-foreground shadow-brutal p-6 rotate-[1deg] hover:rotate-0 transition-all duration-300 group hover:scale-105`}>
    <p className="text-lg font-semibold mb-4 text-foreground transition-colors duration-300 group-hover:text-primary">&quot;{quote}&quot;</p>
    <p className="font-bold text-foreground transition-colors duration-300 group-hover:text-primary">— {name}</p>
  </Card>
);
