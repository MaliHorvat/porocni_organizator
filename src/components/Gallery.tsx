"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import type { Photo } from "@/types";

interface GalleryProps {
  weddingSlug: string;
  weddingId: string;
  initialPhotos: Photo[];
  enabled: boolean;
}

export default function Gallery({ weddingSlug, weddingId, initialPhotos, enabled }: GalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!enabled) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
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
      const data = await res.json();
      if (data.photo) {
        setPhotos((prev) => [data.photo, ...prev]);
        setSelectedFile(null);
        setPreview(null);
        setCaption("");
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch {
      alert("Napaka pri nalaganju. Poskusite znova.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <Camera className="w-8 h-8 text-rose mx-auto mb-4" />
          <h2 className="font-serif text-4xl text-charcoal mb-3">Galerija spominov</h2>
          <p className="text-warm-gray">
            Delite svoje fotografije z mladoporočencema — naložite jih neposredno s telefona.
          </p>
        </div>

        {/* Upload form */}
        <div className="glass-card rounded-2xl p-6 mb-10">
          <h3 className="font-serif text-xl text-charcoal mb-4">Naloži fotografijo</h3>

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
                  <span className="text-sm">Klikni za izbiro ali povleci sliko</span>
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
                  Naloži fotografijo
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Photo grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightbox(`/uploads/${weddingId}/${photo.filename}`)}
                className="relative aspect-square rounded-xl overflow-hidden group"
              >
                <Image
                  src={`/uploads/${weddingId}/${photo.filename}`}
                  alt={photo.caption || "Fotografija poroke"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="text-white text-xs text-left">
                    <p className="font-medium">{photo.uploaderName}</p>
                    {photo.caption && <p className="opacity-80">{photo.caption}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-warm-gray py-8">
            Še ni fotografij. Bodite prvi, ki deli spomin!
          </p>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 z-50 bg-charcoal/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 text-white"
              onClick={() => setLightbox(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <Image
              src={lightbox}
              alt="Fotografija"
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </section>
  );
}
