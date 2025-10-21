
import { useState, useRef } from "react";
import { ConsentData } from "./PrivacyConsent";
import { generateMockSignedQr } from "@/services/signedQrVerification";
import { useCameraScanner } from "@/hooks/useCameraScanner";
import { CameraLoadingState } from "./CameraLoadingState";
import { CameraErrorState } from "./CameraErrorState";
import { CameraHeader } from "./CameraHeader";
import { CameraView } from "./CameraView";
import { ScanningOverlay } from "./ScanningOverlay";
import { CameraControls } from "./CameraControls";

interface EnhancedCameraScannerProps {
  onScanResult: (code: string, snapshot?: string) => void;
  onBack: () => void;
  consents: ConsentData;
}

export const EnhancedCameraScanner = ({ onScanResult, onBack, consents }: EnhancedCameraScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    isLoading,
    hasPermission,
    cameraReady,
    errorMessage,
    useMockCamera,
    videoRef,
    requestCameraPermission,
    enableMockCamera
  } = useCameraScanner();

  const captureSnapshot = (): string | null => {
    if (!consents.cameraSnapshot || useMockCamera) {
      return null;
    }

    if (!videoRef.current || !canvasRef.current) {
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Cannot capture snapshot: video not ready');
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const simulateScan = async () => {
    setIsScanning(true);
    
    const snapshot = captureSnapshot();
    
    setTimeout(async () => {
      const shouldGenerateSignedQr = Math.random() > 0.5;
      
      let scannedCode: string;
      
      if (shouldGenerateSignedQr) {
        try {
          scannedCode = await generateMockSignedQr();
          console.log('Generated signed QR for testing');
        } catch (error) {
          console.error('Failed to generate signed QR:', error);
          scannedCode = "FIN123456789";
        }
      } else {
        const mockCodes = [
          "FIN123456789",
          "8901234567890",
          "QR_FINOLEX_WIRE_2025",
          "BAR_FIN_CABLE_001"
        ];
        scannedCode = mockCodes[Math.floor(Math.random() * mockCodes.length)];
      }
      
      onScanResult(scannedCode, snapshot || undefined);
      setIsScanning(false);
    }, 2000);
  };

  if (isLoading) {
    return <CameraLoadingState onEnableMockCamera={enableMockCamera} />;
  }

  if (!hasPermission) {
    return (
      <CameraErrorState
        errorMessage={errorMessage}
        onBack={onBack}
        onEnableMockCamera={enableMockCamera}
        onRetryCamera={requestCameraPermission}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <CameraHeader useMockCamera={useMockCamera} onBack={onBack} />
      
      <CameraView 
        useMockCamera={useMockCamera} 
        videoRef={videoRef} 
        canvasRef={canvasRef} 
      />
      
      <ScanningOverlay
        cameraReady={cameraReady}
        isScanning={isScanning}
        useMockCamera={useMockCamera}
        cameraSnapshot={consents.cameraSnapshot}
      />

      <CameraControls
        isScanning={isScanning}
        cameraReady={cameraReady}
        onScan={simulateScan}
      />
    </div>
  );
};
