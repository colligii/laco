import { prisma } from "@/app/lib/prisma";
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
      
          const session = await prisma.session.findFirst({
            where: {
                id: params.id,
                expires_at: { gt: new Date() }
            },
            include: {
                user: true
            }
        })
      
          if(!session)
              return NextResponse.json(
                  { message: 'Session not founded' },
                  { status: 400 }
              )
      
          return NextResponse.json(session.user);
    } catch(e) {
        return NextResponse.json({ message: 'Error' }, { status: 500 })
    }
  },
  undefined,
  idIsUUID
);