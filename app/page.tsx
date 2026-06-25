import { redirect } from 'next/navigation'

// Root "/" redirects to /login by default; middleware handles the actual protection.
export default function RootPage() {
  redirect('/login')
}
