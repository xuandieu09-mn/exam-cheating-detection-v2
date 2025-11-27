# OpenCV.js Migration Summary

## What Was Done

Successfully migrated from **native browser MediaStream API** to **OpenCV.js** for webcam capture and face detection.

## Changes Made

### 1. Package Installation
```bash
npm install @techstark/opencv-js
```

### 2. New Files Created

**frontend/src/lib/hooks/useOpenCVWebcam.ts**
- Full OpenCV.js implementation
- Haar Cascade face detection
- Real-time face counting
- Image enhancement (grayscale, histogram equalization)
- Error handling and cleanup

**frontend/public/haarcascade_frontalface_default.xml**
- Pre-trained face detection model (930KB)
- Downloaded from OpenCV repository

**docs/OPENCV_INTEGRATION.md**
- Complete documentation
- Usage examples
- Troubleshooting guide

### 3. Modified Files

**frontend/src/lib/hooks/useWebcam.ts**
- Enhanced with basic OpenCV support
- Backward compatible
- Added `enableFaceDetection` option

**frontend/src/pages/MockExamPage.tsx**
- Changed import from `useWebcam` to `useOpenCVWebcam`
- Added canvas element for OpenCV output
- Added face count indicator (green/yellow/red badges)
- Added OpenCV loading state
- Added error display

## Features Added

### Real-time Face Detection
- Detects 0, 1, or multiple faces
- Draws green rectangles around detected faces
- Updates face count badge:
  - 🟢 Green: 1 face (normal)
  - 🟡 Yellow: 0 faces (warning)
  - 🔴 Red: 2+ faces (violation)

### Image Processing
- Grayscale conversion
- Histogram equalization (better contrast)
- Gaussian blur (noise reduction)
- Quality: 85% JPEG

### Visual Feedback
- Canvas preview with face detection boxes
- Face count indicator
- OpenCV loading state
- Error messages
- REC indicator maintained

## Build Result

✅ **Build successful**
- Bundle size: 11.06 MB (3.59 MB gzipped)
- OpenCV.js adds ~8MB to bundle
- Warnings about chunk size (expected with OpenCV)

## How It Works

```
Camera → Video Element (hidden) → Canvas
                                    ↓
                          OpenCV cv.imread()
                                    ↓
                          Grayscale + Enhance
                                    ↓
                          Face Detection (Haar Cascade)
                                    ↓
                          Draw Rectangles
                                    ↓
                          Display on Canvas
                                    ↓
                          Convert to Blob → Upload
```

## Usage Example

```typescript
const { videoRef, canvasRef, faceCount, cvReady, error } = useOpenCVWebcam({
  onSnapshot: async (blob, detectedFaces) => {
    // blob contains processed image with face boxes
    // detectedFaces is the number of faces (0, 1, 2+)
    await ingestApi.uploadSnapshot(sessionId, blob);
  },
  captureInterval: 3000,
  enabled: !!sessionId && !submitting,
  enableFaceDetection: true,
  onFaceCountChange: (count) => {
    console.log(`Detected ${count} faces`);
  }
});
```

## Testing

To test the OpenCV integration:

```bash
cd frontend
npm run dev
```

Navigate to exam page and verify:
1. Camera preview shows in canvas (not video element)
2. Face detection indicator appears (green/yellow/red)
3. Face count updates when you move/add people
4. Green rectangles drawn around detected faces
5. Console logs show "OpenCV.js is ready"
6. Snapshots upload every 3 seconds

## Performance

- **Initialization**: ~1-2 seconds (OpenCV + cascade loading)
- **Face detection**: ~50-100ms per frame
- **Bundle size**: +8MB (3.6MB gzipped)
- **Memory usage**: +50-100MB (OpenCV runtime)

## Browser Compatibility

✅ Chrome, Firefox, Safari, Edge (all modern versions)
Requires WebAssembly support

## Migration Path

If you need to revert to native API:

1. Change import in `MockExamPage.tsx`:
```typescript
import { useWebcam } from '@/lib/hooks/useWebcam';
```

2. Use simple hook:
```typescript
const { videoRef } = useWebcam({
  onSnapshot: handleSnapshot,
  captureInterval: 3000,
  enabled: !!sessionId && !submitting
});
```

3. Change JSX to use video instead of canvas

## Known Issues

⚠️ Large bundle size warning (expected with OpenCV)
- Can be improved with dynamic import
- Consider code splitting for production

⚠️ fs/path/crypto externalized warnings (safe to ignore)
- OpenCV.js tries to use Node.js modules
- Vite automatically handles browser compatibility

## Next Steps

Optional enhancements:
- [ ] Add emotion detection
- [ ] Add gaze tracking
- [ ] Add object detection (phones, books)
- [ ] Optimize bundle size with dynamic import
- [ ] Add face recognition (identify specific person)

## Documentation

Full documentation available at:
- `docs/OPENCV_INTEGRATION.md` - Complete guide
- `frontend/public/README.md` - Public assets info
- `frontend/src/lib/hooks/useOpenCVWebcam.ts` - Code comments
