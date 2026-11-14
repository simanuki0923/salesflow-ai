import {
  NextRequest,
  NextResponse,
} from "next/server";

import type {
  AuthUser,
} from "@/lib/api/auth";

import {
  AUTH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-cookie";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000/api/v1"
).replace(/\/$/, "");

type LoginRequestBody = {
  email: string;
  password: string;
  remember?: boolean;
};

type TokenLoginResponse = {
  data: {
    user: AuthUser;
    token: string;
  };
};

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  let credentials:
    LoginRequestBody;

  try {
    credentials =
      await request.json() as
        LoginRequestBody;
  } catch {
    return NextResponse.json(
      {
        message:
          "Invalid request.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const backendResponse =
      await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              credentials,
            ),

          cache:
            "no-store",
        },
      );

    const responseText =
      await backendResponse.text();

    if (!backendResponse.ok) {
      return new NextResponse(
        responseText,
        {
          status:
            backendResponse.status,

          headers: {
            "Content-Type":
              backendResponse.headers.get(
                "Content-Type",
              ) ??
              "application/json",
          },
        },
      );
    }

    const tokenResponse =
      JSON.parse(
        responseText,
      ) as TokenLoginResponse;

    const response =
      NextResponse.json({
        data:
          tokenResponse.data.user,
      });

    response.cookies.set({
      name:
        AUTH_TOKEN_COOKIE_NAME,

      value:
        tokenResponse.data.token,

      httpOnly:
        true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      ...(credentials.remember === true
        ? {
            maxAge:
              60 * 60 * 24 * 30,
          }
        : {}),
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        message:
          "Backend server is unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}
