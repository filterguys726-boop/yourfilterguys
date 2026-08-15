import { SquareClient, SquareEnvironment } from "square";
import { squareAccessToken, squareEnvironment } from "@/lib/env";

export function getSquare() {
  if (!squareAccessToken) {
    throw new Error("Square access token is missing.");
  }

  return new SquareClient({
    token: squareAccessToken,
    environment:
      squareEnvironment === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox
  });
}
