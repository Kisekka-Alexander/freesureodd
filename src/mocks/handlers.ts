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

  // Predictions endpoints
  http.get("/api/predictions", () => {
    const mockPredictions = [
      {
        id: "1",
        match: {
          id: "match1",
          homeTeam: {
            id: "team1",
            name: "Manchester United",
            logo: "/logos/man-utd.png",
            country: "England",
          },
          awayTeam: {
            id: "team2",
            name: "Liverpool",
            logo: "/logos/liverpool.png",
            country: "England",
          },
          date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          league: "Premier League",
          status: "upcoming" as const,
        },
        prediction: {
          winner: "away" as const,
          homeScore: 1,
          awayScore: 2,
          confidence: 78,
        },
        odds: {
          home: 2.45,
          away: 2.8,
          draw: 3.2,
        },
        analysis:
          "Liverpool's strong attacking form and recent head-to-head record gives them an edge in this fixture.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        match: {
          id: "match2",
          homeTeam: {
            id: "team3",
            name: "Barcelona",
            logo: "/logos/barcelona.png",
            country: "Spain",
          },
          awayTeam: {
            id: "team4",
            name: "Real Madrid",
            logo: "/logos/real-madrid.png",
            country: "Spain",
          },
          date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          league: "La Liga",
          status: "upcoming" as const,
        },
        prediction: {
          winner: "home" as const,
          homeScore: 2,
          awayScore: 1,
          confidence: 65,
        },
        odds: {
          home: 2.1,
          away: 3.4,
          draw: 3.5,
        },
        analysis:
          "Barcelona's home advantage and recent tactical improvements should see them through in El Clasico.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        match: {
          id: "match3",
          homeTeam: {
            id: "team5",
            name: "Bayern Munich",
            logo: "/logos/bayern.png",
            country: "Germany",
          },
          awayTeam: {
            id: "team6",
            name: "Borussia Dortmund",
            logo: "/logos/dortmund.png",
            country: "Germany",
          },
          date: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
          league: "Bundesliga",
          status: "upcoming" as const,
        },
        prediction: {
          winner: "home" as const,
          homeScore: 3,
          awayScore: 1,
          confidence: 82,
        },
        odds: {
          home: 1.85,
          away: 4.2,
          draw: 3.8,
        },
        analysis:
          "Bayern's dominant home record and superior squad depth should overcome Dortmund's challenge.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "4",
        match: {
          id: "match4",
          homeTeam: {
            id: "team7",
            name: "PSG",
            logo: "/logos/psg.png",
            country: "France",
          },
          awayTeam: {
            id: "team8",
            name: "Marseille",
            logo: "/logos/marseille.png",
            country: "France",
          },
          date: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
          league: "Ligue 1",
          status: "upcoming" as const,
        },
        prediction: {
          winner: "home" as const,
          homeScore: 2,
          awayScore: 0,
          confidence: 75,
        },
        odds: {
          home: 1.6,
          away: 5.5,
          draw: 4.1,
        },
        analysis:
          "PSG's attacking prowess at home should be too much for Marseille's inconsistent defense.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return HttpResponse.json({
      success: true,
      data: mockPredictions,
      message: "Predictions fetched successfully",
    });
  }),

  // Get single prediction
  http.get("/api/predictions/:id", ({ params }) => {
    const { id } = params;

    // Mock single prediction data - you can expand this
    const mockPrediction = {
      id: id,
      match: {
        id: "match1",
        homeTeam: {
          id: "team1",
          name: "Manchester United",
          logo: "/logos/man-utd.png",
          country: "England",
        },
        awayTeam: {
          id: "team2",
          name: "Liverpool",
          logo: "/logos/liverpool.png",
          country: "England",
        },
        date: new Date(Date.now() + 86400000).toISOString(),
        league: "Premier League",
        status: "upcoming" as const,
      },
      prediction: {
        winner: "away" as const,
        homeScore: 1,
        awayScore: 2,
        confidence: 78,
      },
      odds: {
        home: 2.45,
        away: 2.8,
        draw: 3.2,
      },
      analysis: "Detailed analysis for this specific match...",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: mockPrediction,
      message: "Prediction fetched successfully",
    });
  }),
];
