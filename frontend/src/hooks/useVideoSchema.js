import {useState, useEffect} from 'react';
import { INITIAL_VIDEO_SCHEMA } from '../utils/videoSchema';


export default function useVideoSchema() {
    const [schema, setSchema] = useState(() => {
        const savedSchema = localStorage.getItem('videoSchema');
        return savedSchema ? JSON.parse(savedSchema) : INITIAL_VIDEO_SCHEMA;
    });

    useEffect(() => {
        localStorage.setItem('videoSchema', JSON.stringify(schema));
    }, [schema]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.removeItem('videoSchema');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    return [schema, setSchema];
}