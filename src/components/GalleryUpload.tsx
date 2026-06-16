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

export default function GalleryUpload({ weddingSlug, enabled }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!enabled) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setUploaded(false);
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploaderName) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("uploaderName", uploaderName);
      formData.append("caption", caption);

      const res = await fetch(`/api/weddings/${weddingSlug}/photos`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setUploaded(true);
        setSelectedFile(null);
        setPreview(null);
        setCaption("");
        if (fileRef.current) fileRef.current.value = "";
      } else {
        alert("Napaka pri nalaganju. Poskusite znova.");
      }
    } catch {
      alert("Napaka pri nalaganju. Poskusite znova.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="py-20">
      <div className="max-w-lg mx-auto px-6">
        <div className="text-center mb-10">
          <Camera className="w-8 h-8 text-rose mx-auto mb-4" />
          <h2 className="font-serif text-4xl text-charcoal mb-3">Deli spomin</h2>
          <p className="text-warm-gray">
            Naložite fotografijo za mladoporočenca. Fotografije so vidne samo njima —
            niso javno objavljene.
          </p>
        </div>

        {uploaded ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-sage-light/50 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-sage-dark" />
            </div>
            <h3 className="font-serif text-2xl text-charcoal mb-2">Hvala!</h3>
            <p className="text-warm-gray text-sm mb-6">
              Vaša fotografija je bila poslana mladoporočencema.
            </p>
            <Button variant="outline" onClick={() => setUploaded(false)}>
              Naloži še eno
            </Button>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6">
            <div className="space-y-4">
              <Input
                label="Vaše ime"
                placeholder="Kdo je posnel fotografijo?"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Izberi fotografijo
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <Image
                      src={preview}
                      alt="Predogled"
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-charcoal/60 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-cream-dark rounded-xl flex flex-col items-center justify-center gap-2 text-warm-gray hover:border-sage hover:text-sage transition-colors"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Klikni za izbiro slike</span>
                  </button>
                )}
              </div>

              <Input
                label="Opis (neobvezno)"
                placeholder="Kratek opis fotografije..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !uploaderName || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Nalagam...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Pošlji fotografijo
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
