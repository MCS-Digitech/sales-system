import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"


export default withAuth((req) => {
    if (req?.nextauth?.token?.role === "ADMIN") {
        console.log("USER IS SELLER")
    } else {
        console.log("USER IS NOT SELLER")
    }
}, {
    callbacks: {
        authorized: token => !!token
    }
})