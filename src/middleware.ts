import { runWithAmplifyServerContext } from '@/utils/amplify-utils';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    const authenticated = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        try {
          const session = await fetchAuthSession(contextSpec, {});
          return session.tokens !== undefined;
        } catch (error) {
          console.log(error);
          return false;
        }
      },
    });

    console.log("Authenticated", authenticated);
  
    if (authenticated) {
      return response;
    }
  
    return NextResponse.redirect(new URL("/signin", request.url));
}
 
export const config = {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       * - signin (login page)
       * - root (homepage)
       */
      "/account",
    ],
  };