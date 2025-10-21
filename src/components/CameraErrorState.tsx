
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, Shield, Camera } from "lucide-react";

interface CameraErrorStateProps {
  errorMessage: string | null;
  onBack: () => void;
  onEnableMockCamera: () => void;
  onRetryCamera: () => void;
}

export const CameraErrorState = ({ 
  errorMessage, 
  onBack, 
  onEnableMockCamera, 
  onRetryCamera 
}: CameraErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Secure Scanner</h1>
        <div className="w-8"></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-white max-w-md">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold mb-2">Camera Access Issue</h2>
          <p className="text-gray-300 mb-4">
            Unable to access your camera. This could be due to:
          </p>
          <ul className="text-sm text-gray-400 mb-6 text-left space-y-1">
            <li>• Camera permissions not granted</li>
            <li>• Camera already in use by another app</li>
            <li>• Browser security restrictions</li>
            <li>• Hardware issues</li>
          </ul>
          
          {errorMessage && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">Error: {errorMessage}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <Button onClick={onEnableMockCamera} className="w-full bg-blue-600 hover:bg-blue-700">
              <Shield className="h-4 w-4 mr-2" />
              Use Mock Camera (Recommended)
            </Button>
            
            <Button onClick={onRetryCamera} variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-800">
              <Camera className="h-4 w-4 mr-2" />
              Try Camera Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
