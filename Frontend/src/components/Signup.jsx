import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('regular');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/signup', { username, password, role });
            alert('Signup successful');
            navigate('/login');
        } catch (error) {
            console.error('Signup error', error);
            alert('Signup failed');
        }
    };

    return (
        <div className="bg-white p-8 rounded shadow-md w-96">
            <h2 className="text-2xl font-bold mb-4">Signup</h2>
            <form onSubmit={handleSubmit}>
                <input
                    className="w-full p-2 mb-4 border rounded"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className="w-full p-2 mb-4 border rounded"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <select
                    className="w-full p-2 mb-4 border rounded"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="regular">Regular User</option>
                    <option value="admin">Admin</option>
                </select>
                <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600" type="submit">Signup</button>
            </form>
            <p className="mt-4">
                Already have an account? <Link to="/login" className="text-blue-500">Log in</Link>
            </p>
        </div>
    );
}

export default Signup;