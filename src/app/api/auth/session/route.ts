import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretkey12345');

export async function GET() {
  const token = cookies().get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return NextResponse.json({ user: { email: payload.email } });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
