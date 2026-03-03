import { Music } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-border py-8 px-6">
        <div className="px-24 lg:px-48 w-full flex items-center justify-between text-md text-muted-foreground">
            <p className="flex-1">©2026 ShotCrib</p>
            <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            <span className="font-heading font-semibold text-foreground">Kentle</span>
            </div>
            <p className="flex-1 text-right">Built with Spotify Web SDK • Not affiliated with Kent</p>
        </div>
        </footer>
    );
}