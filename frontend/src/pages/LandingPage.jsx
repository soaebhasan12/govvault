import Navbar from '../components/layouts/Navbar';
import Hero from '../components/sections/Hero';
import VideoShowcase from '../components/sections/VideoShowcase';
import Features from '../components/sections/Features';
import HowItWorks from '../components/sections/HowItWorks';
import TechStack from '../components/sections/TechStack';
import Footer from '../components/sections/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <VideoShowcase />
      <Features />
      <HowItWorks />
      <TechStack />
      <Footer />
    </>
  );
}