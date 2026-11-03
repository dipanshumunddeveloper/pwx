const fs = require('fs');

function fixProxy() {
  const file = 'artifacts/api-server/src/routes/proxy.ts';
  let code = fs.readFileSync(file, 'utf8');

  // Fix injectBaseUrl
  const newInjectBaseUrl = `function injectBaseUrl(mpdXml: string, baseUrl: string): string {
  if (mpdXml.includes("<BaseURL>")) {
    return mpdXml.replace(/<BaseURL>(.*?)<\\/BaseURL>/g, (match, p1) => {
      if (p1.startsWith("http://") || p1.startsWith("https://")) {
        return match;
      }
      return \`<BaseURL>\${baseUrl}\${p1}</BaseURL>\`;
    });
  }
  return mpdXml.replace(/<Period([^>]*)>/g, \`<Period$1>\\n    <BaseURL>\${baseUrl}</BaseURL>\`);
}`;

  code = code.replace(
    /function injectBaseUrl[\s\S]*?\n\}/,
    newInjectBaseUrl
  );

  // Fix missing ReadableStream pipe issue
  if (!code.includes('import { Readable } from "node:stream";')) {
    code = 'import { Readable } from "node:stream";\n' + code;
  }
  code = code.replace(
    /upstream\.body\.pipe\(res\);/g,
    'Readable.fromWeb(upstream.body as any).pipe(res);'
  );

  fs.writeFileSync(file, code);
}

fixProxy();
