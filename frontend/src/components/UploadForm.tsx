"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { AVAILABLE_COLORS } from "@/lib/colors";

export function UploadForm() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [color, setColor] = useState("gray");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === "file-too-large") {
        setError("File size must be less than 50MB");
      } else if (rejection.errors[0]?.code === "file-invalid-type") {
        setError("Please select an STL file (.stl)");
      } else {
        setError("Invalid file");
      }
      setFile(null);
      return;
    }

    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "model/stl": [".stl"],
      "application/sla": [".stl"],
    },
    maxSize: 50 * 1024 * 1024,
    maxFiles: 1,
    multiple: false,
    disabled: isUploading,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a name for your printable");
      return;
    }

    if (!file) {
      setError("Please select an STL file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("color", color);
      formData.append("stl", file);

      const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentage);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          router.push(`/printable/${response.id}`);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          setError(errorData.error?.message || "Upload failed");
          setIsUploading(false);
        }
      });

      xhr.addEventListener("error", () => {
        setError("Network error. Please try again.");
        setIsUploading(false);
      });

      xhr.open("POST", `${apiBase}/api/printables`);
      xhr.send(formData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-200 mb-2">
          Printable Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-900/50 border border-zinc-700/60 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
          placeholder="e.g., My Custom Part"
          maxLength={128}
          disabled={isUploading}
        />
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium text-zinc-200 mb-2">
          Color
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {AVAILABLE_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              disabled={isUploading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                color === c.value
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-zinc-700/60 hover:border-zinc-600"
              }`}
            >
              <div
                className="w-4 h-4 rounded-full border border-zinc-700/50"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-xs text-zinc-200">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-200 mb-2">
          STL File <span className="text-red-400">*</span>
        </label>
        <div
          {...getRootProps()}
          className={`px-4 py-8 bg-zinc-900/50 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
            isDragActive && !isDragReject
              ? "border-blue-500 bg-blue-500/10"
              : isDragReject
              ? "border-red-500 bg-red-500/10"
              : "border-zinc-700/60 hover:border-zinc-600 hover:bg-zinc-900/70"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            {file ? (
              <>
                <div className="text-green-400 text-3xl mb-2">✓</div>
                <p className="text-sm text-zinc-200 font-medium">{file.name}</p>
                <p className="text-xs text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-xs text-zinc-400 mt-2">
                  Click or drag to replace
                </p>
              </>
            ) : (
              <>
                <div className="text-zinc-500 text-4xl mb-2">📁</div>
                {isDragActive ? (
                  <p className="text-sm text-blue-400 font-medium">
                    Drop your STL file here
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-zinc-300 font-medium">
                      Drag & drop your STL file here
                    </p>
                    <p className="text-xs text-zinc-500">
                      or click to browse
                    </p>
                  </>
                )}
                <p className="text-xs text-zinc-600 mt-2">
                  Max file size: 50MB
                </p>
              </>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Accepted format: .stl (Binary or ASCII)
        </p>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/")}
          disabled={isUploading}
          className="px-6 py-2 border border-zinc-700/60 rounded-lg text-zinc-300 hover:bg-zinc-800/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isUploading || !name.trim() || !file}
          className="flex-1 btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Create Printable"}
        </button>
      </div>
    </form>
  );
}
