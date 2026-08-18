import { Link } from 'react-router'

export function DebugPage() {
  const accessToken = localStorage.getItem('accessToken')
  const authToken = localStorage.getItem('auth_token')

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
        
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Access Token:</strong> {accessToken || 'null'}</p>
              <p><strong>Auth Token:</strong> {authToken || 'null'}</p>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Available Routes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <Link to="/" className="text-primary hover:underline">Home (Landing)</Link>
              <Link to="/login" className="text-primary hover:underline">Login</Link>
              <Link to="/dashboard" className="text-primary hover:underline">Dashboard</Link>
              <Link to="/products" className="text-primary hover:underline">Products</Link>
              <Link to="/inventory" className="text-primary hover:underline">Inventory</Link>
              <Link to="/sales" className="text-primary hover:underline">Sales</Link>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Backend Connection</h2>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('http://localhost:5000/health')
                  const data = await response.json()
                  alert('Backend Status: ' + JSON.stringify(data, null, 2))
                } catch (error) {
                  alert('Backend Error: ' + error)
                }
              }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Test Backend Connection
            </button>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  localStorage.removeItem('accessToken')
                  localStorage.removeItem('auth_token')
                  window.location.reload()
                }}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded hover:bg-destructive/90"
              >
                Clear All Tokens
              </button>
              <Link
                to="/login"
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90 inline-block"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}