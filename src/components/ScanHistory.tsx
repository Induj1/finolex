
import { ArrowLeft, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanResult } from "@/pages/Index";

interface ScanHistoryProps {
  history: ScanResult[];
  onBack: () => void;
}

export const ScanHistory = ({ history, onBack }: ScanHistoryProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const genuineCount = history.filter(scan => scan.isGenuine).length;
  const counterfeitCount = history.length - genuineCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Mobile-friendly Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={onBack} className="mr-2 sm:mr-3 p-2">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Scan History</h1>
            </div>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Mobile-optimized Statistics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border">
            <div className="text-lg sm:text-2xl font-bold text-gray-900">{history.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Scans</div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{genuineCount}</div>
            <div className="text-xs sm:text-sm text-gray-600">Genuine</div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{counterfeitCount}</div>
            <div className="text-xs sm:text-sm text-gray-600">Counterfeit</div>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-sm border">
            <div className="text-gray-400 mb-4">
              <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Scans Yet</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Your scan history will appear here after you verify your first product.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((scan) => (
              <div key={scan.id} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                    {scan.isGenuine ? (
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          scan.isGenuine 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {scan.isGenuine ? 'Genuine' : 'Counterfeit'}
                        </span>
                      </div>
                      
                      <div className="font-medium text-gray-900 truncate text-sm sm:text-base">
                        {scan.productName || 'Unknown Product'}
                      </div>
                      
                      <div className="text-xs sm:text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded mt-2 truncate">
                        {scan.code}
                      </div>
                      
                      {scan.batchNumber && (
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">
                          Batch: {scan.batchNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-xs sm:text-sm text-gray-500 ml-2 sm:ml-4 flex-shrink-0">
                    {formatDate(scan.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
