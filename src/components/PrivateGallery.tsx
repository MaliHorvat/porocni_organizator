"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, X, Lock } from "lucide-react";
import type { Photo } from "@/types";

interface PrivateGalleryProps {
  weddingSlug: string;
  photos: Photo[];
}

export default function PrivateGallery({ weddingSlug, photos }: PrivateGalleryProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="glass-card rounded-2xl p-8 mt-8">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="w-5 h-5 text-sage" />
        <h2 className="font-serif text-2xl text-charcoal">Galerija fotografij</h2>
        <span className="inline-flex items-center gap-1 text-xs bg-sage-light/40 text-sage-dark px-2 py-1 rounded-full ml-auto">
          <Lock className="w-3 h-3" />
          Zasebno
        </span>
      </div>
      <p className="text-sm text-warm-gray mb-6">
        Fotografije, ki so jih naložili gostje. Vidne so samo vam — niso javno dostopne.
      </p>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => {
            const src = `/api/weddings/${weddingSlug}/photos/${photo.id}`;
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightbox(src)}
                className="relative aspect-square rounded-xl overflow-hidden group"
              >
                <Image
                  src={src}
                  alt={photo.caption || "Fotografija poroke"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <div className="text-white text-xs text-left">
                    <p className="font-medium">{photo.uploaderName}</p>
                    {photo.caption && <p className="opacity-80 truncate">{photo.caption}</p>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-warm-gray text-center py-8 text-sm">
          Še ni fotografij. Gostje jih lahko naložijo na vaši poročni strani.
        </p>
      )}

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
            unoptimized
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
