"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiX } from "react-icons/fi";

export default function CloudinaryUploader({
  imageUrl,
  setImageUrl,
  multiple = false,
  maxFiles = 1,
}) {
  const [uploading, setUploading] = useState(false);
  const uploadUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!uploadUrl || !uploadPreset) {
        alert("Cloudinary configuration missing. Please check environment variables.");
        return;
      }

      setUploading(true);

      try {
        const uploadPromises = acceptedFiles.map((file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", uploadPreset);

          return fetch(uploadUrl, {
            method: "POST",
            body: formData,
          })
            .then((res) => res.json())
            .then((data) => data.secure_url);
        });

        const urls = await Promise.all(uploadPromises);

        if (multiple) {
          setImageUrl((prev) => [...(prev || []), ...urls]);
        } else {
          setImageUrl(urls[0]);
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [uploadUrl, uploadPreset, multiple, setImageUrl]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    multiple: multiple && maxFiles > 1,
    maxFiles: multiple ? maxFiles : 1,
    maxSize: 5000000, // 5MB
  });

  const removeImage = (index) => {
    if (multiple) {
      setImageUrl((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImageUrl("");
    }
  };

  const hasImage = multiple ? imageUrl?.length > 0 : imageUrl;

  return (
    <div className="w-full">
      {hasImage ? (
        <div className="space-y-4">
          {/* Show uploaded image preview */}
          <div className="relative group">
            <img
              src={multiple ? imageUrl[0] : imageUrl}
              alt="Category"
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => removeImage(0)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              type="button"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          {/* Option to change image */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} disabled={uploading} />
            <FiUploadCloud className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            {uploading ? (
              <p className="text-sm text-gray-600">Uploading...</p>
            ) : (
              <p className="text-sm text-gray-600">
                Click to change image or drag & drop
              </p>
            )}
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} disabled={uploading} />
          <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {uploading ? (
            <p className="text-sm text-gray-600">Uploading...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-1">
                {isDragActive
                  ? "Drop the images here"
                  : "Drag & drop images here, or click to select"}
              </p>
              <p className="text-xs text-gray-500">
                (Only *.jpeg, *.webp and *.png images will be accepted)
              </p>
            </>
          )}
        </div>
      )}

      {/* Preview multiple images if needed */}
      {multiple && imageUrl?.length > 1 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {imageUrl.slice(1).map((url, index) => (
            <div key={index + 1} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 2}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removeImage(index + 1)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


