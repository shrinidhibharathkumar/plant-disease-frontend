// File: app/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { ArrowDownCircle, ImageIcon, Loader2, UploadCloud } from 'lucide-react';

export default function UploadDashboard() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [responseImage, setResponseImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (imageUrl) {
      formData.append('imageUrl', imageUrl);
    } else {
      alert('Please provide an image');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/process-image', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      alert('Error processing image');
      setLoading(false);
      return;
    }

    const blob = await res.blob();
    const imgURL = URL.createObjectURL(blob);
    setResponseImage(imgURL);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ece9e6] to-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 space-y-8 border border-gray-200">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 tracking-tight">
          Plant Disease Classifier
        </h1>
        <p className="text-center text-gray-600 text-sm mb-4">
          Upload an image or paste a URL. We'll process it with AI and return an enhanced version.
        </p>

        {/* Drag and drop zone */}
        <div
          className={`border-2 border-dashed p-8 rounded-2xl text-center transition duration-300 cursor-pointer ${
            dragOver ? 'border-blue-500 bg-blue-100/30' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/30'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <UploadCloud className="mx-auto h-10 w-10 text-indigo-500 mb-2" />
          <p className="text-gray-700 font-medium">Drag & drop an image here</p>
          <p className="text-sm text-gray-500 mb-4">or choose a file below</p>

          <label className="inline-block mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg cursor-pointer hover:bg-indigo-600 transition">
            Select Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center justify-center">
          <span className="text-sm text-gray-500">— or —</span>
        </div>

        {/* Image URL input */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Paste Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImageFile(null);
              setPreviewImage(e.target.value);
            }}
            placeholder="https://example.com/image.jpg"
            className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </div>

        {/* Image Preview */}
        {previewImage && (
          <div className="text-center">
            <h2 className="text-md font-semibold mb-2 text-gray-700">🔍 Preview</h2>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-lg border"
            />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition text-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Processing...
            </>
          ) : (
            <>
              <ImageIcon className="h-5 w-5" />
              Submit to Server
            </>
          )}
        </button>

        {/* Response Image */}
        {responseImage && (
          <div className="text-center space-y-4 mt-8">
            <h2 className="text-xl font-bold text-gray-700">✅ Enhanced Image</h2>
            <img
              src={responseImage}
              alt="Processed"
              className="max-h-96 mx-auto rounded-xl shadow-md border"
            />
            <a
              href={responseImage}
              download="enhanced-image.jpg"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full hover:bg-green-700 transition text-sm font-medium"
            >
              <ArrowDownCircle className="h-5 w-5" />
              Download Enhanced Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
