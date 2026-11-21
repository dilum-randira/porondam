import { useState } from 'react';
import { Camera } from 'lucide-react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

function ImageUpload() {
  const { user, updateUser } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setError('');
  };

  const handleSelectClick = () => {
    document.getElementById('profile-image-input')?.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!Array.isArray(response.data?.images)) {
        throw new Error('Unexpected upload response');
      }
      updateUser({ ...user, images: response.data.images });
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to upload image';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        id="profile-image-input"
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-4">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="h-20 w-20 rounded-full object-cover border-2 border-romantic-primary/60"
          />
        ) : (
          <button
            type="button"
            onClick={handleSelectClick}
            className="h-20 w-20 rounded-full bg-romantic-soft flex items-center justify-center text-romantic-primary hover:bg-romantic-soft/80 transition-colors border border-romantic-primary/40"
          >
            <Camera className="h-7 w-7" />
          </button>
        )}

        <div className="flex flex-col gap-2 flex-1">
          <Button variant="outline" type="button" onClick={handleSelectClick}>
            {file ? 'Change Photo' : 'Add Photo'}
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-romantic-muted">
        JPEG or PNG, up to 5MB. Your first photo will be used as your primary profile picture.
      </p>
    </div>
  );
}

export default ImageUpload;
