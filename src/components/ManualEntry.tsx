
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManualEntryProps {
  onSubmit: (code: string) => void;
  onBack: () => void;
}

export const ManualEntry = ({ onSubmit, onBack }: ManualEntryProps) => {
  const [code, setCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid product code.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      onSubmit(code.trim());
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Mobile-friendly Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2 sm:mr-3 p-2">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Enter Product Code</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Instructions */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
            Manual Code Entry
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Enter the product code found on your Finolex product. This can be a barcode number, QR code content, or serial number.
          </p>
          
          <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
            <h3 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Where to find the code:</h3>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
              <li>• Product label or sticker</li>
              <li>• Packaging barcode</li>
              <li>• QR code on the product</li>
              <li>• Serial number tag</li>
            </ul>
          </div>
        </div>

        {/* Entry Form */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Product Code
              </label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter barcode, QR code, or serial number"
                className="h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                disabled={isProcessing}
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Example: FIN123456789, 8901234567890
              </p>
            </div>

            <Button
              type="submit"
              disabled={!code.trim() || isProcessing}
              className="w-full h-12 sm:h-14 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Verify Product
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-4 sm:mt-6 bg-gray-50 rounded-xl p-3 sm:p-4">
          <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Tips for accurate verification:</h3>
          <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
            <li>• Double-check the code for any typos</li>
            <li>• Ensure all characters are entered correctly</li>
            <li>• For QR codes, enter the complete text content</li>
            <li>• If unsure, try scanning with the camera instead</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
