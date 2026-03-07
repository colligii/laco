import { validateRequest } from "@/app/lib/validateRequest";
import { idIsUUID } from "@/app/schemas/idIsUUID";
import { patchUser } from "@/app/schemas/patch-user";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = validateRequest(({}) => {
    return NextResponse.json({})
}, patchUser, idIsUUID)