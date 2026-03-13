import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        // Optional custom logic inside middleware can go here
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

// Protect all routes except the authentication pages, api, statically served files, etc.
export const config = {
    matcher: [
        "/",
        "/courses/:path*",
        "/grades/:path*",
        "/finance/:path*",
        "/schedule/:path*",
        "/settings/:path*",
        // Exclude specific auth pathways
        // matcher doesn't regex perfectly, so we just specify the explicit protected paths
    ]
};
