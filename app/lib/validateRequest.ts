import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

function getZodErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.message);
}

export function validateRequest<
  TBody extends z.ZodTypeAny = z.ZodNever,
  TParams extends z.ZodTypeAny = z.ZodNever
>(
  requestFn: RequestFn<TBody, TParams>,
  bodySchema?: TBody,
  paramsSchema?: TParams
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
        } catch {
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

      return await requestFn({
        body: body as TBody extends z.ZodNever ? undefined : z.infer<TBody>,
        request,
        params: parsedParams as TParams extends z.ZodNever ? undefined : z.infer<TParams>,
      });
    } catch (error) {
      return NextResponse.json(
        { message: "Algum erro aconteceu na camada de validação" },
        { status: 500 }
      );
    }
  };
}

type RequestFn<TBody, TParams> = (props: {
    body: TBody extends z.ZodNever ? undefined : z.infer<TBody>;
    request: NextRequest;
    params: TParams extends z.ZodNever ? undefined : z.infer<TParams>;
  }) => NextResponse | Promise<NextResponse>