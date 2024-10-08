import denoConfig from '../deno.json' with { type: 'json' };
import { basename } from '@std/path/basename';
import { state, calculateState, total } from './progress-stream.ts';
import { STATUS_CODE } from '@std/http/status';
import { STATUS_TEXT } from '@std/http/status';
import { format as formatBytes } from '@std/fmt/bytes';

export function handleStatusResponse(request: Request) {
    const url = new URL(request.url);

    if (url.pathname !== denoConfig['status-page-url']) return;

    calculateState();

    const stateInfo = state.map((x: any) => {
        if ('created' in x) x.status = 'streaming';
        if ('flushed' in x) x.status = 'completed';
        if ('canceled' in x) x.status = `canceled - ${x.canceledReason}`;
        return x;
    }).reverse();

    const totalPercentText = (()=>{
        if (total.activeBytesStreamedPercent !== 0) return `${total.activeBytesStreamedPercent.toFixed(1)}% `;
        if (total.bytesStreamedPercent !== 0) return `${total.bytesStreamedPercent.toFixed(1)}% `;
        return ``;
    })();

    const getProgressBarClassBasedOnState = (x: any) => {
        if ('flushed' in x) return 'bg-success';
        if ('canceled' in x) return 'bg-danger';
        return '';
    };

    const html = `

<!doctype html>
<html lang="en" data-bs-theme="dark">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="${denoConfig["status-refresh-seconds"]}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${totalPercentText.length === 0 ? 'Status' : totalPercentText} - Deno File Server</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  </head>
  <body>

    <div class="container">

        <table class="table">
            <thead>
                <tr>
                    <th>Started</th>
                    <th>File</th>
                    <th>Size</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${stateInfo.map((x: any) => `
                    <tr>
                        <td>${new Date(x.created).toLocaleString()}</td>                   
                        <td>${basename(x.filePath)}</td>
                        <td>${formatBytes(x.totalBytes)}</td>
                        <td>
                            <div class="progress" role="progressbar">
                                <div class="progress-bar overflow-visible ${getProgressBarClassBasedOnState(x)}" 
                                    style="width: ${x.percent}%">${x.status} - ${x.bytesPerSecond !== 0 ? formatBytes(x.bytesPerSecond) + '/s' : ''} - ${x.percent.toFixed(1)}%
                                </div>
                            </div>
                        </td>
                    </tr>
                `).join('\n')}
            </tbody>
        </table>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
  </body>
</html>

    `;

    const headers = new Headers();
    headers.set('content-type', 'text/html; charset=UTF-8');
  
    const status = STATUS_CODE.OK;
    return new Response(html, {
      status,
      statusText: STATUS_TEXT[status],
      headers,
    });

}