# Patient Photo Charting Mode - Implementation Summary

## Overview
Implementation of patient photo charting mode for the InteractiveFaceChart component, allowing practitioners to chart injection points directly on patient photos instead of generic face diagrams.

## Changes Made

### 1. New Props Added to `InteractiveFaceChartProps`

```typescript
interface InteractiveFaceChartProps {
  // ... existing props
  patientPhotoUrl?: string  // URL of patient's photo to chart on
  onPhotoUpload?: (file: File) => void  // Handler for uploading a new photo
}
```

### 2. New Type Definition

```typescript
type ChartingSource = 'diagram' | 'photo'
```

### 3. New State Variables

```typescript
// Photo charting mode state
const [chartingSource, setChartingSource] = useState<ChartingSource>('diagram')

// File upload ref
const fileInputRef = useRef<HTMLInputElement>(null)
```

### 4. New Icons Imported

```typescript
import {
  // ... existing imports
  Image as ImageIcon,
  Upload,
  User
} from 'lucide-react'
```

### 5. Photo Upload Handler

```typescript
const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (file && onPhotoUpload) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    onPhotoUpload(file)
    toast.success('Photo uploaded successfully')
  }
}, [onPhotoUpload])
```

### 6. New Toggle in Toolbar

Added a toggle button group in the toolbar (before the Drawing Mode Toggle):

```typescript
{/* Charting Source Toggle (Diagram vs Photo) */}
<div className="flex items-center bg-gray-100 rounded-lg p-0.5">
  <button
    onClick={() => setChartingSource('diagram')}
    className={/* ... */}
  >
    <ImageIcon className="w-3.5 h-3.5" />
    Face Diagram
  </button>
  <button
    onClick={() => setChartingSource('photo')}
    className={/* ... */}
  >
    <User className="w-3.5 h-3.5" />
    Patient Photo
  </button>
</div>
```

### 7. Upload Notice Banner

When in photo mode without a photo:

```typescript
{chartingSource === 'photo' && !patientPhotoUrl && (
  <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-blue-600" />
        <span className="text-sm text-blue-800">
          <strong>Patient Photo Mode:</strong> Upload a photo to chart on
        </span>
      </div>
      {onPhotoUpload && (
        <button onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4" />
          Upload Photo
        </button>
      )}
    </div>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handlePhotoUpload}
      className="hidden"
    />
  </div>
)}
```

### 8. Conditional Image Rendering

Modified the face image container to conditionally render diagram or photo:

```typescript
<div
  ref={imageContainerRef}
  className={`relative w-full max-w-lg mx-auto ${
    drawingMode === 'freehand' ? 'cursor-crosshair' : ''
  }`}
  style={{
    aspectRatio: chartingSource === 'diagram'
      ? (gender === 'female' ? '546/888' : '585/847')
      : '3/4', // Standard portrait ratio for patient photos
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'center'
  }}
>
  {/* Render diagram or patient photo based on mode */}
  {chartingSource === 'diagram' ? (
    <Image
      src={`/images/face-chart-${gender}.png`}
      alt={`${gender} face chart for injection mapping`}
      fill
      className="object-contain"
      style={{ opacity: 0.85 }}
      priority
    />
  ) : patientPhotoUrl ? (
    <Image
      src={patientPhotoUrl}
      alt="Patient photo for injection mapping"
      fill
      className="object-contain"
      style={{ opacity: 0.9 }}
      priority
    />
  ) : (
    // Placeholder when in photo mode but no photo uploaded
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center p-8">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-600 mb-2">No Patient Photo</p>
        <p className="text-xs text-gray-400 mb-4">Upload a photo to chart injection points</p>
        {onPhotoUpload && (
          <button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" />
            Upload Photo
          </button>
        )}
      </div>
    </div>
  )}
</div>
```

### 9. Zone Overlay Behavior in Photo Mode

Modified zone overlay rendering to intelligently show/hide zones in photo mode:

```typescript
{/* Only show zone overlays in diagram mode or when zones are already placed */}
{(chartingSource === 'diagram' || injectionPoints.size > 0) && (
  <div className="absolute inset-0">
    {activeZones.map(zone => {
      // ... zone rendering logic

      // In photo mode, only show zones that have been placed
      if (chartingSource === 'photo' && !hasInjection && drawingMode !== 'zones') {
        return null
      }

      // ... rest of rendering
    })}
  </div>
)}
```

### 10. Updated Legend

Added photo mode indicator to legend:

```typescript
{chartingSource === 'photo' && (
  <div className="flex items-center gap-1.5">
    <User className="w-3 h-3 text-blue-500" />
    <span>Photo Mode</span>
  </div>
)}
```

## Key Features

1. **Toggle Between Modes**: Practitioners can switch between generic face diagrams and patient photos
2. **Photo Upload**: When in photo mode without a photo, prominent upload buttons are displayed
3. **File Validation**: Validates image file type and size (max 10MB)
4. **Responsive Aspect Ratio**: Adjusts container aspect ratio based on source type
5. **Zone Overlay Preservation**: The same percentage-based zone positioning works on both diagrams and photos
6. **Smart Zone Display**: In photo mode, only shows zone markers that have been placed (cleaner interface)
7. **Freehand Points**: Freehand mode works seamlessly on both diagrams and patient photos
8. **Visual Indicators**: Clear UI indicators showing which mode is active

## Usage Example

```typescript
<InteractiveFaceChart
  productType="neurotoxin"
  gender="female"
  injectionPoints={injectionPoints}
  onInjectionPointsChange={handleInjectionPointsChange}
  patientPhotoUrl="https://example.com/patient-photos/patient-123.jpg"
  onPhotoUpload={async (file) => {
    // Upload file to storage
    const url = await uploadToS3(file)
    // Update patient record with photo URL
    setPatientPhotoUrl(url)
  }}
/>
```

## Benefits

1. **Clinical Accuracy**: Chart directly on patient's actual face for more precise treatment documentation
2. **Better Patient Communication**: Show patients exactly where treatments were performed
3. **Before/After Documentation**: Use multiple photos from different treatment dates
4. **Flexibility**: Seamlessly switch between generic diagrams and patient photos
5. **Same Workflow**: All existing features (zones, freehand, templates) work identically in both modes

## Technical Notes

- Zone positions use percentage-based coordinates, so they work on any image size
- Photos should ideally be frontal face shots for best zone alignment
- The 3:4 aspect ratio is used for patient photos (standard portrait)
- File upload is handled by parent component for flexibility with different storage solutions
- Photo URLs can be from any source (S3, Firebase Storage, etc.)

## Future Enhancements

1. **Photo Alignment Tools**: Allow practitioners to adjust zone positions for better alignment
2. **Multiple Views**: Support for profile and angled photos
3. **Photo Annotation**: Draw guidelines or mark anatomical landmarks
4. **Zoom and Pan**: Better controls for detailed charting on high-res photos
5. **Photo Comparison**: Side-by-side view of diagram and photo modes
