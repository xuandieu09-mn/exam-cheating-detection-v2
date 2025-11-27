# OpenCV.js Integration Documentation

## Overview
The exam monitoring system now uses **OpenCV.js** for advanced webcam capture and client-side face detection instead of native browser APIs.

## What Changed

### Before (Native Browser API)
- Used `navigator.mediaDevices.getUserMedia()` directly
- Canvas-based snapshot capture
- No client-side face detection
- Simple video preview

### After (OpenCV.js)
- OpenCV.js library for image processing
- Real-time face detection using Haar Cascade
- Visual feedback with face count indicator
- Green rectangles drawn around detected faces
- Enhanced image quality with histogram equalization

## Installation

```bash
cd frontend
npm install @techstark/opencv-js
```

## Files Modified

1. **frontend/src/lib/hooks/useWebcam.ts** - Enhanced with OpenCV support
2. **frontend/src/lib/hooks/useOpenCVWebcam.ts** - NEW: Dedicated OpenCV hook with full face detection
3. **frontend/src/pages/MockExamPage.tsx** - Updated to use OpenCV hook
4. **frontend/public/haarcascade_frontalface_default.xml** - Face detection model

## Usage

### Basic Usage (useOpenCVWebcam hook)

```typescript
import { useOpenCVWebcam } from '@/lib/hooks/useOpenCVWebcam';

const { videoRef, canvasRef, faceCount, cvReady, error } = useOpenCVWebcam({
  onSnapshot: async (blob, detectedFaces) => {
    // blob: JPEG image with face detection boxes drawn
    // detectedFaces: number of faces detected (0, 1, 2+)
    await uploadToServer(blob);
  },
  captureInterval: 3000,        // Capture every 3 seconds
  enabled: true,                // Start/stop camera
  enableFaceDetection: true,    // Enable Haar Cascade detection
  onFaceCountChange: (count) => {
    console.log(`Detected ${count} faces`);
  }
});

// Render
return (
  <>
    <video ref={videoRef} style={{ display: 'none' }} />
    <canvas ref={canvasRef} />
    <div>Faces detected: {faceCount}</div>
  </>
);
```

## Features

### 1. Real-time Face Detection
- Uses Haar Cascade classifier (haarcascade_frontalface_default.xml)
- Detects multiple faces in frame
- Draws green rectangles around faces
- Updates face count in real-time

### 2. Image Enhancement
- Converts to grayscale for better detection
- Applies histogram equalization for better contrast
- Gaussian blur to reduce noise

### 3. Visual Indicators
- **Green badge**: 1 face detected (normal)
- **Yellow badge**: 0 faces detected (warning)
- **Red badge**: 2+ faces detected (violation)
- **REC indicator**: Recording status
- **Loading state**: "Loading OpenCV..." while initializing

### 4. Error Handling
- Camera permission denied
- OpenCV initialization failure
- Cascade classifier loading failure
- Graceful fallback to basic capture if face detection fails

## Technical Details

### OpenCV Processing Pipeline

```
1. Video stream → Canvas (drawImage)
2. Canvas → cv.Mat (cv.imread)
3. cv.Mat → Grayscale (cv.cvtColor)
4. Grayscale → Enhanced (cv.equalizeHist)
5. Enhanced → Face Detection (CascadeClassifier.detectMultiScale)
6. Draw rectangles (cv.rectangle)
7. Display on canvas (cv.imshow)
8. Convert to Blob (canvas.toBlob)
9. Upload to server
```

### Parameters

#### CascadeClassifier.detectMultiScale
```typescript
detectMultiScale(
  image,           // Input grayscale image
  faces,           // Output vector of rectangles
  1.1,             // scaleFactor - how much image size reduced at each scale
  3,               // minNeighbors - how many neighbors required to retain
  0,               // flags
  new cv.Size(0,0),// minSize - minimum face size
  new cv.Size(0,0) // maxSize - maximum face size
);
```

### Performance

- **OpenCV.js bundle size**: ~8MB (loads asynchronously)
- **Cascade file size**: ~930KB
- **Processing time**: ~50-100ms per frame on modern browsers
- **Face detection accuracy**: ~85-95% for frontal faces

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires WebAssembly support.

## File Structure

```
frontend/
├── public/
│   ├── haarcascade_frontalface_default.xml  # Face detection model
│   └── README.md
├── src/
│   ├── lib/
│   │   └── hooks/
│   │       ├── useWebcam.ts           # Enhanced with OpenCV (basic)
│   │       └── useOpenCVWebcam.ts     # Full OpenCV implementation
│   └── pages/
│       └── MockExamPage.tsx           # Updated UI
└── package.json
```

## Troubleshooting

### OpenCV not loading
- Check console for errors
- Ensure `@techstark/opencv-js` is installed
- Try clearing browser cache

### Cascade file 404
- Ensure `haarcascade_frontalface_default.xml` is in `public/` folder
- Check Vite config for public assets serving

### Face detection not working
- Ensure proper lighting
- Face must be frontal (not profile)
- Adjust cascade parameters if needed

### Performance issues
- Reduce captureInterval (capture less frequently)
- Lower canvas resolution
- Disable face detection: `enableFaceDetection: false`

## Migration Path

To revert to native browser API:
```typescript
// Change import
import { useWebcam } from '@/lib/hooks/useWebcam';

// Old simple usage
const { videoRef } = useWebcam({
  onSnapshot: handleSnapshot,
  captureInterval: 3000,
  enabled: true
});
```

## Future Enhancements

- [ ] Face recognition (identify specific person)
- [ ] Emotion detection
- [ ] Gaze tracking (looking away detection)
- [ ] Object detection (phone, book, etc.)
- [ ] Real-time blur/background replacement
- [ ] WebGL acceleration

## References

- OpenCV.js docs: https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html
- @techstark/opencv-js: https://www.npmjs.com/package/@techstark/opencv-js
- Haar Cascades: https://github.com/opencv/opencv/tree/master/data/haarcascades
