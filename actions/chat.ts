"use server";

import { auth } from "@clerk/nextjs/server";
import { deleteAllChatsByUserId } from "@/lib/db/queries";
import {
  verifyRecaptchaToken,
  validateRecaptchaResponse,
} from "@/lib/recaptcha";

export async function deleteAllChats(recaptchaToken?: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    // Verify reCAPTCHA token if provided
    if (recaptchaToken) {
      try {
        const recaptchaResponse = await verifyRecaptchaToken(recaptchaToken);
        if (!validateRecaptchaResponse(recaptchaResponse, 0.5)) {
          return {
            success: false,
            message: "reCAPTCHA verification failed",
          };
        }
      } catch (error) {
        console.error("reCAPTCHA verification error:", error);
        return {
          success: false,
          message: "reCAPTCHA verification failed",
        };
      }
    }

    const result = await deleteAllChatsByUserId(userId);

    return {
      success: true,
      message: "All chat records deleted successfully",
      deletedChats: result.deletedChats,
      deletedMessages: result.deletedMessages,
    };
  } catch (error) {
    console.error("Error deleting all chats:", error);
    return {
      success: false,
      message: "Failed to delete chat records",
    };
  }
}
