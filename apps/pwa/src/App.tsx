import { useEffect, useState } from 'react'
function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold">{message}</h1>
      <button className="bg-blue-500 text-white p-2 rounded-md">Click me</button>
    </div>
  )
}

export default App
