import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // ลบตาราง BusinessCards ถ้ามีอยู่
    await executeQuery(
      `
      DROP TABLE IF EXISTS BusinessCards
    `,
      [],
    )

    return NextResponse.json({ success: true, message: "ลบข้อมูลนามบัตรเรียบร้อยแล้ว" })
  } catch (error) {
    console.error("Error cleaning up business cards data:", error)
    return NextResponse.json({ error: "ไม่สามารถลบข้อมูลนามบัตรได้" }, { status: 500 })
  }
}
