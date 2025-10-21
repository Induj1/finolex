import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, History, Keyboard, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { ProductResult } from "@/components/ProductResult";
import { ManualEntry } from "@/components/ManualEntry";
import { ScanHistory } from "@/components/ScanHistory";
import { ConsentData } from "@/components/PrivacyConsent";
import { SecurityCaptcha } from "@/components/SecurityCaptcha";
import { EnhancedCameraScanner } from "@/components/EnhancedCameraScanner";
import { verifyProduct, generateDeviceFingerprint, getUserLocation, getBrowserInfo, verifyCaptcha, TimestampData } from "@/services/productVerification";
import { useToast } from "@/hooks/use-toast";
import { SignedQrResult } from "@/components/SignedQrResult";
import { verifySignedQr, parseQrCode, generateMockSignedQr, QrVerificationResult } from "@/services/signedQrVerification";

export interface ScanResult {
  id: string;
  code: string;
  isGenuine: boolean;
  productName?: string;
  batchNumber?: string;
  expiryDate?: string;
  timestamp: Date;
  securityFlag?: 'low_risk' | 'medium_risk' | 'high_risk';
  anomalyScore?: number;
  qrVerificationResult?: QrVerificationResult;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'captcha' | 'camera' | 'manual' | 'result' | 'history' | 'signed-qr-result'>('home');
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userConsents, setUserConsents] = useState<ConsentData>({
    basicVerification: true,
    locationAccess: false,
    cameraSnapshot: false,
    deviceInfo: false,
    timestampLogging: false,
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [timestampData, setTimestampData] = useState<Partial<TimestampData>>({});
  const [signedQrResult, setSignedQrResult] = useState<QrVerificationResult | null>(null);
  const [pendingDemoQr, setPendingDemoQr] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedHistory = localStorage.getItem('finolex-scan-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setScanHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Error loading scan history:', error);
      }
    }
  }, []);

  const handleStartScan = (method: 'camera' | 'manual') => {
    console.log('Starting scan with method:', method);
    setTimestampData({ scan_initiated: Date.now() });
    setCurrentView('captcha');
    sessionStorage.setItem('scanMethod', method);
  };

  const handleStartDemo = async () => {
    console.log('Starting demo signed QR scan');
    try {
      const mockQr = await generateMockSignedQr();
      setPendingDemoQr(mockQr);
      setTimestampData({ scan_initiated: Date.now() });
      setCurrentView('captcha');
      sessionStorage.setItem('scanMethod', 'demo');
    } catch (error) {
      console.error('Failed to generate demo QR:', error);
      toast({
        title: "Demo Generation Failed",
        description: "Unable to generate demo QR code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCaptchaVerified = async (token: string) => {
    console.log('CAPTCHA verified with token:', token ? 'present' : 'missing');
    setIsProcessing(true);
    
    try {
      if (!token) {
        throw new Error('CAPTCHA token is missing');
      }

      const isValid = await verifyCaptcha(token);
      console.log('CAPTCHA validation result:', isValid);
      
      if (isValid) {
        setCaptchaToken(token);
        setTimestampData(prev => ({ ...prev, captcha_completed: Date.now() }));
        
        const scanMethod = sessionStorage.getItem('scanMethod') as 'camera' | 'manual' | 'demo';
        console.log('Proceeding to scan method:', scanMethod);
        
        if (scanMethod === 'demo' && pendingDemoQr) {
          // Process demo QR immediately after CAPTCHA verification
          await handleScan(pendingDemoQr);
          setPendingDemoQr(null);
        } else if (scanMethod === 'camera') {
          setCurrentView('camera');
        } else if (scanMethod === 'manual') {
          setCurrentView('manual');
        }
      } else {
        throw new Error('CAPTCHA verification failed');
      }
    } catch (error) {
      console.error('CAPTCHA verification error:', error);
      toast({
        title: "Security Verification Failed",
        description: error instanceof Error ? error.message : "Please try the security check again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScan = async (code: string, snapshot?: string) => {
    console.log('Handling scan for code:', code.substring(0, 50) + '...');
    console.log('CAPTCHA token available:', !!captchaToken);
    
    if (!captchaToken) {
      console.error('Missing CAPTCHA token');
      toast({
        title: "Security Verification Required",
        description: "Security verification is missing. Please restart the scanning process.",
        variant: "destructive"
      });
      setCurrentView('home');
      return;
    }
    
    setIsProcessing(true);
    setTimestampData(prev => ({ ...prev, scan_completed: Date.now() }));
    
    try {
      console.log('Attempting to parse as signed QR code...');
      const signedQrPayload = parseQrCode(code);
      
      if (signedQrPayload) {
        console.log('Detected signed QR code, using signature verification');
        
        const deviceFingerprint = generateDeviceFingerprint();
        const locationData = userConsents.locationAccess ? await getUserLocation() : {city: null};
        const browserInfo = userConsents.deviceInfo ? getBrowserInfo() : undefined;
        
        console.log('Verifying signed QR with:', {
          deviceFingerprint: deviceFingerprint.substring(0, 10) + '...',
          location: locationData.city,
          hasUserAgent: !!browserInfo?.user_agent
        });
        
        const qrResult = await verifySignedQr(
          signedQrPayload,
          deviceFingerprint,
          locationData.city || undefined,
          browserInfo?.user_agent,
          userConsents
        );
        
        console.log('Signed QR verification result:', qrResult.status);
        setSignedQrResult(qrResult);
        setCurrentView('signed-qr-result');
        
        // Add to scan history
        const result: ScanResult = {
          id: Math.random().toString(36).substring(7),
          code: signedQrPayload.data.id,
          isGenuine: qrResult.status === 'first_use' || qrResult.status === 'reused',
          productName: qrResult.productDetails?.name,
          batchNumber: qrResult.productDetails?.batch,
          expiryDate: qrResult.productDetails?.expiry,
          timestamp: new Date(),
          qrVerificationResult: qrResult
        };
        
        const updatedHistory = [result, ...scanHistory].slice(0, 50);
        setScanHistory(updatedHistory);
        localStorage.setItem('finolex-scan-history', JSON.stringify(updatedHistory));
        
        setIsProcessing(false);
        return;
      }
      
      console.log('Using legacy verification system for regular QR/barcode');
      
      // Fall back to original verification system
      const deviceFingerprint = generateDeviceFingerprint();
      const locationData = userConsents.locationAccess ? await getUserLocation() : {city: null};
      const browserInfo = userConsents.deviceInfo ? getBrowserInfo() : undefined;
      
      // Calculate timing data
      const timingData: TimestampData = {
        scan_initiated: timestampData.scan_initiated || Date.now(),
        captcha_completed: timestampData.captcha_completed || Date.now(),
        camera_ready: timestampData.camera_ready || Date.now(),
        scan_completed: Date.now(),
        total_duration: Date.now() - (timestampData.scan_initiated || Date.now())
      };
      
      // Determine if code is barcode or QR code
      const isBarcode = /^\d+$/.test(code);
      
      const response = await verifyProduct({
        [isBarcode ? 'barcode' : 'qr_code']: code,
        scan_location: locationData.city || undefined,
        device_fingerprint: deviceFingerprint,
        captcha_token: captchaToken,
        timestamp_data: userConsents.timestampLogging ? timingData : undefined,
        browser_info: browserInfo,
        geolocation_accuracy: locationData.accuracy,
        camera_snapshot: snapshot,
        user_consents: userConsents
      });

      const result: ScanResult = {
        id: Math.random().toString(36).substring(7),
        code,
        isGenuine: response.status === 'genuine',
        productName: response.product_details?.name,
        batchNumber: response.product_details?.batch_no,
        expiryDate: response.product_details?.expiry,
        timestamp: new Date(),
        securityFlag: response.security_flag,
        anomalyScore: response.anomaly_score
      };

      // Add to history
      const updatedHistory = [result, ...scanHistory].slice(0, 50);
      setScanHistory(updatedHistory);
      localStorage.setItem('finolex-scan-history', JSON.stringify(updatedHistory));
      
      setCurrentResult(result);
      setCurrentView('result');

      // Show security warnings
      if (response.security_flag === 'high_risk') {
        toast({
          title: "Security Alert",
          description: "This scan has been flagged for suspicious activity.",
          variant: "destructive"
        });
      }

      if (response.anomaly_score && response.anomaly_score > 0.8) {
        toast({
          title: "Anomaly Detected",
          description: "Unusual scanning patterns detected. Verification may require additional review.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Verification failed:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Unable to verify product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      sessionStorage.removeItem('scanMethod');
    }
  };

  const handleBack = () => {
    console.log('Navigating back to home');
    setCurrentView('home');
    setCaptchaToken(null);
    setTimestampData({});
    setSignedQrResult(null);
    setPendingDemoQr(null);
    sessionStorage.removeItem('scanMethod');
  };

  if (currentView === 'captcha') {
    return (
      <SecurityCaptcha
        onVerify={handleCaptchaVerified}
        onBack={handleBack}
        isLoading={isProcessing}
      />
    );
  }

  if (currentView === 'camera') {
    return (
      <EnhancedCameraScanner
        onScanResult={handleScan}
        onBack={handleBack}
        consents={userConsents}
      />
    );
  }

  if (currentView === 'manual') {
    return <ManualEntry onSubmit={handleScan} onBack={handleBack} />;
  }

  if (currentView === 'result' && currentResult) {
    return <ProductResult result={currentResult} onBack={handleBack} />;
  }

  if (currentView === 'history') {
    return <ScanHistory history={scanHistory} onBack={handleBack} />;
  }

  if (currentView === 'signed-qr-result' && signedQrResult) {
    return <SignedQrResult result={signedQrResult} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Mobile-friendly Header with Logo */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <img
                src="/logo.png"
                alt="Finolex Logo"
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Secure Product Authentication</h1>
              <p className="text-base sm:text-lg text-blue-700 font-medium">Verify. Trust. Protect.</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs sm:text-sm text-green-700">Enhanced Security + Digital Signatures</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full mb-4 sm:mb-6">
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            Advanced QR Authentication System
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
            Revolutionary RSA-SHA256 signed QR codes with copy detection. Each scan includes CAPTCHA verification, 
            digital signature validation, and reuse tracking to ensure maximum security against counterfeits.
          </p>
          
          {/* Demo Button */}
          <div className="mt-6">
            <Button
              onClick={handleStartDemo}
              variant="outline"
              className="text-purple-700 border-purple-200 hover:bg-purple-50"
              disabled={isProcessing}
            >
              🎯 Try Demo Signed QR
            </Button>
          </div>
        </div>

        {/* Mobile-optimized Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="group">
            <Button
              onClick={() => handleStartScan('camera')}
              className="w-full h-24 sm:h-32 text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-0"
              disabled={isProcessing}
            >
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <Camera className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="font-semibold text-sm sm:text-base">Secure Camera Scan</span>
                <span className="text-xs sm:text-sm opacity-90">RSA Signature Verified</span>
              </div>
            </Button>
          </div>

          <div className="group">
            <Button
              onClick={() => handleStartScan('manual')}
              variant="outline"
              className="w-full h-24 sm:h-32 text-lg sm:text-xl border-2 sm:border-3 border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-blue-700 hover:text-blue-800"
              disabled={isProcessing}
            >
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <Keyboard className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="font-semibold text-sm sm:text-base">Secure Manual Entry</span>
                <span className="text-xs sm:text-sm opacity-75">Paste Signed QR Data</span>
              </div>
            </Button>
          </div>
        </div>

        {scanHistory.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <History className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Scans</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{scanHistory.length} verification{scanHistory.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setCurrentView('history')}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-3 sm:px-6 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                >
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">{scanHistory.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Scans</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl sm:rounded-2xl">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {scanHistory.filter(scan => scan.isGenuine).length}
                  </div>
                  <div className="text-xs sm:text-sm text-green-700">Genuine</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-red-50 rounded-xl sm:rounded-2xl">
                  <div className="text-lg sm:text-2xl font-bold text-red-600">
                    {scanHistory.filter(scan => !scan.isGenuine).length}
                  </div>
                  <div className="text-xs sm:text-sm text-red-700">Unverified</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Digital Signature Security</h3>
            </div>
            <ul className="space-y-3 sm:space-y-4 text-gray-700">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm sm:text-base">RSA-SHA256 cryptographic signatures prevent forgery</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm sm:text-base">Copy detection tracks QR reuse across locations</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm sm:text-base">CAPTCHA verification prevents automated attacks</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm sm:text-base">Timestamp validation ensures QR freshness</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Why Verify?</h3>
            </div>
            <ul className="space-y-3 sm:space-y-4 text-gray-700">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm sm:text-base">Ensure product quality, safety, and performance standards</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm sm:text-base">Protect yourself and family from counterfeit products</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm sm:text-base">Verify warranty coverage and support eligibility</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm sm:text-base">Support authentic Finolex products and innovation</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 bg-white rounded-full px-4 py-3 sm:px-8 sm:py-4 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">RSA Signed</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Copy Detection</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Anti-Tampering</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
