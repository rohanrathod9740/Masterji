import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

const DEFAULT_BACKEND_BASE_URL = "http://localhost:5000";

const BACKEND_BASE_URL =
  process.env.BACKEND_API_BASE_URL?.trim().replace(/\/$/, "") ||
  DEFAULT_BACKEND_BASE_URL;

function buildBackendUrl(path: string) {
  return new URL(path, `${BACKEND_BASE_URL}/`);
}

async function toProxyResponse(response: Response) {
  const text = await response.text();
  const contentType =
    response.headers.get("content-type") ?? "application/json; charset=utf-8";

  return new Response(text, {
    status: response.status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    },
  });
}

export async function forwardJson(
  path: string,
  {
    method = "GET",
    body,
  }: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
  } = {},
) {
  const response = await fetch(buildBackendUrl(path), {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  return toProxyResponse(response);
}

export async function forwardGetWithBody(path: string, body: unknown) {
  const url = buildBackendUrl(path);
  const payload = JSON.stringify(body ?? {});
  const requestFn = url.protocol === "https:" ? httpsRequest : httpRequest;

  return new Promise<Response>((resolve, reject) => {
    const request = requestFn(
      url,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          resolve(
            new Response(text, {
              status: response.statusCode ?? 500,
              headers: {
                "Content-Type":
                  response.headers["content-type"] ??
                  "application/json; charset=utf-8",
                "Cache-Control": "no-store",
              },
            }),
          );
        });
      },
    );

    request.on("error", reject);
    request.write(payload);
    request.end();
  });
}
