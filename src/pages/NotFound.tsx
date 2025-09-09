import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, RefreshCw, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );
    }
  }, [location.pathname]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/logo.png" 
            alt="Slit Master Logo" 
            className="h-20 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Main Error Content */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12">
            {/* 404 Number */}
            <div className="relative mb-8">
              <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 select-none">
                404
              </h1>
              <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-blue-100 -z-10 transform translate-x-1 translate-y-1">
                404
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4 mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
                Oops! Page Not Found
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <div className="text-sm text-gray-500 font-mono bg-gray-100 rounded-lg p-3 mx-auto max-w-md break-all">
                {location.pathname}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                onClick={handleGoHome}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <Home size={18} />
                Go to Dashboard
              </Button>
              
              <Button 
                onClick={handleGoBack}
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Go Back
              </Button>

              <Button 
                onClick={handleRefresh}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh
              </Button>
            </div>

            {/* Auto-redirect notice */}
            <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Search size={16} className="text-blue-500" />
              Redirecting to dashboard in <span className="font-mono font-semibold text-blue-600">{countdown}</span> seconds
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center space-y-2">
          <p className="text-gray-600">
            Need help? Check out our <a href="/" className="text-blue-600 hover:text-blue-800 underline">dashboard</a> or contact support.
          </p>
          <p className="text-sm text-gray-500">
            Slit Master - Professional Paper Converting Solutions
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
