import React, { createContext, useContext, useState } from 'react';

// Create a context for authentication
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // This would normally come from your backend/API
    const [user, setUser] = useState({
        username: 'testUser',
        role: 'user', // Change to 'admin' for admin access
    });

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
