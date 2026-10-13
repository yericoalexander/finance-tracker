import { redirect } from 'next/navigation'

// Root "/" mengarah ke dashboard; auth guard ada di middleware (Fase 1)
export default function RootPage() {
  redirect('/dashboard')
}
