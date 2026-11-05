import { redirect } from 'next/navigation'

export default function WalletsRedirectPage() {
  redirect('/dashboard?tab=wallets')
}

