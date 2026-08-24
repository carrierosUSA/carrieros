import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";

const protectedRoutes = [
  "/",
  "/alerts",
  "/analytics",
  "/dispatch",
  "/documents",
  "/driver",
  "/finance",
  "/fleet",
  "/settings",
  "/system-readiness",
];

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

const port = await availablePort();
const base = `http://127.0.0.1:${port}`;
const robotsPolicy = "noindex, nofollow, noarchive, nosnippet, noimageindex";
const env = { ...process.env, NODE_ENV: "production" };
delete env.NEXT_PUBLIC_SUPABASE_URL;
delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
delete env.SUPABASE_SERVICE_ROLE_KEY;
delete env.OPENAI_API_KEY;
delete env.ALPH_DOCUMENT_BUCKET;

const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)], {
  env,
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
app.stdout.on("data", (chunk) => { output += chunk.toString(); });
app.stderr.on("data", (chunk) => { output += chunk.toString(); });

async function waitUntilReady() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (app.exitCode !== null) throw new Error(`Next server exited before smoke testing. ${output}`);
    try {
      const response = await fetch(`${base}/login`, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Next server did not become ready. ${output}`);
}

try {
  await waitUntilReady();
  const login = await fetch(`${base}/login`, { redirect: "manual" });
  const loginBody = await login.text();
  assert.equal(login.status, 200);
  assert.match(loginBody, /Sign in securely/);
  assert.equal(login.headers.get("x-content-type-options"), "nosniff");
  assert.equal(login.headers.get("x-frame-options"), "DENY");
  assert.equal(login.headers.get("x-dns-prefetch-control"), "off");
  assert.equal(login.headers.get("strict-transport-security"), "max-age=31536000");
  assert.equal(login.headers.get("cross-origin-opener-policy"), "same-origin");
  assert.equal(login.headers.get("cross-origin-resource-policy"), "same-origin");
  assert.equal(login.headers.get("x-permitted-cross-domain-policies"), "none");
  assert.equal(login.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(login.headers.get("x-robots-tag"), robotsPolicy);
  assert.equal(
    login.headers.get("permissions-policy"),
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()",
  );
  const contentSecurityPolicy = login.headers.get("content-security-policy") ?? "";
  for (const directive of ["base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "object-src 'none'"]) assert.ok(contentSecurityPolicy.includes(directive));

  const health = await fetch(`${base}/api/health`, { redirect: "manual" });
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: "ok" });
  assert.match(health.headers.get("cache-control") ?? "", /no-store/);
  assert.equal(health.headers.get("x-robots-tag"), robotsPolicy);

  const healthHead = await fetch(`${base}/api/health`, { method: "HEAD", redirect: "manual" });
  assert.equal(healthHead.status, 200);
  assert.equal(await healthHead.text(), "");

  const readiness = await fetch(`${base}/api/readiness`, { redirect: "manual" });
  assert.equal(readiness.status, 503);
  assert.deepEqual(await readiness.json(), { status: "not_ready" });
  assert.match(readiness.headers.get("cache-control") ?? "", /no-store/);

  const readinessHead = await fetch(`${base}/api/readiness`, { method: "HEAD", redirect: "manual" });
  assert.equal(readinessHead.status, 503);
  assert.equal(await readinessHead.text(), "");

  for (const route of protectedRoutes) {
    const response = await fetch(`${base}${route}`, { redirect: "manual" });
    assert.ok([307, 308].includes(response.status), `${route} must redirect while authentication is unconfigured`);
    const location = response.headers.get("location") ?? "";
    const destination = new URL(location, base);
    assert.equal(destination.pathname, "/login", `${route} must redirect to login`);
    assert.equal(destination.searchParams.get("error"), "configuration", `${route} must fail closed to the configuration login state`);
  }

  const missing = await fetch(`${base}/definitely-not-a-transpo-route`, { redirect: "manual" });
  assert.equal(missing.status, 404);
  console.log(`Unauthenticated production smoke passed: liveness, fail-closed readiness, login, security headers, ${protectedRoutes.length} protected routes, and 404 behavior verified. No external service, database, user, or production action was performed.`);
} finally {
  app.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => app.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ]);
  if (app.exitCode === null) app.kill("SIGKILL");
}
