
import { Camera } from "lucide-react";

interface CameraViewProps {
  useMockCamera: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const CameraView = ({ useMockCamera, videoRef, canvasRef }: CameraViewProps) => {
  return (
    <div className="flex-1 relative">
      {useMockCamera ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <Camera className="h-24 w-24 mx-auto mb-4 text-gray-500" />
            <p className="text-lg mb-2">Mock Camera Active</p>
            <p className="text-sm text-gray-400">Simulated camera for testing</p>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
