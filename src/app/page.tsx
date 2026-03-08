'use client';

import { useState } from 'react';
import TranscriptArea from '@/components/TranscriptArea';
import SketchesGrid from '@/components/SketchesGrid';

interface StructuredData {
  problems: string[];
  requirements: string[];
  constraints: string[];
  workflow: string;
  progress: string;
  ideas?: {
    title: string;
    description: string;
  }[];
}

interface Sketches {
  A: string;
  B: string;
  C: string;
}

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [structuredData, setStructuredData] = useState<StructuredData | null>(null);
  const [sketches, setSketches] = useState<Sketches | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState<boolean>(true);

  const handleGenerate = async () => {
    if (!transcript.trim()) return;

    setIsGenerating(true);
    setError(null);
    setStructuredData(null);
    setSketches(null);

    try {
      // Step 1: Generate Structure
      const structureRes = await fetch('/api/generate-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!structureRes.ok) throw new Error('Failed to generate structure');
      const generatedStructure = await structureRes.json();
      setStructuredData(generatedStructure);

      // Step 2: Generate Sketches (using the generated structure)
      const sketchesRes = await fetch('/api/generate-sketches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structuredData: generatedStructure }),
      });

      if (!sketchesRes.ok) throw new Error('Failed to generate sketches');
      const generatedSketches = await sketchesRes.json();
      setSketches({
        A: generatedSketches.sketchA,
        B: generatedSketches.sketchB,
        C: generatedSketches.sketchC,
      });

      // Automatically hide left panel to focus on sketches ("Peek Component" feature)
      setShowLeftPanel(false);

    } catch (err) {
      console.error(err);
      setError('An error occurred during generation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              3S
            </div>
            <h1 className="text-xl font-bold text-gray-800">
              3 Sketches <span className="text-sm font-normal text-gray-400 ml-2">Hackathon MVP</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column Toggle Button (Peek Component) */}
          {!showLeftPanel && (
            <div className="flex flex-col gap-4 lg:w-12 shrink-0 items-center pt-2">
              <button
                onClick={() => setShowLeftPanel(true)}
                className="p-3 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors"
                title="Show Context"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              </button>
              <div className="writing-vertical text-xs text-gray-400 font-medium tracking-widest whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                CONTEXT / TRANSCRIPT
              </div>
            </div>
          )}

          {/* Left Column (Input & Context) */}
          {showLeftPanel && (
            <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0 relative">
              {sketches && (
                <button
                  onClick={() => setShowLeftPanel(false)}
                  className="absolute -right-4 top-2 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 text-gray-500 z-10 transition-colors"
                  title="Hide Context"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                </button>
              )}
              <TranscriptArea
                transcript={transcript}
                setTranscript={setTranscript}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />

              {/* Structured Data Preview (Optional/Debug View) */}
              {(structuredData || isGenerating) && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    AI Understanding
                  </h3>

                  {!structuredData && isGenerating ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                    </div>
                  ) : structuredData && (
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Identified Problems:</p>
                        <ul className="list-disc pl-4 text-gray-600 space-y-1">
                          {structuredData.problems.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Key Requirements:</p>
                        <ul className="list-disc pl-4 text-gray-600 space-y-1">
                          {structuredData.requirements.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Proposed Workflow:</p>
                        <p className="text-gray-600 bg-white p-3 rounded border border-gray-200 text-xs">
                          {structuredData.workflow}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right Column (Sketches/Previews) */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Generated UI Sketches
              </h2>
            </div>

            <SketchesGrid sketches={sketches} isGenerating={isGenerating} ideas={structuredData?.ideas} />
          </div>

        </div>
      </main>
    </div>
  );
}
