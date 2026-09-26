"use client";

import { useEffect, useState } from "react";
import { GoogleSignInButton } from "@/src/components/features/GoogleSignInButton";

// Phones only (hidden from md up in CSS). Shows once the hero CTA has scrolled
// away and hides again when the closing CTA is on screen, so there is always
// exactly one sign-in button in view.
export function LandingStickyCta() {
  const [isOutOfView, setIsOutOfView] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const heroCta = document.querySelector(".lp-hero__cta");
    const closing = document.getElementById("sign-in");
    if (!heroCta || !closing || !("IntersectionObserver" in window)) return;

    const inView = new Map<Element, boolean>([
      [heroCta, true],
      [closing, false],
    ]);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) inView.set(entry.target, entry.isIntersecting);
      setIsOutOfView(!inView.get(heroCta) && !inView.get(closing));
    });
    observer.observe(heroCta);
    observer.observe(closing);
    return () => observer.disconnect();
  }, []);

  // The on-screen keyboard lifts fixed bars over the field being typed in.
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent): void => {
      setIsTyping(event.target instanceof HTMLInputElement);
    };
    const handleFocusOut = (): void => setIsTyping(false);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const isVisible = isOutOfView && !isTyping;

  return (
    <div className="lp-sticky" data-visible={isVisible} inert={!isVisible}>
      <GoogleSignInButton variant="landing" label="Start free with Google" />
    </div>
  );
}
