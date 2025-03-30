'use client';

import { useState, useCallback } from 'react';
import {
  ArrowDownCircle,
  ImageIcon,
  Loader2,
  UploadCloud,
} from 'lucide-react';

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
    setResponseImage('');

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

    try {
      const res = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Image processing failed');

      const blob = await res.blob();
      setResponseImage(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert('Error processing the image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f2f7ff] to-[#ffffff] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl p-10 space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-800">🌿 Plant Disease Classifier</h1>
          <p className="text-gray-600 text-sm">Upload or link a plant image and get an enhanced result.</p>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          {/* Upload Box */}
          <div
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition ${
              dragOver
                ? 'border-blue-500 bg-blue-100/30'
                : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/30'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <UploadCloud className="h-10 w-10 text-indigo-500 mb-4" />
            <p className="font-medium text-gray-700">Drag & drop an image here</p>
            <p className="text-sm text-gray-500 mb-4">or choose a file</p>
            <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition">
              Select Image
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* URL input */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium">Paste Image URL</label>
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
        </section>

        {/* Preview */}
        {previewImage && (
          <div className="text-center">
            <h2 className="text-md font-semibold text-gray-700 mb-2">🔍 Preview</h2>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-64 mx-auto rounded-xl shadow-lg border"
            />
          </div>
        )}

        {/* Submit Button */}
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

        {/* Response */}
        {responseImage && (
          <div className="text-center mt-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-700">✅ Processed Image</h2>
            <img
              src={responseImage}
              alt="Processed"
              className="max-h-96 mx-auto rounded-xl border shadow-md"
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
    </main>
  );
}
