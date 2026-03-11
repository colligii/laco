import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/redis";
import { validateRequest } from "@/app/lib/validateRequest";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = validateRequest(
  async ({ request, params }) => {
    try {
        if (request.headers.get("accessToken") !== process.env.ACCESS_TOKEN) {
            return NextResponse.json(
              { message: "Access Token is not defined or invalid" },
              { status: 401 }
            );
          }
      
          const user = await getSession(params.id);

          if(!user)
              return NextResponse.json(
                  { message: 'Session not founded' },
                  { status: 400 }
              )
      
          return NextResponse.json(user);
    } catch(e) {
        return NextResponse.json({ message: 'Error' }, { status: 500 })
    }
  },
  undefined,
  idIsUUID
);