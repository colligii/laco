import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

function getZodErrors(error: z.ZodError): string[] {
    return error.issues.map((issue) => issue.message);
}

export function validateBody<TBody extends z.ZodTypeAny>(
    bodySchema: TBody,
    requestFn: (body: z.infer<TBody>, request: NextRequest, params: unknown) => NextResponse | Promise<NextResponse>,
    paramsSchema?: z.ZodTypeAny
) {
    return async (request: NextRequest, { params: paramsPromise }: { params?: Promise<Record<string, string>> }) => {
        try {
            let body: unknown;
            try {
                body = await request.json();
            } catch {
                return NextResponse.json({ errors: ['JSON inválido no corpo da requisição'] }, { status: 400 });
            }

            const bodyResult = bodySchema.safeParse(body);
            if (!bodyResult.success) {
                const errors = getZodErrors(bodyResult.error);
                return NextResponse.json({ errors }, { status: 400 });
            }

            const params = paramsPromise ? await paramsPromise : {};

            if (paramsSchema) {
                const paramsResult = paramsSchema.safeParse(params);
                if (!paramsResult.success) {
                    const errors = getZodErrors(paramsResult.error);
                    return NextResponse.json({ errors }, { status: 400 });
                }
                return await requestFn(bodyResult.data, request, paramsResult.data);
            }

            return await requestFn(bodyResult.data, request, params);
        } catch (e) {
            return NextResponse.json({ message: 'Algum erro aconteceu na camada de validação' }, { status: 500 });
        }
    };
}