import type { Metadata } from 'next'
import RegisterForm from './_RegisterForm'

export const metadata: Metadata = { title: 'Register' }

export default function RegisterPage() {
  return <RegisterForm />
}
