import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error('Invalid credentials');
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.id);
      setSuccess(true);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e3f6fd 100%)" }}>
      <form className="p-4 rounded shadow" style={{ minWidth: 350, background: "#fff", border: "1px solid #e3e8ee" }} onSubmit={handleSubmit}>
        <h2 className="mb-4 text-center" style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, letterSpacing: 1 }}>Login</h2>
        <div className="mb-3">
          <label className="form-label fw-semibold">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger py-1">{error}</div>}
        {success && <div className="alert alert-success py-1">Login successful!</div>}
        <button type="submit" className="btn btn-primary w-100 fw-bold mt-2">Login</button>
        <button
          type="button"
          className="btn btn-link w-100 mt-2"
          onClick={() => navigate('/register')}
        >
          Don't have an account? Register
        </button>
      </form>
    </div>
  );
}