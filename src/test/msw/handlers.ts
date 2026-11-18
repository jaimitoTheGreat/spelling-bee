import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === "admin@nova.edu" && body.password === "secret123") {
      return HttpResponse.json({
        user: { id: "1", nombre: "Admin", rol: "organizador" },
      });
    }
    return new HttpResponse(null, { status: 401 });
  }),
];