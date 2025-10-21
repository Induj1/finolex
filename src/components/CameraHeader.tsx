
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Flashlight } from "lucide-react";

interface CameraHeaderProps {
  useMockCamera: boolean;
  onBack: () => void;
}

export const CameraHeader = ({ useMockCamera, onBack }: CameraHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 text-white bg-black/50 backdrop-blur-sm z-20 relative">
      <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-green-400" />
        <h1 className="text-lg font-semibold">
          {useMockCamera ? "Mock Scanner" : "Signature Scanner"}
        </h1>
      </div>
      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
        <Flashlight className="h-5 w-5" />
      </Button>
    </div>
  );
};
