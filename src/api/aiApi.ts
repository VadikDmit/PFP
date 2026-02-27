import axios from 'axios';
import { PROJECT_KEY } from './clientApi';

// Use absolute path to match clientApi and avoid proxy buffering issues
const API_BASE_URL = import.meta.env.NEXT_PUBLIC_API_URL || 'https://pfpbackend-production.up.railway.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    config.headers['X-Project-Key'] = PROJECT_KEY;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const aiApi = {
    // Get chat history for a specific stage
    getHistory: async (stage?: string): Promise<any> => {
        const url = stage ? `/my/ai-b2c/history?stage=${stage}` : '/my/ai-b2c/history';
        const response = await api.get(url);
        return response.data;
    },

    // Clear chat history
    clearHistory: async (stage?: string): Promise<any> => {
        const url = stage ? `/my/ai-b2c/history?stage=${stage}` : '/my/ai-b2c/history';
        const response = await api.delete(url);
        return response.data;
    },

    // Send a message (streaming version). history — предыдущие сообщения диалога, чтобы ИИ не здоровался заново
    sendStreamingMessage: async (
        stage: string,
        message: string,
        onChunk: (partialText: string) => void,
        onDone: (fullText: string) => void,
        history?: Array<{ role: 'user' | 'assistant'; content: string }>
    ) => {
        const token = localStorage.getItem('token');
        const body: { stage: string; message: string; history?: Array<{ role: string; content: string }> } = { stage, message };
        if (history && history.length > 0) {
            body.history = history;
        }
        console.log(`[AI] Sending stream request to ${API_BASE_URL}/my/ai-b2c/chat/stream`, { stage, message, historyLength: history?.length ?? 0 });

        try {
            const response = await fetch(`${API_BASE_URL}/my/ai-b2c/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Project-Key': PROJECT_KEY
                },
                body: JSON.stringify(body)
            });

            console.log(`[AI] Response status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[AI] Backend error: ${response.status} - ${errorText}`);
                throw new Error(`Server error: ${response.status} ${errorText}`);
            }

            if (!response.body) {
                throw new Error('ReadableStream not supported');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // console.log('[AI] Chunk:', chunk); // Optional: verbose chunk logging
                const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

                for (const line of lines) {
                    const data = line.replace('data: ', '').trim();

                    if (data === '[DONE]') {
                        onDone(fullText);
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content || '';
                        if (content) {
                            fullText += content;
                            onChunk(fullText);
                        }
                    } catch (e) {
                        console.warn('Failed to parse SSE chunk:', data, e);
                    }
                }
            }
        } catch (err) {
            console.error('Streaming failed:', err);
            // Fallback or rethrow
            throw err;
        }
    },

    // Non-streaming message (just in case)
    sendMessage: async (stage: string, message: string): Promise<any> => {
        const response = await api.post('/my/ai-b2c/chat', { stage, message });
        return response.data;
    }
};
