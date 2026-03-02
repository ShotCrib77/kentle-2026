import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";

export default function Home() {
    return (
        <div className="min-h-screen bg-bg-black text-foreground">
            <Hero />
            <div id="how" className="pb-48 pt-8 scroll-mt-20">
                <HowItWorks />
            </div>
        </div>
    );
}
