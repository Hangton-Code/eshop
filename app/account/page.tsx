"use client";

import { Button } from "@/components/ui/button";
import { UserProfile } from "@clerk/nextjs";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export default function AccountProfilePage() {
  const router = useRouter();

  return (
    <div className="h-screen flex justify-center items-center relative">
      <Button
        onClick={() => {
          router.back();
        }}
        variant={"ghost"}
        className="absolute top-5 left-5"
      >
        <ChevronLeft /> Back
      </Button>

      <motion.div
        initial={{
          y: 5,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
      >
        <UserProfile />
      </motion.div>
    </div>
  );
}
