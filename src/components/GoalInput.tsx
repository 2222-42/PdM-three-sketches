'use client';

export default function GoalInput({
    goal,
    setGoal,
    transcript,
    setTranscript,
    onGenerate,
    isGenerating,
}: {
    goal: string;
    setGoal: (value: string) => void;
    transcript: string;
    setTranscript: (value: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">🎯</span>
                Product Goal
            </h2>

            <div className="flex flex-col gap-2">
                <label htmlFor="goal" className="text-sm font-medium text-gray-600">
                    What are we building today? <span className="text-red-500">*</span>
                </label>
                <input
                    id="goal"
                    type="text"
                    placeholder="e.g. Mobile dashboard for inventory management app"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    maxLength={200}
                />
                <div className="text-xs text-gray-400 text-right">
                    {goal.length}/200
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
                <label htmlFor="transcript" className="text-sm font-medium text-gray-600">
                    Meeting Transcript (Optional)
                </label>
                <textarea
                    id="transcript"
                    placeholder="Paste meeting discussion here, or transcribe via voice later."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none h-32"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                />
            </div>

            <button
                onClick={onGenerate}
                disabled={!goal.trim() || isGenerating}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
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
