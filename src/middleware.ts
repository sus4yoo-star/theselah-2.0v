import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets, the
     * service worker, the manifest and image files.
     */
    "/((?!_next/static|_next/image|favicon.png|manifest.json|sw.js|icon-192.png|icon-512.png|apple-touch-icon.png|symbol-transparent.png|debug).*)",
  ],
};
