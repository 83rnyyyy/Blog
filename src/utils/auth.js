import { auth } from "@/app/api/auth/[...nextauth]/route"

export const getAuthSession = () => auth()