import denoConfig from '../deno.json' with { type: 'json' };

export const state: any = [];
export const total = {
    bytesStreamed: 0,
    bytes: 0,
    bytesStreamedPercent: 0,
    activeBytesStreamed: 0,
    activeBytes: 0,
    activeBytesStreamedPercent: 0,
};

export class ProgressTransformStream extends TransformStream<Uint8Array, Uint8Array> {
    public streamState: any = {};
  
    constructor(totalBytes: number, description?: string) {
        super({
            transform: (chunk, controller) => {
                this.streamState.totalBytesStreamed += chunk.byteLength;
                this.streamState.rateBytesStreamed += chunk.byteLength;

                const now = Date.now();
                if (this.streamState.rateBeginTimestamp + denoConfig['status-rate-interval-milliseconds'] < now) {
                    const msDelta = now - this.streamState.rateBeginTimestamp;
                    this.streamState.bytesPerSecond = this.streamState.rateBytesStreamed / (msDelta / 1000);
                    this.streamState.rateBytesStreamed = 0;
                    this.streamState.rateBeginTimestamp = now;
                }
                
                controller.enqueue(chunk);
            },

            cancel: (reason) => {
                this.streamState.canceled = Date.now();
                this.streamState.canceledReason = reason;
                this.streamState.bytesPerSecond = 0;
            },

            flush: (controller) => {
                this.streamState.flushed = Date.now();
                this.streamState.bytesPerSecond = 0;
            },
        });
 
        this.streamState = { 
            created: Date.now(),
            description, 
            totalBytes, 
            totalBytesStreamed: 0,
            
            rateBeginTimestamp: Date.now(),
            rateBytesStreamed: 0,
            bytesPerSecond: 0
            
        };
        state.push(this.streamState);
    }
}

// This is a specialized transform stream class designed to extract as much new logic out of file_server.ts as possible.
export class HttpRequestProgressTransformStream extends ProgressTransformStream {
    constructor(filePath: string, totalBytes: number, req: any) {
        super(totalBytes);
        this.streamState.filePath = filePath;
        this.streamState.ipAddress = req.info.remoteAddr.hostname;
    }
}

export function calculateState() {
    total.bytesStreamed = 0;
    total.bytes = 0;
    total.activeBytesStreamed = 0;
    total.activeBytes = 0;

    for (const x of state) {
        if (typeof x.totalBytes !== 'number') continue;
        x.percent = (x.totalBytesStreamed / x.totalBytes) * 100;
        if ('canceled' in x) continue;  // don't add canceled streams to totals
        total.bytesStreamed += x.totalBytesStreamed;
        total.bytes += x.totalBytes;
        if ('flushed' in x) continue;
        total.activeBytesStreamed += x.totalBytesStreamed;
        total.activeBytes += x.totalBytes;
    }

    total.bytesStreamedPercent = total.bytes !== 0 ? (total.bytesStreamed / total.bytes) * 100 : 0;
    total.activeBytesStreamedPercent = total.activeBytes !== 0 ? (total.activeBytesStreamed / total.activeBytes) * 100 : 0;    
}

export function continuouslyLogProgressToConsole(checkInterval = 5000) {
    let lastStateJson: string = '';
    setInterval(() => {
        const stateJson = JSON.stringify(state);
        if (lastStateJson === stateJson) return;
        calculateState();
        lastStateJson = stateJson;
        console.log(state);

    }, checkInterval);
}

// continuouslyLogProgressToConsole();