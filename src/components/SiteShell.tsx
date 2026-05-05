import { Link } from "react-router-dom";
import { AdSlot } from "./AdSlot";
import { GlobalAdLoader } from "./GlobalAdLoader";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Scary<span className="text-primary"> Chat</span>
          </Link>
          <nav className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
          </nav>
        </div>
        <AdSlot slot="header" className="container py-2" />
      </header>
      <main className="flex-1">{children}</main>
      <AdSlot slot="socialBar" className="fixed bottom-0 left-0 right-0 z-30" />
      <footer className="mt-12 border-t border-border bg-card">
        <AdSlot slot="footer" className="container py-3" />
        <div className="container py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Scary Chat. All rights reserved.
        </div>
      </footer>
      <GlobalAdLoader />
    </div>
  );
}
