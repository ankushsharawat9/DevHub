import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './utils/cropImageUtils';

const ImageCropper = ({ image, onCropDone, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleDone = async () => {
    const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
    const file = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' });
    onCropDone(file);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '400px',
        background: '#333',
      }}
    >
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={1}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: '10px',
        }}
      >
        <button onClick={handleDone}>✅ Done</button>
        <button onClick={onCancel}>❌ Cancel</button>
      </div>
    </div>
  );
};

export default ImageCropper;
