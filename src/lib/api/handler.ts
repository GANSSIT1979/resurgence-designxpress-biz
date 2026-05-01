import { NextRequest, NextResponse } from 'next/server';
import { Role, requireRole } from './guard';
import { apiSuccess, internalError, validationError } from './response';

type SchemaLike<T> = {
  safeParse: (input: unknown) =>
    | { success: true; data: T }
    | { success: false; error: unknown };
};

type ApiHandlerContext<TInput> = {
  req: NextRequest;
  input: TInput;
};

type ApiHandlerOptions<TInput, TOutput> = {
  roles?: Role[];
  schema?: SchemaLike<TInput>;
  parseJson?: boolean;
  handler: (ctx: ApiHandlerContext<TInput>) => Promise<TOutput> | TOutput;
};

export function withApiHandler<TInput = unknown, TOutput = unknown>(options: ApiHandlerOptions<TInput, TOutput>) {
  return async function routeHandler(req: NextRequest): Promise<NextResponse> {
    const guard = options.roles?.length ? requireRole(req, options.roles) : null;
    if (guard) return guard;

    try {
      let input: unknown = undefined;

      if (options.parseJson !== false) {
        try {
          input = await req.json();
        } catch {
          input = {};
        }
      }

      if (options.schema) {
        const parsed = options.schema.safeParse(input);
        if (!parsed.success) {
          return validationError('Invalid request payload', parsed.error);
        }
        input = parsed.data;
      }

      const output = await options.handler({ req, input: input as TInput });
      return apiSuccess(output);
    } catch (error) {
      console.error('[api-handler]', error);
      return internalError('Request failed');
    }
  };
}
