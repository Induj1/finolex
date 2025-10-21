
import { CheckCircle, XCircle, AlertTriangle, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanResult } from "@/pages/Index";

interface ProductResultProps {
  result: ScanResult;
  onBack: () => void;
}

export const ProductResult = ({ result, onBack }: ProductResultProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const getSecurityColor = (flag?: string) => {
    switch (flag) {
      case 'high_risk': return 'text-red-600';
      case 'medium_risk': return 'text-orange-600';
      default: return 'text-green-600';
    }
  };

  const getSecurityText = (flag?: string) => {
    switch (flag) {
      case 'high_risk': return 'High Risk - Location Mismatch';
      case 'medium_risk': return 'Medium Risk';
      default: return 'Low Risk';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-3">
              ← Back
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Verification Result</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className={`rounded-2xl p-6 shadow-lg ${
          result.isGenuine 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
        }`}>
          {/* Status Header */}
          <div className="flex items-center justify-center mb-6">
            {result.isGenuine ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-600 mr-3" />
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-green-800">Genuine Product</h2>
                  <p className="text-green-700">This product is authentic</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-600 mr-3" />
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-red-800">Unverified Product</h2>
                  <p className="text-red-700">This product could not be verified</p>
                </div>
              </>
            )}
          </div>

          {/* Security Flag */}
          {result.securityFlag && (
            <div className="mb-4">
              <div className={`flex items-center justify-center p-3 rounded-xl bg-white/70 ${getSecurityColor(result.securityFlag)}`}>
                <Shield className="h-5 w-5 mr-2" />
                <span className="font-medium">{getSecurityText(result.securityFlag)}</span>
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="space-y-4 mb-6">
            <div className="bg-white/70 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Product Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Code:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {result.code}
                  </span>
                </div>
                
                {result.productName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Name:</span>
                    <span className="font-semibold">{result.productName}</span>
                  </div>
                )}
                
                {result.batchNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Batch Number:</span>
                    <span className="font-mono text-sm">{result.batchNumber}</span>
                  </div>
                )}
                
                {result.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span>{result.expiryDate}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Scanned At:</span>
                  <span className="text-sm">{formatDate(result.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {result.isGenuine ? (
            <div className="bg-green-100 rounded-xl p-4">
              <div className="flex items-center text-green-800 mb-2">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Verification Complete</span>
              </div>
              <p className="text-green-700 text-sm">
                This Finolex product has been verified as genuine. You can trust its quality and authenticity.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-100 rounded-xl p-4">
                <div className="flex items-center text-red-800 mb-2">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Product Not Verified</span>
                </div>
                <p className="text-red-700 text-sm mb-3">
                  This product could not be verified in our database. Please contact our support team for assistance.
                </p>
              </div>
              
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
