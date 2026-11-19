let worker;
let runNonce = '';
let initialized = false;

window.addEventListener('message', (event) => {
  if (event.source !== window.parent) return;
  const data = event.data;
  if (!data || typeof data !== 'object') return;
  if (data.stop) {
    worker?.terminate();
    worker = undefined;
    return;
  }
  if (
    initialized ||
    typeof data.nonce !== 'string' ||
    typeof data.source !== 'string'
  ) {
    return;
  }
  initialized = true;
  runNonce = data.nonce;
  const blobUrl = URL.createObjectURL(
    new Blob([data.source], { type: 'text/javascript' }),
  );
  worker = new Worker(blobUrl);
  URL.revokeObjectURL(blobUrl);
  worker.onmessage = (e) => {
    window.parent.postMessage({ nonce: runNonce, result: e.data }, '*');
  };
  worker.onerror = (e) => {
    window.parent.postMessage(
      {
        nonce: runNonce,
        result: { rows: [], logs: [], error: e.message || '執行失敗' },
      },
      '*',
    );
  };
  worker.postMessage({ code: data.code, modules: data.modules });
});

window.parent.postMessage({ ready: true }, '*');
