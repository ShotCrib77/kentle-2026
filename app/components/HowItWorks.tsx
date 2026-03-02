"use client";

import { motion } from "framer-motion";
import { Music, Headphones, Trophy, HelpCircle } from "lucide-react";

const features = [
    {
        icon: Music,
        title: "Logga in med Spotify",
        description: "Logga in till ditt Spotify-konto genom att klicka på Spela -> Logga in till Spotify och ge nödvändiga behörigheter.",
    },
    {
        icon: Headphones,
        title: "Lyssna & Gissa",
        description: "Hör ett kort klipp av en låt och gissa vad den heter. Ju färre gissningar du behöver, desto fler poäng får du!",
    },
    {
        icon: HelpCircle,
        title: "Få Ledtrådar",
        description: "Varje gissning gör det lättare - längre klipp, albumomslag och till slut klipp från mitten av låten.",
    },
    {
        icon: Trophy,
        title: "Samla Poäng",
        description: "Spela 5 runder och se ditt totala resultat. Desto färre gissningar du behöver, desto högre poäng får du!",
    },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HowItWorks() {
    return (
        <section className="flex items-center justify-center px-4">
            <div className="max-w-4xl px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl sm:text-3xl font-heading font-bold text-center mb-4"
                >
                    Hur funkar det?
                </motion.h2>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid sm:grid-cols-2 gap-6"
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={item}
                            className="bg-background border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors duration-300"
                        >
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};