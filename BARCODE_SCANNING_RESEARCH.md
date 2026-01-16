# Barcode Scanning Research for Web/PWA Applications

## Table of Contents
1. [Web BarcodeDetector API](#web-barcodedetector-api)
2. [GS1 DataMatrix Format](#gs1-datamatrix-format)
3. [JavaScript Libraries Comparison](#javascript-libraries-comparison)
4. [Offline Barcode Scanning](#offline-barcode-scanning)
5. [Camera Access & Performance](#camera-access--performance)
6. [Implementation Examples](#implementation-examples)
7. [GS1 Barcode Parsing](#gs1-barcode-parsing)
8. [Mobile PWA Best Practices](#mobile-pwa-best-practices)
9. [Recommendations](#recommendations)

---

## Web BarcodeDetector API

### Overview
The **Barcode Detection API** is an experimental browser feature that enables native barcode detection in web applications without external libraries.

### Browser Support (2025)
- **Supported**: Chrome, Edge (Desktop & Android)
- **Not Supported**: Firefox, Safari (Desktop & iOS)
- **Status**: Experimental, not Baseline compatible
- **Requirements**: HTTPS (secure context only)
- **Availability**: Works in Web Workers

### Supported Formats
| Format | Type | Use Cases |
|--------|------|-----------|
| `aztec` | 2D matrix | Boarding passes, tickets |
| `code_128` | Linear | General purpose ASCII |
| `code_39` | Linear | Variable-length encoding |
| `code_93` | Linear | Enhanced density |
| `codabar` | Linear | Blood banks, FedEx |
| `data_matrix` | 2D | **Pharmaceuticals (GS1)** |
| `ean_13` | Linear | Retail products |
| `ean_8` | Linear | Small products |
| `itf` | Linear | Cartons, cases |
| `pdf417` | 2D | Driver's licenses |
| `qr_code` | 2D | URLs, payments |
| `upc_a` | Linear | US retail |
| `upc_e` | Linear | Compressed UPC |

### Basic Implementation

```javascript
// Check browser support
if (!("BarcodeDetector" in globalThis)) {
  console.log("Barcode Detector not supported");
} else {
  // Check supported formats
  const formats = await BarcodeDetector.getSupportedFormats();
  console.log('Supported formats:', formats);

  // Create detector for specific formats
  const barcodeDetector = new BarcodeDetector({
    formats: ['data_matrix', 'qr_code', 'ean_13']
  });

  // Detect from image/video
  const barcodes = await barcodeDetector.detect(imageElement);
  barcodes.forEach(barcode => {
    console.log('Barcode:', barcode.rawValue);
    console.log('Format:', barcode.format);
    console.log('Position:', barcode.boundingBox);
  });
}
```

### Input Types Accepted
- `HTMLImageElement`
- `HTMLVideoElement`
- `HTMLCanvasElement`
- `ImageBitmap`
- `OffscreenCanvas`
- `VideoFrame`
- `Blob`
- `ImageData`

### Limitations
- **Limited browser support** - requires polyfill for cross-browser compatibility
- **Platform-dependent** - detection quality varies by device
- **No iOS support** - critical limitation for mobile apps
- **Format availability** - not all formats supported on all platforms
- **Experimental status** - API may change

### Polyfill Options
- `barcode-detection` (npm) - enables API in unsupported browsers
- Recommended to use with feature detection

---

## GS1 DataMatrix Format

### Overview
GS1 DataMatrix is the **pharmaceutical industry standard** for encoding product information on medication packaging. Required by the Drug Supply Chain Security Act (DSCSA) in the United States.

### Format Structure
**2D matrix barcode** consisting of black and white modules in a square or rectangular pattern.

**Storage Capacity**: Up to 2,335 alphanumeric characters

### Required Data Elements (DSCSA)
1. **NDC (National Drug Code)** - Product identifier
2. **Serial Number** - Unique unit identifier
3. **Lot/Batch Number** - Manufacturing batch
4. **Expiration Date** - Product expiry

### GS1 Application Identifiers (AIs)

| AI | Data Element | Format | Length |
|----|--------------|--------|--------|
| `(01)` | GTIN - Global Trade Item Number | Fixed | 14 digits |
| `(10)` | Batch/Lot Number | Variable | Up to 20 chars |
| `(17)` | Expiration Date | Fixed | 6 digits (YYMMDD) |
| `(21)` | Serial Number | Variable | Up to 20 chars |
| `(11)` | Production Date | Fixed | 6 digits (YYMMDD) |

### Example Scan Data

**Raw scan output:**
```
]d2(01)00312345678906(21)12345678(17)180630(10)ABC123
```

**Decoded:**
- **Symbology**: `]d2` (GS1 DataMatrix)
- **GTIN**: `00312345678906`
- **Serial**: `12345678`
- **Expiry**: `June 30, 2018`
- **Lot**: `ABC123`

### FNC1 Separator
- **DataMatrix/QR**: Uses ASCII Group Separator (GS, 0x1D)
- **Scanner output**: Often replaced with `Ctrl+]` or other non-printable character
- **Required**: Between variable-length AIs when followed by more data

### Global Adoption
- **United States**: DSCSA requirements
- **European Union**: EU Falsified Medicines Directive
- **India**: Pharmaceutical serialization regulations
- All require GS1 DataMatrix with GTIN, lot, expiry, and serial number

---

## JavaScript Libraries Comparison

### 1. @zxing/library

**Status**: Maintenance mode (bug fixes only)

**Supported Formats**:
- **1D Product**: UPC-A, UPC-E, EAN-8, EAN-13
- **1D Industrial**: Code 39, Code 93, Code 128, Codabar, ITF, RSS-14
- **2D**: QR Code, **Data Matrix**, Aztec, PDF 417

**Installation**:
```bash
npm install @zxing/library
# or
yarn add @zxing/library
```

**Pros**:
- Comprehensive format support including DataMatrix
- Good for QR codes and Data Matrix
- TypeScript support
- Widely used and documented

**Cons**:
- Maintenance mode only (limited updates)
- Can struggle with damaged/poorly lit barcodes
- Lower recognition rates for small barcodes
- Requires polyfills for older browsers

**Best For**: QR codes, Data Matrix (pharmaceuticals), multi-format support

---

### 2. react-zxing

**Wrapper for @zxing/library optimized for React**

**Installation**:
```bash
npm install react-zxing
```

**Usage**:
```jsx
import { useZxing } from "react-zxing";

export const BarcodeScanner = () => {
  const [result, setResult] = useState("");

  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
    },
  });

  return (
    <>
      <video ref={ref} />
      <p>Result: {result}</p>
    </>
  );
};
```

**Pros**:
- Simple React hook API
- Handles video stream setup
- Minimal boilerplate
- TypeScript support

**Cons**:
- Inherits @zxing/library limitations
- Less control over scanning parameters

**Best For**: Quick React integration with minimal setup

---

### 3. @ericblade/quagga2

**Advanced 1D barcode scanner (continuation of QuaggaJS)**

**Supported Formats**:
- EAN-13, EAN-8
- CODE 128, CODE 39, CODE 93, CODE 32
- UPC-A, UPC-E
- CODABAR
- I2of5, 2of5
- PHARMACODE

**Installation**:
```bash
npm install @ericblade/quagga2
```

**Basic Usage**:
```javascript
import Quagga from '@ericblade/quagga2';

Quagga.init({
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: document.querySelector('#scanner'),
    constraints: {
      width: 640,
      height: 480,
      facingMode: "environment"
    },
  },
  decoder: {
    readers: ["ean_reader", "code_128_reader"],
  }
}, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  Quagga.start();
});

Quagga.onDetected((result) => {
  console.log("Barcode detected:", result.codeResult.code);
});
```

**Configuration Options**:

```javascript
{
  locate: true,  // Enable pattern detection (more CPU intensive)
  locator: {
    patchSize: "medium",  // "x-small" | "small" | "medium" | "large" | "x-large"
    halfSample: true,     // Process at half resolution (faster)
  },
  decoder: {
    readers: ["code_128_reader", "ean_reader"],  // Order matters!
  },
  frequency: 10,  // Max scans per second
}
```

**Pros**:
- Excellent for 1D barcodes
- Highly configurable
- Good performance optimization options
- Active React examples available

**Cons**:
- **No 2D barcode support** (no DataMatrix, QR codes)
- More complex configuration
- Last published 2 years ago

**Best For**: 1D barcodes only (EAN, UPC, Code 128)
**Not suitable for**: Pharmaceutical DataMatrix scanning

**React Integration**: See [quagga2-react-example](https://github.com/ericblade/quagga2-react-example)

---

### 4. html5-qrcode

**Easy-to-use QR and barcode scanner**

**Installation**:
```bash
npm install html5-qrcode
```

**Features**:
- File upload scanning
- Camera scanning
- PWA compatible

**Pros**:
- Simple API
- Works in PWAs
- Camera and file scanning

**Cons**:
- Uses ZXing.js under the hood (no longer supported)
- Less performant than alternatives
- Limited barcode type support
- Variable scanning results across devices

**Best For**: Simple QR code scanning, file uploads

---

### Library Comparison Table

| Library | DataMatrix | 1D Barcodes | Performance | Active Development | React Support |
|---------|------------|-------------|-------------|-------------------|---------------|
| **@zxing/library** | ✅ Yes | ✅ Yes | Good | ⚠️ Maintenance | ✅ Via wrapper |
| **react-zxing** | ✅ Yes | ✅ Yes | Good | ⚠️ Depends on ZXing | ✅ Native |
| **quagga2** | ❌ No | ✅ Excellent | Excellent | ⚠️ Stable | ✅ Examples |
| **html5-qrcode** | ⚠️ Limited | ⚠️ Limited | Fair | ✅ Yes | ⚠️ Possible |
| **BarcodeDetector API** | ✅ Yes | ✅ Yes | Native | ✅ Browser | ✅ Yes |

---

## Offline Barcode Scanning

### PWA Requirements
For offline functionality, your PWA must:

1. **Use HTTPS** - Required for service workers
2. **Include Web Manifest** - `manifest.json`
3. **Register Service Worker** - Cache resources

### Service Worker Implementation

```javascript
// service-worker.js
const CACHE_NAME = 'barcode-scanner-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/barcode-library.js',  // Your barcode scanning library
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### Library Offline Capabilities

**✅ Work Offline**:
- **@zxing/library** - Pure JavaScript, works offline once cached
- **quagga2** - WebAssembly-based, works offline
- **Scanbot SDK** - Explicitly supports offline mode
- **STRICH** - Offers offline add-on package

**⚠️ May Require Setup**:
- **html5-qrcode** - Works offline if properly cached
- **BarcodeDetector API** - Native, works offline on supported browsers

### Create React App with PWA Template

```bash
npx create-react-app my-scanner --template cra-template-pwa
```

This provides `src/service-worker.js` starter file for offline functionality.

### Web Manifest Example

```json
{
  "short_name": "Scanner",
  "name": "Barcode Scanner",
  "icons": [
    {
      "src": "icon-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "icon-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "/",
  "background_color": "#ffffff",
  "display": "standalone",
  "scope": "/",
  "theme_color": "#000000"
}
```

---

## Camera Access & Performance

### getUserMedia API

```javascript
// Request camera access
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },  // Back camera on mobile
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    videoElement.srcObject = stream;
    await videoElement.play();
  } catch (error) {
    console.error('Camera access denied:', error);
  }
}
```

### Camera Constraints for Barcode Scanning

```javascript
const constraints = {
  video: {
    facingMode: { ideal: 'environment' },  // Rear camera
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    aspectRatio: { ideal: 16/9 },
    frameRate: { ideal: 30, max: 60 },
    // Advanced features
    focusMode: { ideal: 'continuous' },
    whiteBalanceMode: { ideal: 'continuous' },
    exposureMode: { ideal: 'continuous' }
  }
};
```

### Permission Handling

```javascript
// Check permission status
async function checkCameraPermission() {
  try {
    const result = await navigator.permissions.query({ name: 'camera' });

    if (result.state === 'granted') {
      console.log('Camera permission granted');
    } else if (result.state === 'prompt') {
      console.log('Camera permission will be requested');
    } else {
      console.log('Camera permission denied');
    }

    // Listen for permission changes
    result.addEventListener('change', () => {
      console.log('Camera permission changed:', result.state);
    });
  } catch (error) {
    console.error('Permission check failed:', error);
  }
}
```

### iOS Considerations

**iOS 14.3+ Requirements**:
- WebRTC support in third-party browsers (arrived Dec 2020)
- Earlier versions: Safari only for camera access
- **iOS PWA Limitation**: No camera streaming in installed PWAs (as of 2025)
- **Workaround**: Use in-browser instead of installed PWA

### Performance Optimization Strategies

#### 1. Reduce Processing Area
```javascript
// Only scan center region instead of full frame
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Extract center portion
const cropWidth = 400;
const cropHeight = 300;
const cropX = (video.videoWidth - cropWidth) / 2;
const cropY = (video.videoHeight - cropHeight) / 2;

canvas.width = cropWidth;
canvas.height = cropHeight;

ctx.drawImage(
  video,
  cropX, cropY, cropWidth, cropHeight,  // Source
  0, 0, cropWidth, cropHeight            // Destination
);
```

#### 2. Frame Rate Throttling
```javascript
// Don't scan every frame - use requestAnimationFrame with throttling
let lastScanTime = 0;
const scanInterval = 100; // Scan every 100ms (10fps)

function scanLoop(timestamp) {
  if (timestamp - lastScanTime >= scanInterval) {
    performScan();
    lastScanTime = timestamp;
  }
  requestAnimationFrame(scanLoop);
}

requestAnimationFrame(scanLoop);
```

#### 3. Image Downscaling
```javascript
// Process at half resolution
const scaleDown = 0.5;
canvas.width = video.videoWidth * scaleDown;
canvas.height = video.videoHeight * scaleDown;
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
```

#### 4. Limit Barcode Formats
```javascript
// Only scan for formats you need
const decoder = new BarcodeDetector({
  formats: ['data_matrix']  // Only DataMatrix, faster than all formats
});
```

#### 5. WebAssembly for Performance
- Quagga2 uses WebAssembly for better performance
- Scanbot SDK uses WebAssembly
- Significantly faster than pure JavaScript on low-end devices

#### 6. Auto-Focus and Zoom
```javascript
// Use advanced camera capabilities
const track = stream.getVideoTracks()[0];
const capabilities = track.getCapabilities();

if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
  await track.applyConstraints({
    advanced: [{ focusMode: 'continuous' }]
  });
}

// Zoom for better scanning
if (capabilities.zoom) {
  await track.applyConstraints({
    advanced: [{ zoom: 2.0 }]
  });
}
```

### Browser Compatibility Best Practices

```javascript
// Feature detection
function supportsGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function supportsBarcodeDetector() {
  return 'BarcodeDetector' in window;
}

// Graceful degradation
async function initScanner() {
  if (!supportsGetUserMedia()) {
    showError('Camera not supported in this browser');
    return;
  }

  if (supportsBarcodeDetector()) {
    // Use native API
    return new BarcodeDetector({ formats: ['data_matrix'] });
  } else {
    // Use polyfill or library
    const { BrowserMultiFormatReader } = await import('@zxing/library');
    return new BrowserMultiFormatReader();
  }
}
```

### Stream Cleanup

```javascript
// Always stop streams when done
function stopCamera() {
  if (videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
  }
}

// React cleanup example
useEffect(() => {
  startCamera();

  return () => {
    stopCamera(); // Cleanup on unmount
  };
}, []);
```

---

## Implementation Examples

### Example 1: Next.js with BarcodeDetector API

```typescript
// components/BarcodeScanner.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  onScan: (barcode: string, format: string) => void;
  formats?: string[];
}

export default function BarcodeScanner({
  onScan,
  formats = ['data_matrix', 'qr_code', 'ean_13']
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number>();
  const detectorRef = useRef<BarcodeDetector | null>(null);

  useEffect(() => {
    initScanner();
    return () => cleanup();
  }, []);

  const initScanner = async () => {
    try {
      // Check browser support
      if (!('BarcodeDetector' in window)) {
        throw new Error('BarcodeDetector not supported');
      }

      // Initialize detector
      detectorRef.current = new BarcodeDetector({ formats });

      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        scanLoop();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scanner initialization failed');
      console.error('Scanner error:', err);
    }
  };

  const scanLoop = async () => {
    if (!isScanning || !videoRef.current || !canvasRef.current || !detectorRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    // Extract center region for scanning
    const cropSize = 300;
    const x = (video.videoWidth - cropSize) / 2;
    const y = (video.videoHeight - cropSize) / 2;

    canvas.width = cropSize;
    canvas.height = cropSize;

    ctx.drawImage(video, x, y, cropSize, cropSize, 0, 0, cropSize, cropSize);

    try {
      const barcodes = await detectorRef.current.detect(canvas);

      if (barcodes.length > 0) {
        const barcode = barcodes[0];
        onScan(barcode.rawValue, barcode.format);
        // Stop scanning after successful detection
        setIsScanning(false);
        return;
      }
    } catch (err) {
      console.error('Detection error:', err);
    }

    animationFrameRef.current = requestAnimationFrame(scanLoop);
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="barcode-scanner">
      {error && <div className="error">{error}</div>}

      <div className="scanner-container">
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Scanning overlay */}
        <div className="scan-overlay">
          <div className="scan-box" />
        </div>
      </div>

      <style jsx>{`
        .scanner-container {
          position: relative;
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
        }

        video {
          width: 100%;
          height: auto;
          display: block;
        }

        .scan-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scan-box {
          width: 250px;
          height: 250px;
          border: 2px solid #00ff00;
          border-radius: 8px;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
        }

        .error {
          background: #ff4444;
          color: white;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}
```

### Example 2: react-zxing Hook

```typescript
import { useZxing } from 'react-zxing';
import { useState } from 'react';

export default function SimpleScanner() {
  const [result, setResult] = useState('');

  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
    },
    onError(error) {
      console.error('Scan error:', error);
    },
    constraints: {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }
  });

  return (
    <div>
      <video ref={ref} style={{ width: '100%', maxWidth: '640px' }} />
      <p>Result: {result || 'Scanning...'}</p>
    </div>
  );
}
```

### Example 3: GS1 Pharmaceutical Scanner

```typescript
import { useZxing } from 'react-zxing';
import { useState } from 'react';

interface MedicationData {
  ndc: string;
  lotNumber: string;
  expirationDate: Date;
  serialNumber: string;
  scannedAt: Date;
}

export default function PharmaceuticalScanner() {
  const [medicationData, setMedicationData] = useState<MedicationData | null>(null);
  const [error, setError] = useState<string>('');

  const { ref } = useZxing({
    onDecodeResult(result) {
      const scannedData = result.getText();
      processMedicationBarcode(scannedData);
    },
    constraints: {
      video: {
        facingMode: 'environment'
      }
    }
  });

  const processMedicationBarcode = (scannedData: string) => {
    try {
      // Parse GS1 data
      const parsed = parseGS1Barcode(scannedData);

      const medication: MedicationData = {
        ndc: extractNDCFromGTIN(parsed['01'] || ''),
        lotNumber: parsed['10'] || '',
        expirationDate: parseGS1Date(parsed['17'] || ''),
        serialNumber: parsed['21'] || '',
        scannedAt: new Date()
      };

      // Validate required fields
      if (!medication.ndc || !medication.lotNumber || !medication.serialNumber) {
        throw new Error('Missing required medication data');
      }

      setMedicationData(medication);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse barcode');
    }
  };

  const parseGS1Barcode = (data: string): Record<string, string> => {
    const result: Record<string, string> = {};
    // Remove symbology identifier if present
    const cleanData = data.replace(/^\]d2/, '');

    // Simple regex to extract AIs and their values
    const regex = /\((\d{2,4})\)([^(]+)/g;
    let match;

    while ((match = regex.exec(cleanData)) !== null) {
      result[match[1]] = match[2].trim();
    }

    return result;
  };

  const extractNDCFromGTIN = (gtin: string): string => {
    // Simplified NDC extraction from GTIN-14
    return gtin.substring(3, 13);
  };

  const parseGS1Date = (gs1Date: string): Date => {
    if (gs1Date.length !== 6) throw new Error('Invalid date format');

    const year = parseInt(gs1Date.substring(0, 2));
    const month = parseInt(gs1Date.substring(2, 4)) - 1;
    const day = parseInt(gs1Date.substring(4, 6));
    const fullYear = year <= 50 ? 2000 + year : 1900 + year;

    return new Date(fullYear, month, day);
  };

  return (
    <div className="pharmaceutical-scanner">
      <h2>Scan Medication Barcode</h2>

      <div className="scanner-view">
        <video ref={ref} style={{ width: '100%', maxWidth: '640px' }} />
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {medicationData && (
        <div className="medication-info">
          <h3>Medication Information</h3>
          <dl>
            <dt>NDC:</dt>
            <dd>{medicationData.ndc}</dd>

            <dt>Lot Number:</dt>
            <dd>{medicationData.lotNumber}</dd>

            <dt>Expiration Date:</dt>
            <dd>{medicationData.expirationDate.toLocaleDateString()}</dd>

            <dt>Serial Number:</dt>
            <dd>{medicationData.serialNumber}</dd>

            <dt>Scanned At:</dt>
            <dd>{medicationData.scannedAt.toLocaleString()}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}
```

---

## GS1 Barcode Parsing

### Libraries for GS1 Parsing

#### 1. BarcodeParser (PeterBrockfeld)

```html
<!-- Include via CDN -->
<script src="https://cdn.jsdelivr.net/gh/PeterBrockfeld/BarcodeParser@HEAD/scripts/BarcodeParser.min.js"></script>
```

```javascript
// Parse GS1 barcode
const scannedData = "]d2(01)00312345678906(21)12345678(17)250630(10)LOT123";

const result = parseBarcode(scannedData);

// Build human-readable output
let output = '';
for (let item of result.parsedCodeItems) {
  output += `${item.ai} (${item.dataTitle}): ${item.data}\n`;
}

console.log(output);
// Output:
// 01 (GTIN): 00312345678906
// 21 (SERIAL): 12345678
// 17 (USE BY): 250630
// 10 (BATCH/LOT): LOT123
```

#### 2. gs1-barcode-parser (npm)

```bash
npm install gs1-barcode-parser
```

```javascript
import { parseBarcode } from 'gs1-barcode-parser';

const data = "(01)00312345678906(17)250630(10)ABC123(21)SN12345";
const parsed = parseBarcode(data);

// Access specific AIs
const gtin = parsed.get('01');
const expiry = parsed.get('17');
const lot = parsed.get('10');
const serial = parsed.get('21');
```

#### 3. interpretGS1scan (Official GS1)

```bash
npm install gs1-digitallink-toolkit
```

```javascript
import { interpretScan } from 'gs1-digitallink-toolkit';

const scanData = "0108806388269617112302141728021310230214A3263-0121059";
const result = interpretScan(scanData);

// Access parsed elements
result.ol.forEach(element => {
  console.log(`AI ${element.ai}: ${element.value} (${element.label})`);
});
```

### Key Application Identifiers

| AI | Description | Format | Example |
|----|-------------|--------|---------|
| `(01)` | GTIN | 14 digits | 00312345678906 |
| `(10)` | Batch/Lot | Variable, max 20 | LOT-ABC-123 |
| `(17)` | Expiration Date | YYMMDD | 250630 (Jun 30, 2025) |
| `(21)` | Serial Number | Variable, max 20 | SN9876543 |
| `(11)` | Production Date | YYMMDD | 250101 |

---

## Mobile PWA Best Practices

### 1. HTTPS Requirement
All camera features require HTTPS in production (localhost is okay for development)

### 2. Feature Detection
```typescript
async function checkCapabilities() {
  return {
    hasCamera: !!(navigator.mediaDevices?.getUserMedia),
    hasBarcodeDetector: 'BarcodeDetector' in window,
    isSecureContext: window.isSecureContext
  };
}
```

### 3. iOS Handling
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isIOSPWA = window.navigator.standalone === true;

if (isIOS && isIOSPWA) {
  // Camera streaming not supported in iOS PWA
  // Show file upload alternative
  showFileUploadOption();
}
```

### 4. Performance Monitoring
```typescript
// Track scan performance
const startTime = performance.now();
// ... scanning ...
const duration = performance.now() - startTime;
console.log(`Scan took ${duration}ms`);
```

### 5. Offline Storage
```typescript
// Store scanned data offline using IndexedDB
import { openDB } from 'idb';

const db = await openDB('barcode-scanner', 1, {
  upgrade(db) {
    db.createObjectStore('scans', { keyPath: 'id', autoIncrement: true });
  }
});

await db.add('scans', {
  ...medicationData,
  synced: false,
  timestamp: Date.now()
});
```

### 6. Battery Optimization
```typescript
// Reduce scan frequency on low battery
if ('getBattery' in navigator) {
  const battery = await navigator.getBattery();
  if (battery.level < 0.20) {
    scanInterval = 200; // Slower scanning
  }
}
```

---

## Recommendations

### For Medical Spa Platform (Pharmaceutical Scanning)

#### Primary Recommendation: react-zxing + gs1-barcode-parser

**Installation:**
```bash
npm install react-zxing gs1-barcode-parser
```

**Reasons:**
1. ✅ **DataMatrix support** - Essential for pharmaceutical barcodes
2. ✅ **Cross-platform** - Works on iOS and Android
3. ✅ **Offline capable** - No external dependencies
4. ✅ **React integration** - Easy to use with hooks
5. ✅ **Active community** - Good documentation

**Implementation:**
```typescript
import { useZxing } from 'react-zxing';
import { parseBarcode } from 'gs1-barcode-parser';

export default function MedicationScanner({ onScan }) {
  const { ref } = useZxing({
    onDecodeResult(result) {
      const parsed = parseBarcode(result.getText());
      onScan(parsed);
    }
  });

  return <video ref={ref} />;
}
```

#### Architecture Recommendation

```
apps/admin/src/
├── components/
│   └── barcode/
│       ├── BarcodeScanner.tsx
│       ├── ScannerOverlay.tsx
│       └── MedicationScanResult.tsx
├── hooks/
│   └── useBarcodeScanner.ts
├── lib/
│   └── barcode/
│       ├── scanner.ts
│       ├── gs1-parser.ts
│       └── ndc-lookup.ts
└── types/
    └── barcode.ts
```

### Next Steps

1. Install dependencies: `npm install react-zxing gs1-barcode-parser`
2. Create scanner component
3. Add GS1 parser utility functions
4. Integrate with billing form
5. Test on mobile devices
6. Implement offline storage
7. Add error handling

---

## Sources

- [Barcode Detection API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API)
- [BarcodeDetector API Browser Support](https://caniuse.com/mdn-api_barcodedetector)
- [GS1 DataMatrix White Paper](https://www.ncpdp.org/NCPDP/media/pdf/WhitePaper/GS1-DataMatrix-White-Paper-v1.pdf)
- [GS1 DataMatrix Guideline](https://www.gs1.org/standards/gs1-datamatrix-guideline/25)
- [ZXing TypeScript Library](https://github.com/zxing-js/library)
- [react-zxing npm](https://www.npmjs.com/package/react-zxing)
- [Quagga2 GitHub](https://github.com/ericblade/quagga2)
- [GS1 interpretGS1scan](https://github.com/gs1/interpretGS1scan)
- [BarcodeParser Library](https://github.com/PeterBrockfeld/BarcodeParser)
- [PWA Camera Access Guide](https://simicart.com/blog/pwa-camera-access/)
- [Next.js Barcode Scanner Tutorial](https://scanbot.io/techblog/next-js-barcode-scanner-tutorial/)
