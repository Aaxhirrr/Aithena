import Button from '../ui/Button.jsx'

export default function ProfileSetup() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Profile Setup</h2>
      <form className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Display Name" />
        <textarea className="w-full border rounded p-2" placeholder="Bio" rows="3" />
        <Button className="w-full">Save</Button>
      </form>
    </div>
  )
}

