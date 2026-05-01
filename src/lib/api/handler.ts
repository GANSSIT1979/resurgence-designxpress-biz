import { NextRequest, NextResponse } from 'next/server';
import { Role, requireRole } from './guard';
import { apiSuccess, internalError, validationError } from './response';
import { getRequestId, logApiEvent } from './logger';

type SchemaLike<T> = {
  safeParse: (input: unknown) =>
    | { success: true; data: T }
    | { success: false; error: unknown };
};

type ApiHandlerContext<TInput> = {
  req: NextRequest;
  input: TInput;
  requestId: string;
};

type ApiHandlerOptions<TInput, TOutput> = {
  roles?: Role[];
  schema?: SchemaLike<TInput>;
  parseJson?: boolean;
  routeName?: string;
  log?: boolean;
  handler: (ctx: ApiHandlerContext<TInput>) => Promise<TOutput> | TOutput;
};

export function withApiHandler<TInput = unknown, TOutput = unknown>(options: ApiHandlerOptions<TInput, TOutput>) {
  return async function routeHandler(req: NextRequest): Promise<NextResponse> {
    const startedAt = Date.now();
    const requestId = getRequestId(req);
    const route = options.routeName || req.nextUrl.pathname;
    const method = req.method;
    const shouldLog = options.log !== false;

    if (shouldLog) {
      logApiEvent({ event: 'api.request.start', requestId, route, method });
    }

    const finish = (response: NextResponse, event = 'api.request.finish') => {
      response.headers.set('x-request-id', requestId);
      if (shouldLog) {
        logApiEvent({ event, requestId, route, method, status: response.status, durationMs: Date.now() - startedAt });
      }
      return response;
    };

    const guard = options.roles?.length ? requireRole(req, options.roles) : null;
    if (guard) return finish(guard, 'api.request.forbidden');

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
          return finish(validationError('Invalid request payload', parsed.error), 'api.request.validation_failed');
        }
        input = parsed.data;
      }

      const output = await options.handler({ req, input: input as TInput, requestId });
      return finish(apiSuccess(output));
    } catch (error) {
      logApiEvent({ event: 'api.request.error', level: 'error', requestId, route, method, durationMs: Date.now() - startedAt, metadata: { error } });
      return finish(internalError('Request failed'), 'api.request.error_response');
    }
  };
}
