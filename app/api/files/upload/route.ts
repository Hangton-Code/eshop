import { generateUUID } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  verifyRecaptchaToken,
  validateRecaptchaResponse,
} from "@/lib/recaptcha";

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size should be less than 10MB",
    })
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
      message: "File type should be JPEG or PNG",
    }),
});

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    const recaptchaToken = formData.get("recaptchaToken") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (recaptchaToken) {
      try {
        const recaptchaResponse = await verifyRecaptchaToken(recaptchaToken);
        if (!validateRecaptchaResponse(recaptchaResponse, 0.5)) {
          return NextResponse.json(
            { error: "reCAPTCHA verification failed" },
            { status: 403 }
          );
        }
      } catch (error) {
        console.error("reCAPTCHA verification error:", error);
        return NextResponse.json(
          { error: "reCAPTCHA verification failed" },
          { status: 403 }
        );
      }
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const filename = generateUUID() + (formData.get("file") as File).name;
    const fileBuffer = await file.arrayBuffer();

    try {
      const data = await put(`${filename}`, fileBuffer, {
        access: "public",
      });

      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
