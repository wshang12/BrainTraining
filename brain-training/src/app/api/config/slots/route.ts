import { NextResponse } from "next/server";
import slots from "@/data/slots.json";

export async function GET() {
  return NextResponse.json(slots);
}