'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// WebKitおよび標準のSpeechRecognitionの型定義
interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
        [index: number]: {
            [index: number]: {
                transcript: string;
            };
            isFinal: boolean;
        };
        length: number;
    };
}

interface SpeechRecognitionErrorEvent {
    error: string;
    message?: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    onstart: () => void;
}

declare global {
    interface Window {
        SpeechRecognition?: { new(): SpeechRecognition };
        webkitSpeechRecognition?: { new(): SpeechRecognition };
    }
}

export function useWebSpeech() {
    const [isRecording, setIsRecording] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported] = useState(
        typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    );

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ja-JP';

        recognition.onstart = () => {
            setIsRecording(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            let currentInterimTranscript = '';
            let currentFinalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const result = event.results[i];
                if (result.isFinal) {
                    currentFinalTranscript += result[0].transcript;
                } else {
                    currentInterimTranscript += result[0].transcript;
                }
            }

            if (currentFinalTranscript) {
                setFinalTranscript((prev) => prev + currentFinalTranscript);
            }
            setInterimTranscript(currentInterimTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);

            let errorMessage = `Error: ${event.error}`;
            if (event.error === 'network') {
                errorMessage = 'ネットワークエラーが発生しました（Chromeの場合、Googleの音声認識サーバーへの接続に失敗した可能性があります）。インターネット環境を確認するか、時間をおいて再度お試しください。';
            } else if (event.error === 'not-allowed') {
                errorMessage = 'マイクへのアクセスが許可されていません。ブラウザの設定からマイクの利用を許可してください。';
            } else if (event.error === 'no-speech') {
                errorMessage = '音声が検出されませんでした。マイクを確認してもう一度お話しください。';
            }

            setError(errorMessage);
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
            setInterimTranscript('');
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const startRecording = useCallback(() => {
        if (recognitionRef.current && !isRecording) {
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.error('Failed to start recording:', err);
                setError('Failed to start recording.');
            }
        }
    }, [isRecording]);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
        }
    }, [isRecording]);

    const resetTranscript = useCallback(() => {
        setFinalTranscript('');
        setInterimTranscript('');
        setError(null);
    }, []);

    return {
        isSupported,
        isRecording,
        interimTranscript,
        finalTranscript,
        error,
        startRecording,
        stopRecording,
        resetTranscript,
    };
}
