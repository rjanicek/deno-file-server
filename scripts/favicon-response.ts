import denoConfig from '../deno.json' with { type: 'json' };
import { decodeBase64 } from '@std/encoding/base64';
import {
    STATUS_CODE,
    STATUS_TEXT
} from '@std/http/status';

export function handleFaviconResponse(request: Request) {
    const url = new URL(request.url);
    if (url.pathname !== '/favicon.ico') return;

    const headers = new Headers();
    headers.set('content-type', 'image/x-icon');

    return new Response(decodeBase64(denoConfig["default-favicon-base64"]), {
        status: STATUS_CODE.OK,
        statusText: STATUS_TEXT[STATUS_CODE.OK],
        headers,
    });
}