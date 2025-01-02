import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { z } from "zod";
import { getToken } from "next-auth/jwt";
import { verifyToken } from "@/lib/jwt";
import { Classroom, classroomValidationSchema } from "@/models/Classroom";
import { School } from "@/models/School";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || !verifyToken(token.accessToken as string) || !token.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, vacancy, school } = classroomValidationSchema.parse(body);

    await connectToDatabase();

    const existingClassroom = await Classroom.findOne({ name, school });
    if (existingClassroom) {
      return NextResponse.json(
        { error: "Classroom already exists in this school" },
        { status: 400 }
      );
    }

    const newClassroom = new Classroom({ name, vacancy, school });
    await newClassroom.save();

    await School.findByIdAndUpdate(school, {
      $push: { classrooms: newClassroom._id },
    });

    return NextResponse.json(
      {
        classroom: newClassroom,
        message: "Classroom created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating classroom:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || !verifyToken(token.accessToken as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bearerToken = authHeader.split(" ")[1];
    const payload = verifyToken(bearerToken);

    await connectToDatabase();

    // If user is admin, they can see all classrooms
    // If not, they can only see classrooms from their school
    const query = payload?.isAdmin ? {} : { school: payload?.school };
    const classrooms = await Classroom.find(query)
      .populate("students")
      .populate("school")
      .exec();

    return NextResponse.json({ classrooms });
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || !verifyToken(token.accessToken as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      school: _id,
      name,
      vacancy,
    } = classroomValidationSchema.parse(body);
    await connectToDatabase();

    const classroom = await Classroom.findById(_id);
    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    const updatedClassroom = await Classroom.findByIdAndUpdate(
      _id,
      { name, vacancy },
      { new: true }
    );
    if (!updatedClassroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        classroom: updatedClassroom,
        message: "Classroom updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating classroom:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || !verifyToken(token.accessToken as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { _id } = body;
    await connectToDatabase();

    const classroom = await Classroom.findById(_id);
    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    const deletedClassroom = await Classroom.findByIdAndDelete(_id);
    if (!deletedClassroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Classroom deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting classroom:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
