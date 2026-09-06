"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  locationId: string;
  businessName: string;
}

export default function QRCodeGenerator({
  locationId,
  businessName,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  const feedbackUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/feedback/${locationId}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, feedbackUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      QRCode.toDataURL(feedbackUrl, {
        width: 256,
        margin: 2,
      }).then((url) => setDownloadUrl(url));
    }
  }, [feedbackUrl]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `starpress-qr-${businessName.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = downloadUrl;
    link.click();
  };

  return (
    <div className="text-center">
      <canvas ref={canvasRef} className="mx-auto mb-4 rounded-lg" />
      <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
        Scan to Rate
      </p>
      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        {feedbackUrl}
      </p>
      <button
        onClick={handleDownload}
        disabled={!downloadUrl}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
      >
        Download QR Code
      </button>
    </div>
  );
}
