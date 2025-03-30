'use client';

import { useState, useCallback } from 'react';
import {
  Loader2,
  UploadCloud,
  ImageIcon,
  ArrowDownCircle,
} from 'lucide-react';

export default function UploadDashboard() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [responseImage, setResponseImage] = useState('');
  const [label, setLabel] = useState('');
  const [confidence, setConfidence] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setImageUrl('');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setImageUrl('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResponseImage('');
    setLabel('');
    setConfidence('');

    const formData = new FormData();
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (imageUrl) {
      formData.append('imageUrl', imageUrl);
    } else {
      alert('Please upload a file or enter a URL');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to process image');

      const data = await res.json();
      setResponseImage(`data:image/jpeg;base64,${data.image}`);
      setLabel(data.label);
      setConfidence(parseFloat(data.confidence).toFixed(2));
    } catch (err) {
      alert('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-3xl p-10 border border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-green-700 mb-10">
          🌿 Plant Disease Detection
        </h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Input Section */}
          <div className="space-y-6">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-green-500 hover:bg-green-50 transition"
            >
              <UploadCloud className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-gray-700 font-medium">Drag & drop an image</p>
              <p className="text-sm text-gray-500">or select a file</p>
              <label className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition">
                Select Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Or paste an image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageFile(null);
                  setPreviewImage(e.target.value);
                }}
                placeholder="https://example.com/plant.jpg"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Detect Disease
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
          <div className="space-y-6 text-center">
            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">📷 Preview</h2>
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="mx-auto max-h-60 rounded-xl border shadow-md"
                />
              ) : (
                <p className="text-gray-400 italic">No image selected</p>
              )}
            </div>

            {/* AI Result */}
            {label && confidence && (
              <div className="mt-4 bg-green-50 p-4 rounded-xl border text-left shadow-sm">
                <h2 className="text-lg font-semibold text-green-700 mb-2">🧠 Prediction Result</h2>
                <p className="text-gray-800"><span className="font-semibold">Label:</span> {label}</p>
                <p className="text-gray-800"><span className="font-semibold">Confidence:</span> {confidence}%</p>

                {responseImage && (
                  <a
                    href={responseImage}
                    download="detected-image.jpg"
                    className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full hover:bg-green-700 transition text-sm font-medium"
                  >
                    <ArrowDownCircle className="w-5 h-5" />
                    Download Annotated Image
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
