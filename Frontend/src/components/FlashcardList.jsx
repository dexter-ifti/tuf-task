import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const FlashcardList = () => {
    const [flashcards, setFlashcards] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchFlashcards();
    }, []);

    const fetchFlashcards = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/flashcards');
            setFlashcards(response.data);
        } catch (error) {
            console.error('Error fetching flashcards:', error);
        }
    };

    const deleteFlashcard = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/flashcards/${id}`);
            fetchFlashcards();
        } catch (error) {
            console.error('Error deleting flashcard:', error);
        }
    };

    return (
        <div>
            <h1>Flashcards</h1>
            {flashcards.map((flashcard) => (
                <div key={flashcard.id}>
                    <h3>{flashcard.question}</h3>
                    <p>{flashcard.answer}</p>
                    {user.role === 'admin' && (
                        <>
                            <Link to={`/edit/${flashcard.id}`}>Edit</Link>
                            <button onClick={() => deleteFlashcard(flashcard.id)}>Delete</button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FlashcardList;
