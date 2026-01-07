import { memo } from "react";
import { Link } from "react-router-dom";
import spamguardLogo from "@/assets/spamguard-logo.png";

const FOOTER_LINKS = {
  Product: [
    { name: "Simulator", path: "/simulator" },
    { name: "Pricing", path: "/#pricing" },
    { name: "API", path: "/" },
  ],
  Resources: [
    { name: "Documentation", path: "/" },
    { name: "Blog", path: "/" },
    { name: "Support", path: "/" },
  ],
  Company: [
    { name: "About", path: "/" },
    { name: "Privacy", path: "/" },
    { name: "Terms", path: "/" },
  ],
} as const;

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src={spamguardLogo}
                alt="SpamGuard Logo"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg font-bold text-foreground">SpamGuard</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Predict your email deliverability before you hit send.
              Protect your domain reputation.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SpamGuard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
