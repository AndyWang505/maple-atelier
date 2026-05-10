"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealOnScrollProps {
  children: ReactNode;
  /** 進場延遲(ms)— 多個元素串連可做 stagger */
  delay?: number;
  /** 觸發距離 — 元素進入視窗 N% 時觸發,預設 10% */
  threshold?: number;
  className?: string;
}

/**
 * 使用 IntersectionObserver 偵測元素進入視窗,觸發一次性 fade-up 動畫。
 * 用於首頁各 section 的 scroll-triggered reveal。一次觸發後就 disconnect,不會重複播放。
 */
export default function RevealOnScroll({
  children,
  delay = 0,
  threshold = 0.1,
  className = "",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  // prefers-reduced-motion 時跳過進場動畫直接顯示
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    );
  });

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 700ms ease-out, transform 700ms ease-out",
        transitionDelay: visible ? `${delay}ms` : "0ms",
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
