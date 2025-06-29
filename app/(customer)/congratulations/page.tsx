"use client";

import confetti from "canvas-confetti";
import Link from "next/link";
import { useEffect } from "react";

export default function CongratulationsPage() {
  useEffect(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-20">
      <div className="space-y-3">
        <div className="text-4xl font-extrabold text-center">
          Congratulations!
        </div>
        <div className="text-xl text-muted-foreground text-center">
          Your order has been successfully placed.
        </div>
      </div>
      <div>
        <Link href="/orders" className="underline">
          Click here
        </Link>{" "}
        to view your order.
      </div>
    </div>
  );
}
