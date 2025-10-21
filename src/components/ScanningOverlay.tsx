
interface ScanningOverlayProps {
  cameraReady: boolean;
  isScanning: boolean;
  useMockCamera: boolean;
  cameraSnapshot: boolean;
}

export const ScanningOverlay = ({ 
  cameraReady, 
  isScanning, 
  useMockCamera, 
  cameraSnapshot 
}: ScanningOverlayProps) => {
  if (!cameraReady) return null;

  return (
    <>
      <div className="absolute inset-0 bg-black/30 z-5"></div>
      
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative">
          <div className="w-64 h-64 border-2 border-white rounded-2xl relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-green-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-green-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-green-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-green-400 rounded-br-lg"></div>
            
            {isScanning && (
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-green-400 animate-pulse"></div>
            )}
          </div>
          
          <p className="text-white text-center mt-4 text-lg">
            {isScanning ? "Verifying signature..." : "Position the signed QR within the frame"}
          </p>
          
          {useMockCamera && (
            <p className="text-yellow-400 text-center mt-2 text-sm">
              🧪 Mock mode - for testing purposes
            </p>
          )}
          
          {cameraSnapshot && !useMockCamera && (
            <p className="text-green-400 text-center mt-2 text-sm">
              🔒 Snapshot enabled for signature verification
            </p>
          )}
        </div>
      </div>
    </>
  );
};
