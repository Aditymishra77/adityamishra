import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    agents: [
      "Code Generator Agent",
      "Bug Fix Agent",
      "Code Refactor Agent",
      "Test Case Generator Agent",
      "Documentation Agent",
      "Security Scanner Agent"
    ],
    orchestration: "Agents can operate independently or collaborate through a shared task planner."
  });
}
