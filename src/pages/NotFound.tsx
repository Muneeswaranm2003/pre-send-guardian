import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Compass, Home, Activity, Flame } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 inline-flex rounded-full bg-accent/60 p-3">
          <Compass className="h-6 w-6 text-accent-foreground" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Page not found</h1>
        <p className="mb-6 text-muted-foreground">
          The page you were looking for doesn't exist or has moved.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/simulator">
              <Activity className="mr-2 h-4 w-4" />
              Simulator
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/warmup">
              <Flame className="mr-2 h-4 w-4" />
              Warmup
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
