import { validateBody } from "@/app/lib/validateBody";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { patchUser } from "@/app/schemas/patch-user";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = validateBody(patchUser, (body: any) => {
    return NextResponse.json({})
}, idIsUUID)
