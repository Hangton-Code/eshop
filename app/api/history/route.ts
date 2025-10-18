import type { NextRequest } from "next/server";
import { getChatsByUserId } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = Number.parseInt(searchParams.get("limit") || "10");
  const startingAfter = searchParams.get("starting_after");
  const endingBefore = searchParams.get("ending_before");

  if (startingAfter && endingBefore) {
    return Response.json(
      `bad_request:api
      Only one of starting_after or ending_before can be provided.`,
      {
        status: 400,
      }
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      {},
      {
        status: 401,
      }
    );
  }

  const chats = await getChatsByUserId({
    id: userId,
    limit,
    startingAfter,
    endingBefore,
  });

  return Response.json(chats);
}
