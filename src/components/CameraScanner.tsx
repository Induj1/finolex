
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Flashlight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraScannerProps {
  onScanResult: (code: string) => void;
  onBack: () => void;
}

export const CameraScanner = ({ onScanResult, onBack }: CameraScannerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    requestCameraPermission();
    
    return () => {
      // Cleanup camera stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setHasPermission(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Camera access denied:', error);
      setHasPermission(false);
      setIsLoading(false);
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access to scan products.",
        variant: "destructive"
      });
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      const mockCodes = [
        "FIN123456789",
        "8901234567890",
        "QR_FINOLEX_WIRE_2025",
        "BAR_FIN_CABLE_001"
      ];
      
      const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)];
      onScanResult(randomCode);
      setIsScanning(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Initializing camera...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <div className="flex items-center justify-between p-4 text-white">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-gray-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Camera Scanner</h1>
          <div className="w-8"></div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-white">
            <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Camera Access Required</h2>
            <p className="text-gray-300 mb-6">
              To scan product codes, we need access to your camera. Please allow camera permissions and try again.
            </p>
            <Button onClick={requestCameraPermission} className="bg-blue-600 hover:bg-blue-700">
              Enable Camera
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white bg-black/50 backdrop-blur-sm z-10">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Scan Product Code</h1>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
          <Flashlight className="h-5 w-5" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Scanning Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Scanning Frame */}
          <div className="relative">
            <div className="w-64 h-64 border-2 border-white rounded-2xl relative">
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-blue-400 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-blue-400 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-blue-400 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-blue-400 rounded-br-lg"></div>
              
              {/* Scanning line */}
              {isScanning && (
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-blue-400 animate-pulse"></div>
              )}
            </div>
            
            <p className="text-white text-center mt-4 text-lg">
              {isScanning ? "Scanning..." : "Position the code within the frame"}
            </p>
          </div>
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Bottom Controls */}
      <div className="p-6 bg-black/50 backdrop-blur-sm">
        <div className="text-center mb-4">
          <p className="text-white/80 text-sm">
            Point your camera at the barcode or QR code
          </p>
        </div>
        
        <Button
          onClick={simulateScan}
          disabled={isScanning}
          className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Scanning...
            </>
          ) : (
            <>
              <Camera className="h-5 w-5 mr-2" />
              Tap to Scan
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
