import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  statusCode: number;
  status: number;
  success: boolean;
  message: string;
  data: T;
  meta: Record<string, unknown> | null;
  timestamp: string;
}

function serializeResponse(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(serializeResponse);
  if (value instanceof Date) return value.toISOString();
  if (
    value &&
    typeof value === 'object' &&
    (typeof (value as any).toHexString === 'function' ||
      (value as any)._bsontype === 'ObjectID' ||
      (value as any).constructor?.name === 'ObjectId')
  ) {
    return String(value);
  }
  if (!value || typeof value !== 'object') return value;

  const document = value as {
    toObject?: () => Record<string, unknown>;
  };
  const result = document.toObject
    ? document.toObject()
    : { ...(value as Record<string, unknown>) };

  if (result._id) {
    result._id = String(result._id);
  }
  if (!result.id) {
    if (result._id) {
      result.id = String(result._id);
    } else if (result.menuId) {
      result.id = String(result.menuId);
    }
  }
  if (result.publicId) {
    result.id = result.publicId;
    delete result.publicId;
  }
  delete result.__v;

  for (const [key, child] of Object.entries(result)) {
    result[key] = serializeResponse(child);
  }
  return result;
}

function getResponseData(value: Record<string, unknown>) {
  if (!Array.isArray(value.items)) {
    return { data: value, meta: null };
  }

  const { items, ...meta } = value;
  return { data: items, meta };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseFormat<T>> {
    const response = context
      .switchToHttp()
      .getResponse<{ statusCode?: number }>();
    const request = context.switchToHttp().getRequest<{ method: string }>();
    const statusCode = response.statusCode ?? HttpStatus.OK;
    const method = request.method;
    const messageByMethod: Record<string, string> = {
      GET: 'Record fetched successfully',
      POST: 'Record created successfully',
      PUT: 'Record updated successfully',
      PATCH: 'Record updated successfully',
      DELETE: 'Record deleted successfully',
    };

    return next.handle().pipe(
      map((data) => {
        const serializedData = serializeResponse(data);
        const responseData =
          serializedData && typeof serializedData === 'object'
            ? getResponseData(serializedData as Record<string, unknown>)
            : { data: serializedData, meta: null };

        return {
          statusCode,
          status: statusCode,
          success: true,
          message:
            messageByMethod[method] ?? 'Operation completed successfully',
          data: responseData.data as T,
          meta: responseData.meta,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
