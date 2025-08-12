import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        let errorMessage = 'Registration failed: Email or username already exists';
        throw new Error(errorMessage);
      }

      setSuccess('Registration successful! You can now log in.');
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e3f6fd 100%)" }}>
      <form className="p-4 rounded shadow" style={{ minWidth: 350, background: "#fff", border: "1px solid #e3e8ee" }} onSubmit={handleSubmit}>
        <h2 className="mb-4 text-center" style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, letterSpacing: 1 }}>Register</h2>
        <div className="mb-3">
          <label className="form-label fw-semibold">Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Create a password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger py-1">{error}</div>}
        {success && <div className="alert alert-success py-1">{success}</div>}
        <button type="submit" className="btn btn-primary w-100 fw-bold mt-2">Register</button>
        <button
          type="button"
          className="btn btn-link w-100 mt-2"
          onClick={() => navigate('/login')}
        >
          Already have an account? Log in
        </button>
      </form>
    </div>
  );
}