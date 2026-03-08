'use client';

import { useWebSpeech } from '@/hooks/useWebSpeech';
import { useEffect, useState, useRef } from 'react';

export default function TranscriptArea({
    transcript,
    setTranscript,
    onGenerate,
    isGenerating,
}: {
    transcript: string;
    setTranscript: (value: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}) {
    const {
        isSupported,
        isRecording,
        interimTranscript,
        finalTranscript,
        error,
        startRecording,
        stopRecording,
        resetTranscript,
    } = useWebSpeech();

    const [prevTranscriptProp, setPrevTranscriptProp] = useState(transcript);
    const [localText, setLocalText] = useState(transcript);
    const lastFinalTranscriptRef = useRef(finalTranscript);

    // Web Speech APIの最終結果が更新されたら親へ渡す
    useEffect(() => {
        if (finalTranscript !== lastFinalTranscriptRef.current) {
            lastFinalTranscriptRef.current = finalTranscript;
            setTranscript(finalTranscript);
        }
    }, [finalTranscript, setTranscript]);

    // 親からtranscriptが変更された（リセット時など）の同期
    if (transcript !== prevTranscriptProp) {
        setPrevTranscriptProp(transcript);
        setLocalText(transcript);
        if (transcript === '' && finalTranscript !== '') {
            resetTranscript();
        }
    }

    const handleMockVoice = () => {
        setTranscript("先日のマネージャーミーティングの件ですが、在庫管理用のダッシュボードが必要という話になりました。全体の在庫総額をひと目で把握できるようにしたいです。また、在庫が少なくなっている商品については赤色などで警告を出して、早急に発注できるようにしたいですね。あと、現場のスタッフが倉庫内でモバイル端末から見ることも多いので、モバイル対応のUIも必須条件になります。ダッシュボード自体は複雑になりすぎないよう、シンプルさを保ちたいです。");
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setLocalText(newText);
        setTranscript(newText);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">🎙️</span>
                    Voice Transcript
                </h2>

                <div className="flex items-center gap-2">
                    {isSupported && (
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${isRecording
                                ? 'text-red-600 bg-red-50 hover:bg-red-100 border-red-100 animate-pulse'
                                : 'text-green-600 bg-green-50 hover:bg-green-100 border-green-100'
                                }`}
                        >
                            {isRecording ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                    Stop Recording
                                </>
                            ) : (
                                <>
                                    <span>🎤</span>
                                    Start Recording
                                </>
                            )}
                        </button>
                    )}

                    <button
                        onClick={handleMockVoice}
                        className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                    >
                        Mock Voice Input
                    </button>
                </div>
            </div>

            {error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {!isSupported && (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-100">
                    Your browser does not support the Web Speech API. Please use Chrome.
                </div>
            )}

            <div className="flex flex-col gap-2">
                <label htmlFor="transcript" className="text-sm font-medium text-gray-600 flex justify-between">
                    <span>Meeting Transcript <span className="text-gray-400 font-normal">(Auto-generated from audio)</span></span>
                    {isRecording && <span className="text-blue-500 font-normal text-xs animate-pulse">Listening...</span>}
                </label>

                <div className="relative">
                    <textarea
                        id="transcript"
                        placeholder="Click 'Start Recording' or use 'Mock Voice Input'..."
                        className={`w-full px-4 py-3 rounded-xl border transition-all outline-none resize-none h-48 bg-gray-50 focus:bg-white text-gray-800 ${isRecording ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            }`}
                        value={localText + (isRecording && interimTranscript ? `\n...${interimTranscript}` : '')}
                        onChange={handleTextChange}
                        disabled={isRecording}
                    />
                </div>
            </div>

            <button
                onClick={onGenerate}
                disabled={!transcript.trim() || isGenerating || isRecording}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating Sketches...
                    </>
                ) : (
                    <>✨ Generate 3 Sketches</>
                )}
            </button>
        </div>
    );
}
