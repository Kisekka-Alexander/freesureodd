import { http, HttpResponse } from "msw";

export const handlers = [
  // Auth endpoints
  http.post("/api/auth/login", async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    // Mock authentication logic
    if (email === "user@example.com" && password === "password") {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: "1",
            email: "user@example.com",
            name: "John Doe",
          },
          token: "mock-jwt-token",
        },
        message: "Login successful",
      });
    }

    return HttpResponse.json(
      {
        success: false,
        message: "Invalid credentials",
      },
      { status: 401 }
    );
  }),

  // User endpoints
  http.get("/api/users", () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: "1", email: "user1@example.com", name: "User One" },
        { id: "2", email: "user2@example.com", name: "User Two" },
      ],
      message: "Users fetched successfully",
    });
  }),

  // Example API endpoint
  http.get("/api/data", () => {
    return HttpResponse.json({
      success: true,
      data: {
        message: "Hello from MSW!",
        timestamp: new Date().toISOString(),
      },
    });
  }),
];
