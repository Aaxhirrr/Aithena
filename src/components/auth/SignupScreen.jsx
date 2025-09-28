import Button from '../ui/Button.jsx'

export default function SignupScreen() {
  return (
    <div className="max-w-sm mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Create Account</h2>
      <form className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Email" />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" />
        <Button type="submit" className="w-full">Sign Up</Button>
      </form>
    </div>
  )
}

