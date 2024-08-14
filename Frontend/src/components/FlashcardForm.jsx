import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const FlashcardForm = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchFlashcard();
        }
    }, [id]);

    const fetchFlashcard = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/flashcards/${id}`);
            setQuestion(response.data.question);
            setAnswer(response.data.answer);
        } catch (error) {
            console.error('Error fetching flashcard:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await axios.put(`http://localhost:5000/api/flashcards/${id}`, { question, answer });
            } else {
                await axios.post('http://localhost:5000/api/flashcards', { question, answer });
            }
            navigate('/');
        } catch (error) {
            console.error('Error saving flashcard:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 shadow rounded">
            <h2 className="text-2xl font-bold mb-4">{id ? 'Edit Flashcard' : 'Add Flashcard'}</h2>
            <div className="mb-4">
                <label htmlFor="question" className="block text-gray-700">
                    Question:
                </label>
                <input
                    type="text"
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                    className="w-full mt-2 p-2 border rounded"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="answer" className="block text-gray-700">
                    Answer:
                </label>
                <textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                    className="w-full mt-2 p-2 border rounded"
                />
            </div>
            <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                {id ? 'Update' : 'Add'} Flashcard
            </button>
        </form>
    );
};

export default FlashcardForm;
