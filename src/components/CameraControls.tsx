
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface CameraControlsProps {
  isScanning: boolean;
  cameraReady: boolean;
  onScan: () => void;
}

export const CameraControls = ({ isScanning, cameraReady, onScan }: CameraControlsProps) => {
  return (
    <div className="p-6 bg-black/50 backdrop-blur-sm z-20 relative">
      <div className="text-center mb-4">
        <p className="text-white/80 text-sm">
          RSA signature verification with copy detection
        </p>
      </div>
      
      <Button
        onClick={onScan}
        disabled={isScanning || !cameraReady}
        className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 disabled:opacity-50"
      >
        {isScanning ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Verifying Signature...
          </>
        ) : (
          <>
            <Camera className="h-5 w-5 mr-2" />
            Scan & Verify
          </>
        )}
      </Button>
    </div>
  );
};
