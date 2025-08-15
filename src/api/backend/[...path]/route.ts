// app/api/backend/[...path]/route.ts
export const runtime = 'nodejs'; // Edge 말고 Node 런타임에서 실행

const TARGET = process.env.BACKEND_TARGET ?? 'http://3.34.178.244:9000';

// 금지/조정할 헤더 (Host 등은 대상 서버가 다시 세팅해야 함)
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

function sanitizedHeaders(h: Headers) {
  const out = new Headers();
  h.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase())) out.set(k, v);
  });
  return out;
}

async function proxy(req: Request, { params }: { params: { path: string[] } }) {
  const search = new URL(req.url).search;
  const url = `${TARGET}/${params.path.join('/')}${search}`;

  const init: RequestInit = {
    method: req.method,
    headers: sanitizedHeaders(req.headers),
    body: ['GET','HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: 'manual',
  };

  const resp = await fetch(url, init);

  // 원본 응답 헤더를 그대로 전달(Set-Cookie 포함)
  const headers = new Headers();
  resp.headers.forEach((v, k) => headers.set(k, v));

  return new Response(resp.body, { status: resp.status, headers });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };