"use client";

import { useRef, useState } from "react";
import { createMoment, saveMoment, type GpsLocation, type MomentTag } from "../lib/moments";
import { getLocationWithLabel } from "../lib/location";
import TagsModal from "./TagsModal";

interface PendingCapture {
  photoDataUrl: string;
  gps: GpsLocation | null;
}

export default function CameraButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastMoment, setLastMoment] = useState<{ time: string; placeLabel: string | null } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [pendingCapture, setPendingCapture] = useState<PendingCapture | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);

    const locationPromise = getLocationWithLabel();

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const gpsLocation = await locationPromise;
      
      setPendingCapture({
        photoDataUrl: dataUrl,
        gps: gpsLocation,
      });
      setIsCapturing(false);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveMoment = (tags: MomentTag[], notes: string) => {
    if (!pendingCapture) return;
    
    const moment = createMoment(pendingCapture.photoDataUrl, pendingCapture.gps, tags, notes);
    saveMoment(moment);
    setLastMoment({ 
      time: moment.timestampLocal, 
      placeLabel: pendingCapture.gps?.placeLabel || null 
    });
    setPendingCapture(null);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  const handleCancelCapture = () => {
    setPendingCapture(null);
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Take photo"
      />
      <button
        onClick={handleClick}
        disabled={isCapturing}
        className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-transform ${
          isCapturing 
            ? 'bg-amber-400 cursor-wait' 
            : 'bg-amber-500 hover:scale-105 hover:bg-amber-600 active:scale-95'
        }`}
        aria-label="Capture moment"
        data-testid="camera-button"
      >
        {isCapturing ? (
          <svg
            className="h-8 w-8 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
            />
          </svg>
        )}
      </button>

      {pendingCapture && (
        <TagsModal 
          photoDataUrl={pendingCapture.photoDataUrl}
          onSave={handleSaveMoment}
          onCancel={handleCancelCapture}
        />
      )}

      {showConfirmation && lastMoment && (
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-lg bg-green-600 px-4 py-2 text-center text-sm text-white shadow-lg"
          role="alert"
          data-testid="capture-confirmation"
        >
          <div>✓ Moment captured at {lastMoment.time}</div>
          {lastMoment.placeLabel && (
            <div className="text-xs opacity-90">📍 {lastMoment.placeLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}
