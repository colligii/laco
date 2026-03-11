import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as jose from 'jose';
import { prisma } from "./prisma";
import { Session, User } from "@/prisma/app/generated/prisma/client";
import { getSession } from "./redis";

function getZodErrors(error: z.ZodError): string[] {
    return error.issues.map((issue) => issue.message);
}

export function validateRequest<
    TBody extends z.ZodTypeAny = z.ZodNever,
    TParams extends z.ZodTypeAny = z.ZodNever
>(
    requestFn: RequestFn<TBody, TParams>,
    bodySchema?: TBody,
    paramsSchema?: TParams,
    checkAuth?: CheckAuthParams
) {
    return async (
        request: NextRequest,
        { params: paramsPromise }: { params?: Promise<Record<string, string>> } = {}
    ) => {
        try {
            let body: unknown = undefined;
            if (bodySchema) {
                try {
                    body = await request.json();
                } catch (e) {
                    return NextResponse.json(
                        { errors: ["JSON inválido no corpo da requisição"] },
                        { status: 400 }
                    );
                }

                const parsedBody = bodySchema.safeParse(body);
                if (!parsedBody.success) {
                    const errors = getZodErrors(parsedBody.error);
                    return NextResponse.json({ errors }, { status: 400 });
                }
                body = parsedBody.data;
            }

            let params: unknown = {};
            if (paramsPromise) {
                params = await paramsPromise;
            }

            let parsedParams: unknown = params;
            if (paramsSchema) {
                const result = paramsSchema.safeParse(params);
                if (!result.success) {
                    const errors = getZodErrors(result.error);
                    return NextResponse.json({ errors }, { status: 400 });
                }
                parsedParams = result.data;
            }

            let authPayloadUser;
            let authPayloadSession;

            if (checkAuth) {
                const authToken = request.cookies.get(checkAuth.completeTokenVar);

                if (!authToken || !authToken.value)
                    return NextResponse.json({ message: 'O token para essa rota não foi definido' }, { status: 400 });

                const secret = new TextEncoder().encode(checkAuth.secret);

                const { payload } = await jose.jwtVerify(authToken.value, secret);

                if (!payload || typeof payload === 'string' || !payload.id)
                    return NextResponse.json({ message: 'O payload não é valido' }, { status: 400 });


                if (checkAuth.type === 'user') {
                    const user = await prisma.user.findFirst({
                        where: {
                            id: payload.id
                        }
                    })

                    if (!user)
                        return NextResponse.json({ message: 'Erro no request do usuário' }, { status: 400 });

                    authPayloadUser = user;
                } else {
                    if(typeof payload.id != 'string')
                            return NextResponse.json(
                                { message: 'Sessão não encontrada' },
                                { status: 400 }
                            )
    
                        
                    const user = await getSession(payload.id);

                    if (!user)
                        return NextResponse.json(
                            { message: 'Sessão não encontrada' },
                            { status: 400 }
                        )

                    authPayloadSession = {
                        id: payload.id
                    };
                }
            }

            return await requestFn({
                body: body as TBody extends z.ZodNever ? undefined : z.infer<TBody>,
                request,
                params: parsedParams as TParams extends z.ZodNever ? undefined : z.infer<TParams>,
                payloadSession: authPayloadSession,
                payloadUser: authPayloadUser
            });
        } catch (error) {
            return NextResponse.json(
                { message: "Algum erro aconteceu na camada de validação" },
                { status: 500 }
            );
        }
    };
}

type CheckAuthParams = {
    type: 'user' | 'session',
    secret: string,
    completeTokenVar: string
}

type RequestFn<TBody, TParams> = (props: {
    body: TBody extends z.ZodNever ? undefined : z.infer<TBody>;
    request: NextRequest;
    params: TParams extends z.ZodNever ? undefined : z.infer<TParams>;
    payloadSession?: { id: string },
    payloadUser?: User
}) => NextResponse | Promise<NextResponse>