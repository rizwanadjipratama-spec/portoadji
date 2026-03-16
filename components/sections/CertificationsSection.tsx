"use client"

import Image from "next/image"
import SectionHeading from "@/components/layout/SectionHeading"
import { CERTIFICATIONS } from "./certificationsData"

export default function CertificationsSection() {
  return (
    <section className="section-shell relative z-10 w-full">
      <div className="section-stack mx-auto max-w-[1100px] px-6 py-32">
        <SectionHeading
          title="Certifications"
          className="text-3xl md:text-4xl font-semibold tracking-wide text-white/90 text-center mb-16"
        />
        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-[900px] overflow-hidden rounded-xl shadow-xl border border-white/10 bg-white/[0.02]">
            <Image
              src={CERTIFICATIONS[0].src}
              alt={CERTIFICATIONS[0].alt}
              width={1600}
              height={1100}
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

