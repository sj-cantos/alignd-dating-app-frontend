import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ 
      message: "MongoDB connected successfully!",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json(
      { 
        error: "Failed to connect to MongoDB", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    return NextResponse.json({ 
      message: "MongoDB connected successfully via POST",
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json(
      { 
        error: "Failed to connect to MongoDB", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}