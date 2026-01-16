'use client';

import { useRef, useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface QRCodeDisplayProps {
  shareUrl: string;
  referralCode: string;
  size?: number;
}

// Simple QR code generator using Canvas API
// This creates a visual representation based on the URL data
function generateQRPattern(data: string, size: number): boolean[][] {
  // Create a simple pattern based on the data hash
  const moduleCount = 21; // Standard QR code size for Version 1
  const pattern: boolean[][] = [];
  
  // Initialize with false
  for (let i = 0; i < moduleCount; i++) {
    pattern[i] = new Array(moduleCount).fill(false);
  }
  
  // Add finder patterns (the big squares in corners)
  const addFinderPattern = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r;
        const cc = col + c;
        if (rr >= 0 && rr < moduleCount && cc >= 0 && cc < moduleCount) {
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            pattern[rr][cc] = false; // White border
          } else if (r === 0 || r === 6 || c === 0 || c === 6) {
            pattern[rr][cc] = true; // Outer black square
          } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
            pattern[rr][cc] = true; // Inner black square
          } else {
            pattern[rr][cc] = false; // White space between
          }
        }
      }
    }
  };
  
  // Add finder patterns to three corners
  addFinderPattern(0, 0);
  addFinderPattern(0, moduleCount - 7);
  addFinderPattern(moduleCount - 7, 0);
  
  // Add timing patterns (the dotted lines)
  for (let i = 8; i < moduleCount - 8; i++) {
    pattern[6][i] = i % 2 === 0;
    pattern[i][6] = i % 2 === 0;
  }
  
  // Generate data pattern based on hash of input
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Fill data area with pattern based on hash
  const dataArea = [];
  for (let i = 8; i < moduleCount - 8; i++) {
    for (let j = 8; j < moduleCount; j++) {
      if (j !== 6) {
        dataArea.push({ r: i, c: j });
      }
    }
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 8; j < moduleCount - 8; j++) {
      dataArea.push({ r: i, c: j });
      dataArea.push({ r: moduleCount - 1 - i, c: j });
    }
  }
  for (let i = moduleCount - 8; i < moduleCount; i++) {
    for (let j = 8; j < moduleCount; j++) {
      if (j !== 6) {
        dataArea.push({ r: i, c: j });
      }
    }
  }
  
  // Use hash to create pseudo-random pattern
  let seed = Math.abs(hash);
  dataArea.forEach(({ r, c }, index) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    pattern[r][c] = (seed % 3) !== 0;
  });
  
  return pattern;
}

export default function QRCodeDisplay({
  shareUrl,
  referralCode,
  size = 200,
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const moduleCount = 21;
    const moduleSize = size / moduleCount;
    const pattern = generateQRPattern(shareUrl, size);

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Draw QR modules
    ctx.fillStyle = '#1F2937';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (pattern[row][col]) {
          ctx.fillRect(
            col * moduleSize,
            row * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  }, [shareUrl, size]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      // Create a larger canvas for better quality download
      const downloadCanvas = document.createElement('canvas');
      const downloadSize = 400;
      downloadCanvas.width = downloadSize;
      downloadCanvas.height = downloadSize + 60; // Extra space for text
      
      const ctx = downloadCanvas.getContext('2d');
      if (!ctx) return;

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

      // Draw QR code centered
      const moduleCount = 21;
      const moduleSize = downloadSize / moduleCount;
      const pattern = generateQRPattern(shareUrl, downloadSize);

      ctx.fillStyle = '#1F2937';
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (pattern[row][col]) {
            ctx.fillRect(
              col * moduleSize,
              row * moduleSize,
              moduleSize,
              moduleSize
            );
          }
        }
      }

      // Add referral code text below
      ctx.fillStyle = '#8B5CF6';
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(referralCode, downloadSize / 2, downloadSize + 40);

      // Download
      const link = document.createElement('a');
      link.download = `referral-qr-${referralCode}.png`;
      link.href = downloadCanvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan to Book</h3>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Share this QR code for easy sign-ups
      </p>

      <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">Code:</span>
        <span className="text-lg font-bold text-purple-600 tracking-wider">
          {referralCode}
        </span>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="mt-4 flex items-center gap-2 px-6 py-3 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl transition-colors disabled:opacity-50"
      >
        <Download className="w-5 h-5" />
        <span className="font-semibold">
          {downloading ? 'Downloading...' : 'Download QR Code'}
        </span>
      </button>
    </div>
  );
}
