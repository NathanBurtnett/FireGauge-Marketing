import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, ExternalLink } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("");

  // List of old authenticated routes that should redirect to main app
  const oldPortalRoutes = [
    '/dashboard',
    '/account',
    '/billing',
    '/settings',
    '/profile',
    '/user',
    '/admin',
    '/reports',
    '/customers',
    '/welcome',
    '/logout',
    '/password-reset'
  ];

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Check if this is an old portal route
    const isOldPortalRoute = oldPortalRoutes.some(route => 
      location.pathname.toLowerCase().includes(route)
    );

    if (isOldPortalRoute) {
      setShouldRedirect(true);
      setRedirectMessage("This feature has moved to our main application. You'll be redirected in 3 seconds...");
      
      // Auto-redirect after 3 seconds
      const timer = setTimeout(() => {
        window.location.href = "https://app.firegauge.app" + location.pathname;
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleManualRedirect = () => {
    window.location.href = "https://app.firegauge.app" + location.pathname;
  };

  if (shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-firegauge-charcoal to-gray-800">
        <div className="text-center text-white p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-md mx-4">
          <ExternalLink className="h-16 w-16 text-firegauge-accent mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
          <p className="text-gray-300 mb-6">{redirectMessage}</p>
          <Button 
            onClick={handleManualRedirect}
            className="bg-firegauge-red hover:bg-firegauge-red/90 text-white"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Go to App Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-firegauge-charcoal to-gray-800">
      <div className="text-center text-white p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-md mx-4">
        <h1 className="text-6xl font-bold mb-4 text-firegauge-accent">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-300 mb-6">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <Button 
            asChild
            className="w-full bg-firegauge-red hover:bg-firegauge-red/90 text-white"
          >
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </a>
          </Button>
          <Button 
            asChild
            variant="outline"
            className="w-full border-white text-white hover:bg-white hover:text-firegauge-charcoal"
          >
            <a href="/contact">
              Contact Support
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
