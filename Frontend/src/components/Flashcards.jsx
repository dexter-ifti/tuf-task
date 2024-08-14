import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Flashcards() {
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFlashcards = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const response = await axios.get('http://localhost:5000/api/flashcards', {
                    headers: { Authorization: token }
                });
                setFlashcards(response.data);
            } catch (error) {
                console.error('Error fetching flashcards', error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        };
        fetchFlashcards();
    }, [navigate]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
        setIsFlipped(false);
    };

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
        setIsFlipped(false);
    };

    if (flashcards.length === 0) {
        return <div className="text-center">Loading flashcards...</div>;
    }

    const currentFlashcard = flashcards[currentIndex];

    return (
        <div className="bg-white p-8 rounded shadow-md w-96">
            <h2 className="text-2xl font-bold mb-4">Flashcards</h2>
            <div
                onClick={handleFlip}
                className="cursor-pointer border p-4 mb-4 h-48 flex items-center justify-center text-lg"
            >
                {isFlipped ? currentFlashcard.answer : currentFlashcard.question}
            </div>
            <div className="flex justify-between">
                <button onClick={handlePrevious} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Previous</button>
                <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Next</button>
            </div>
        </div>
    );
}

export default Flashcards;