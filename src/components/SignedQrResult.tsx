
import { CheckCircle, XCircle, AlertTriangle, Clock, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QrVerificationResult } from "@/services/signedQrVerification";

interface SignedQrResultProps {
  result: QrVerificationResult;
  onBack: () => void;
}

export const SignedQrResult = ({ result, onBack }: SignedQrResultProps) => {
  const getStatusConfig = () => {
    switch (result.status) {
      case 'first_use':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          title: 'Genuine Product ✓',
          subtitle: 'First-time verification successful',
          messageColor: 'text-green-800'
        };
      case 'reused':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-gradient-to-r from-yellow-50 to-orange-50',
          borderColor: 'border-yellow-200',
          title: 'QR Code Already Scanned ⚠️',
          subtitle: 'This QR has been used before',
          messageColor: 'text-yellow-800'
        };
      case 'signature_invalid':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-gradient-to-r from-red-50 to-pink-50',
          borderColor: 'border-red-200',
          title: 'Invalid QR Code ❌',
          subtitle: 'Signature verification failed',
          messageColor: 'text-red-800'
        };
      default:
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-gradient-to-r from-red-50 to-pink-50',
          borderColor: 'border-red-200',
          title: 'Verification Failed ❌',
          subtitle: 'Unable to verify QR code',
          messageColor: 'text-red-800'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-3">
              ← Back
            </Button>
            <h1 className="text-xl font-bold text-gray-900">QR Verification Result</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className={`rounded-2xl p-6 shadow-lg border-2 ${config.bgColor} ${config.borderColor}`}>
          {/* Status Header */}
          <div className="flex items-center justify-center mb-6">
            <IconComponent className={`h-16 w-16 ${config.iconColor} mr-3`} />
            <div className="text-center">
              <h2 className={`text-2xl font-bold ${config.messageColor}`}>{config.title}</h2>
              <p className={`${config.messageColor} opacity-80`}>{config.subtitle}</p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/70 rounded-full px-4 py-2 flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                RSA-SHA256 Verified
              </span>
            </div>
          </div>

          {/* Product Details */}
          {result.productDetails && (
            <div className="bg-white/70 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Product Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {result.productDetails.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Name:</span>
                  <span className="font-semibold">{result.productDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Batch Number:</span>
                  <span className="font-mono text-sm">{result.productDetails.batch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expiry Date:</span>
                  <span>{result.productDetails.expiry}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reuse Information */}
          {result.status === 'reused' && (
            <div className="bg-yellow-100 rounded-xl p-4 mb-6">
              <div className="flex items-center text-yellow-800 mb-2">
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-semibold">Previous Scan Details</span>
              </div>
              <div className="text-yellow-700 text-sm space-y-1">
                {result.firstScanTime && (
                  <p>First scanned: {new Date(result.firstScanTime).toLocaleString()}</p>
                )}
                {result.firstScanLocation && (
                  <p>Location: {result.firstScanLocation}</p>
                )}
                {result.scanCount && (
                  <p>Total scans: {result.scanCount}</p>
                )}
              </div>
            </div>
          )}

          {/* Status-specific Messages */}
          <div className={`rounded-xl p-4 ${
            result.status === 'first_use' ? 'bg-green-100' :
            result.status === 'reused' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <div className={`flex items-center mb-2 ${
              result.status === 'first_use' ? 'text-green-800' :
              result.status === 'reused' ? 'text-yellow-800' : 'text-red-800'
            }`}>
              <IconComponent className="h-5 w-5 mr-2" />
              <span className="font-semibold">
                {result.status === 'first_use' && 'Verification Complete'}
                {result.status === 'reused' && 'Reused QR Code Detected'}
                {result.status === 'signature_invalid' && 'Security Alert'}
                {result.status === 'error' && 'Verification Error'}
              </span>
            </div>
            <p className={`text-sm ${
              result.status === 'first_use' ? 'text-green-700' :
              result.status === 'reused' ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {result.message || 
               (result.status === 'first_use' && 'This Finolex product has been verified as genuine with a valid digital signature.') ||
               (result.status === 'signature_invalid' && 'This QR code has been tampered with or is not genuine. Do not trust this product.') ||
               'Please contact support for assistance.'
              }
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <Button onClick={onBack} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Scan Another QR Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
