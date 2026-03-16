"use client";

import Image from "next/image";
import SectionHeading from "@/components/layout/SectionHeading";

export default function CVSection() {
  return (
    <section id="CV" className="max-w-[1100px] mx-auto px-6 py-32">
      <SectionHeading
        title="Curriculum Vitae"
        className="text-3xl md:text-4xl font-semibold tracking-wide text-white/90 text-center mb-16"
      />
      <div className="max-w-[720px] mx-auto">
        <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-[1.015]">
          <Image
src="/CV/rizwan-adji-pratama-putra-cv.jpeg"
            alt="Rizwan Adji Pratama Putra CV"
            width={1200}
            height={1700}
            className="mx-auto w-full max-w-[720px] rounded-xl object-contain"
          />
        </div>
        <div className="flex justify-center mt-12">
          <a
            href="/CV/rizwan-adji-pratama-putra-cv.pdf"
            download
            className="group relative inline-flex items-center justify-center gap-3 rounded-full border-2 border-white/20 bg-white/[0.05] px-8 py-5 text-lg font-semibold text-white/90 shadow-xl backdrop-blur transition-all duration-300 hover:border-white/40 hover:bg-white/[0.15] hover:shadow-[0_20px_50px_rgba(255,255,255,0.15)] hover:shadow-glow-xl active:scale-[0.98]"
          >
            <svg className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10l-5.5 5.5m0 0L12 21l5.5-5.5m-5.5 5.5V7" />
            </svg>
            Download CV
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
