export const state: any = [];

export class ProgressTransformStream extends TransformStream<Uint8Array, Uint8Array> {
    public streamState: any = {};
  
    constructor(totalBytes: number, description?: string) {
        super({
            transform: (chunk, controller) => {
                this.streamState.totalBytesStreamed += chunk.length;
                controller.enqueue(chunk);
            },

            cancel: (reason) => {
                this.streamState.canceled = Date.now();
                this.streamState.canceledReason = reason;
            },

            flush: (controller) => {
                this.streamState.flushed = Date.now();
            },
        });
 
        this.streamState = { 
            created: Date.now(),
            description, 
            totalBytes, 
            totalBytesStreamed: 0 
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

export function updatePercent() {
    for (const x of state) {
        if (typeof x.totalBytes === 'number') {
            const percent = (x.totalBytesStreamed / x.totalBytes) * 100;
            x.percent = (percent).toFixed(2);
        }
    }
}

export function continuouslyLogProgressToConsole(checkInterval = 5000) {
    let lastStateJson: string = '';
    setInterval(() => {
        const stateJson = JSON.stringify(state);
        if (lastStateJson === stateJson) return;
        updatePercent();
        lastStateJson = stateJson;
        console.log(state);

    }, checkInterval);
}

// continuouslyLogProgressToConsole();