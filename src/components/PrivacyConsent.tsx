
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Camera, MapPin, Smartphone, Clock } from "lucide-react";

interface PrivacyConsentProps {
  isOpen: boolean;
  onConsent: (consents: ConsentData) => void;
  onDecline: () => void;
}

export interface ConsentData {
  basicVerification: boolean;
  locationAccess: boolean;
  cameraSnapshot: boolean;
  deviceInfo: boolean;
  timestampLogging: boolean;
}

export const PrivacyConsent = ({ isOpen, onConsent, onDecline }: PrivacyConsentProps) => {
  const [consents, setConsents] = useState<ConsentData>({
    basicVerification: true, // Required
    locationAccess: false,
    cameraSnapshot: false,
    deviceInfo: false,
    timestampLogging: false,
  });

  const handleConsentChange = (key: keyof ConsentData, value: boolean) => {
    setConsents(prev => ({ ...prev, [key]: value }));
  };

  const handleAccept = () => {
    onConsent(consents);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Privacy & Data Collection Notice</span>
          </DialogTitle>
          <DialogDescription>
            We respect your privacy. Please review and consent to the data we collect to enhance product verification security.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Why We Collect This Data</h3>
            <p className="text-blue-800 text-sm">
              Enhanced data collection helps us detect counterfeit products, prevent fraud, and ensure the authenticity of Finolex products. All data is encrypted and used solely for security purposes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 border rounded-lg bg-gray-50">
              <Shield className="h-5 w-5 text-green-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Basic Product Verification</h4>
                    <p className="text-sm text-gray-600">Product codes, verification results, and basic scan data</p>
                  </div>
                  <div className="text-green-600 font-medium">Required</div>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Location Access</h4>
                    <p className="text-sm text-gray-600">City-level location for regional authenticity verification</p>
                  </div>
                  <Checkbox
                    checked={consents.locationAccess}
                    onCheckedChange={(checked) => handleConsentChange('locationAccess', !!checked)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <Camera className="h-5 w-5 text-orange-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Camera Snapshot</h4>
                    <p className="text-sm text-gray-600">Single image capture during scan for anomaly detection</p>
                  </div>
                  <Checkbox
                    checked={consents.cameraSnapshot}
                    onCheckedChange={(checked) => handleConsentChange('cameraSnapshot', !!checked)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <Smartphone className="h-5 w-5 text-purple-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Device Information</h4>
                    <p className="text-sm text-gray-600">Browser type, screen resolution, and device fingerprint</p>
                  </div>
                  <Checkbox
                    checked={consents.deviceInfo}
                    onCheckedChange={(checked) => handleConsentChange('deviceInfo', !!checked)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <Clock className="h-5 w-5 text-indigo-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Timestamp Logging</h4>
                    <p className="text-sm text-gray-600">Detailed timing data for fraud pattern detection</p>
                  </div>
                  <Checkbox
                    checked={consents.timestampLogging}
                    onCheckedChange={(checked) => handleConsentChange('timestampLogging', !!checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
            <p className="font-medium mb-2">Data Security & Retention:</p>
            <ul className="space-y-1 text-xs">
              <li>• All data is encrypted and stored securely</li>
              <li>• Location data is only stored at city level</li>
              <li>• Camera snapshots are processed for anomaly detection only</li>
              <li>• Data is retained for 12 months for security analysis</li>
              <li>• You can request data deletion at any time</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <Button onClick={onDecline} variant="outline" className="flex-1">
            Decline & Exit
          </Button>
          <Button onClick={handleAccept} className="flex-1 bg-blue-600 hover:bg-blue-700">
            Accept & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
