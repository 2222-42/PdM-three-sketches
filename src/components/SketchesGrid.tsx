const RenderIframe = ({ code, title, description, type }: { code: string; title: string; description?: string; type: string }) => (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[600px]">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex flex-col justify-center gap-1 min-h-[70px]">
            <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded shrink-0">
                    Option {type}
                </span>
                <span className="font-medium text-gray-800 text-sm truncate" title={title}>{title}</span>
            </div>
            {description && (
                <div className="text-xs text-gray-500 truncate" title={description}>
                    {description}
                </div>
            )}
        </div>
        <div className="flex-1 overflow-hidden bg-white relative">
            {/* Using srcdoc for safe execution of AI generated code */}
            <iframe
                srcDoc={code}
                className="w-full h-full border-none absolute inset-0"
                sandbox="allow-scripts"
                title={`Sketch ${type}`}
            />
        </div>
    </div>
);

export default function SketchesGrid({
    sketches,
    isGenerating,
    ideas,
}: {
    sketches: { A: string; B: string; C: string } | null;
    isGenerating: boolean;
    ideas?: { title: string; description: string }[];
}) {
    if (isGenerating) {
        return (
            <div className="flex-1 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-medium text-gray-700">AI is sketching 3 variations...</h3>
                <p className="text-gray-400 mt-2 text-center max-w-md">
                    Analyzing meeting transcript and goal to generate structural JSON, then building React Taildwind components.
                </p>
            </div>
        );
    }

    if (!sketches) {
        return (
            <div className="flex-1 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🎨</span>
                </div>
                <h3 className="text-xl font-medium text-gray-700">Ready to Sketch</h3>
                <p className="text-gray-400 mt-2 max-w-sm">
                    Enter your goal and meeting notes on the left, then hit Generate to see 3 distinct UI variations.
                </p>
            </div>
        );
    }

    const getIdea = (index: number, fallbackTitle: string) => {
        if (ideas && ideas[index]) {
            return {
                title: ideas[index].title,
                description: ideas[index].description
            };
        }
        return { title: fallbackTitle, description: undefined };
    };

    const ideaA = getIdea(0, "Simplest Solution");
    const ideaB = getIdea(1, "Data-heavy Dashboard");
    const ideaC = getIdea(2, "Modern Mobile Experience");

    return (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <RenderIframe code={sketches.A} type="A" title={ideaA.title} description={ideaA.description} />
            <RenderIframe code={sketches.B} type="B" title={ideaB.title} description={ideaB.description} />
            <RenderIframe code={sketches.C} type="C" title={ideaC.title} description={ideaC.description} />
        </div>
    );
}
