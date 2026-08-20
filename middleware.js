export const config = {
  matcher: "/((?!favicon.ico).*)",
};

export default function middleware(request) {
  const expectedUser = process.env.BASIC_AUTH_USER || "stacc";
  const expectedPass = process.env.BASIC_AUTH_PASSWORD;

  if (!expectedPass) {
    return new Response(
      "Missing BASIC_AUTH_PASSWORD env var — set it in Vercel project settings.",
      { status: 500 },
    );
  }

  const header = request.headers.get("authorization");
  if (header && header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(":");
    const user = decoded.slice(0, separator);
    const pass = decoded.slice(separator + 1);
    if (user === expectedUser && pass === expectedPass) {
      return;
    }
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate":
        'Basic realm="Stacc Email Signature Creator", charset="UTF-8"',
    },
  });
}
