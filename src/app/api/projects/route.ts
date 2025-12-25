import prisma  from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { 
      habits: true, 
      tasks: true 
    }
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  try {
    const { title, color } = await req.json();
    const project = await prisma.project.create({
      data: { title, color }
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating project" }, { status: 500 });
  }
}