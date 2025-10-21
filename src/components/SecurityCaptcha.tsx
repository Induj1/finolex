
import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface SecurityCaptchaProps {
  onVerify: (token: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const SecurityCaptcha = ({ onVerify, onBack, isLoading = false }: SecurityCaptchaProps) => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // For demo purposes, using a test site key. In production, use your actual reCAPTCHA site key
  const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Test key

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
    toast({
      title: "Security Verification Expired",
      description: "Please complete the security check again.",
      variant: "destructive"
    });
  };

  const handleCaptchaError = () => {
    setCaptchaToken(null);
    toast({
      title: "Security Verification Error",
      description: "There was an error with the security check. Please try again.",
      variant: "destructive"
    });
  };

  const handleProceed = () => {
    if (captchaToken) {
      onVerify(captchaToken);
    }
  };

  const handleRefresh = () => {
    recaptchaRef.current?.reset();
    setCaptchaToken(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Mobile-friendly Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2 sm:mr-3 p-2">
              ← Back
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Security Verification</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-md">
        {/* Security Icon */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full mb-3 sm:mb-4">
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Security Check Required
          </h2>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Please complete this security verification to protect against automated scanning attempts and ensure product authenticity.
          </p>
        </div>

        {/* CAPTCHA */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border mb-4 sm:mb-6">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Verify You're Human</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              This helps us prevent fraudulent verification attempts
            </p>
          </div>

          <div className="flex justify-center mb-4 overflow-x-auto">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
              onExpired={handleCaptchaExpired}
              onError={handleCaptchaError}
              size={isMobile ? "compact" : "normal"}
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Proceed Button */}
        <Button
          onClick={handleProceed}
          disabled={!captchaToken || isLoading}
          className="w-full h-12 sm:h-12 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
              Verifying...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Continue to Scan
            </>
          )}
        </Button>

        {/* Security Info */}
        <div className="mt-4 sm:mt-6 bg-blue-50 rounded-xl p-3 sm:p-4">
          <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Why This Step?</h4>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
            <li>• Prevents automated fraud attempts</li>
            <li>• Protects genuine product database</li>
            <li>• Ensures verification accuracy</li>
            <li>• Maintains system security</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
