"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Camera, Upload, X, Loader2, Check } from "lucide-react";

interface GalleryUploadProps {
  weddingSlug: string;
  enabled: boolean;
}

interface FilePreview {
  file: File;
  preview: string;
}

export default function GalleryUpload({ weddingSlug, enabled }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploaderName, setUploaderName] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!enabled) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const newPreviews = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newPreviews]);
    setUploadedCount(0);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleUpload = async () => {
    if (!files.length || !uploaderName) return;
    setUploading(true);
    setUploadProgress("");

    let success = 0;
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Nalagam ${i + 1} / ${files.length}...`);
      try {
        const formData = new FormData();
        formData.append("file", files[i].file);
        formData.append("uploaderName", uploaderName);
        formData.append("caption", caption);

        const res = await fetch(`/api/weddings/${weddingSlug}/photos`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) success++;
      } catch {
        // nadaljuj z naslednjo
      }
    }

    setUploading(false);
    setUploadProgress("");
    setUploadedCount(success);
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";

    if (success < files.length) {
      alert(`Naloženih ${success} od ${files.length} fotografij.`);
    }
  };

  const reset = () => {
    setUploadedCount(0);
    setCaption("");
  };

  return (
    <section className="py-20">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-10">
          <Camera className="w-8 h-8 text-rose mx-auto mb-4" />
          <h2 className="font-serif text-4xl text-charcoal mb-3">Deli spomin</h2>
          <p className="text-warm-gray">
            Naložite eno ali več fotografij za mladoporočenca. Vidne so samo njim.
          </p>
        </div>

        {uploadedCount > 0 && files.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-sage-light/50 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-sage-dark" />
            </div>
            <h3 className="font-serif text-2xl text-charcoal mb-2">Hvala!</h3>
            <p className="text-warm-gray text-sm mb-6">
              {uploadedCount === 1
                ? "1 fotografija je bila poslana."
                : `${uploadedCount} fotografij je bilo poslanih.`}
            </p>
            <Button variant="outline" onClick={reset}>
              Naloži še
            </Button>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6">
            <div className="space-y-4">
              <Input
                label="Vaše ime"
                placeholder="Kdo je posnel fotografije?"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Izberi fotografije (več naenkrat)
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {files.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {files.map((item, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden">
                        <Image
                          src={item.preview}
                          alt={`Predogled ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-28 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 w-7 h-7 bg-charcoal/60 rounded-full flex items-center justify-center text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="h-28 border-2 border-dashed border-cream-dark rounded-xl flex flex-col items-center justify-center gap-1 text-warm-gray hover:border-sage text-xs"
                    >
                      <PlusIcon />
                      Dodaj
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-cream-dark rounded-xl flex flex-col items-center justify-center gap-2 text-warm-gray hover:border-sage hover:text-sage transition-colors"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Klikni za izbiro slik</span>
                    <span className="text-xs">Lahko izbereš več fotografij hkrati</span>
                  </button>
                )}
              </div>

              <Input
                label="Opis (neobvezno, velja za vse)"
                placeholder="Kratek opis..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />

              <Button
                onClick={handleUpload}
                disabled={!files.length || !uploaderName || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadProgress || "Nalagam..."}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Pošlji {files.length > 0 ? `(${files.length})` : ""} fotografij
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
