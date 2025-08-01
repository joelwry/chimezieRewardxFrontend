import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default function Home() {
  const accessToken = cookies().get('access_token')?.value
  if (accessToken) {
    redirect("/dashboard")
  } else {
    redirect("/landing")
  }
  return null
}
