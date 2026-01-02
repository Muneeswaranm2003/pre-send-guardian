import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">SpamGuard</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Predict your email deliverability before you hit send. 
              Protect your domain reputation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/simulator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Simulator
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SpamGuard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
