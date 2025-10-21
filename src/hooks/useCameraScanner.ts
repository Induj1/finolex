
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useCameraScanner = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useMockCamera, setUseMockCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    requestCameraPermission();
    
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      console.log('Starting camera initialization...');
      setErrorMessage(null);
      setIsLoading(true);
      setCameraReady(false);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      console.log('Requesting camera stream...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment'
        } 
      });
      
      console.log('Camera stream obtained, setting up video element...');
      streamRef.current = stream;
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        
        initTimeoutRef.current = setTimeout(() => {
          console.log('Camera initialization timeout - enabling mock mode');
          enableMockCamera();
        }, 5000);
        
        const handleVideoReady = () => {
          console.log('Video element ready');
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
            initTimeoutRef.current = null;
          }
          
          setCameraReady(true);
          setIsLoading(false);
          setHasPermission(true);
        };

        video.addEventListener('loadedmetadata', handleVideoReady, { once: true });
        video.addEventListener('canplay', handleVideoReady, { once: true });
        
        video.play().catch(error => {
          console.log('Video play failed:', error);
        });
        
        setTimeout(() => {
          if (video.videoWidth > 0 && video.videoHeight > 0 && !cameraReady) {
            console.log('Force setting camera ready based on video dimensions');
            handleVideoReady();
          }
        }, 2000);
      }
      
    } catch (error) {
      console.error('Camera access failed:', error);
      
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
      const errorMsg = error instanceof Error ? error.message : 'Camera access failed';
      setErrorMessage(errorMsg);
      setHasPermission(false);
      setIsLoading(false);
      
      setTimeout(() => {
        if (!cameraReady && !useMockCamera) {
          console.log('Auto-enabling mock camera due to camera failure');
          enableMockCamera();
        }
      }, 2000);
    }
  };

  const enableMockCamera = () => {
    console.log('Enabling mock camera mode');
    
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    
    setUseMockCamera(true);
    setCameraReady(true);
    setIsLoading(false);
    setHasPermission(true);
    setErrorMessage(null);
    
    toast({
      title: "Mock Camera Enabled",
      description: "Using simulated camera for testing. You can now scan codes.",
    });
  };

  return {
    isLoading,
    hasPermission,
    cameraReady,
    errorMessage,
    useMockCamera,
    videoRef,
    requestCameraPermission,
    enableMockCamera
  };
};
