
import { Button } from "@/components/ui/button";

interface CameraLoadingStateProps {
  onEnableMockCamera: () => void;
}

export const CameraLoadingState = ({ onEnableMockCamera }: CameraLoadingStateProps) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white max-w-sm mx-auto px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg mb-2">Starting secure camera...</p>
        <p className="text-sm text-gray-400">This may take a few seconds</p>
        
        <div className="mt-6">
          <Button
            onClick={onEnableMockCamera}
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            Use Mock Camera Instead
          </Button>
        </div>
      </div>
    </div>
  );
};
