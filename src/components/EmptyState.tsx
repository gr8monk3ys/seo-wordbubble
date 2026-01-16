interface EmptyStateProps {
  onTryExample: (topic: string) => void
}

const EXAMPLE_TOPICS = [
  'Digital Marketing',
  'Sustainable Fashion',
  'Remote Work Tools',
  'Healthy Recipes',
]

export default function EmptyState({ onTryExample }: EmptyStateProps) {
  return (
    <div className="neumorphic p-8 text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--primary)]">
          Discover SEO Keywords Visually
        </h2>
        <p className="text-[var(--greyDark)] max-w-md mx-auto">
          Enter any topic above to generate a word bubble visualization of the most relevant SEO
          keywords, sized by their importance.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-[var(--greyDark)]">Try an example:</p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {EXAMPLE_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => onTryExample(topic)}
              className="px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium text-[var(--primary)]
                         bg-[var(--greyLight-1)] transition-all duration-200
                         shadow-[0.3rem_0.3rem_0.6rem_var(--greyLight-2),-0.2rem_-0.2rem_0.5rem_var(--white)]
                         hover:shadow-[inset_0.2rem_0.2rem_0.5rem_var(--greyLight-2),inset_-0.2rem_-0.2rem_0.5rem_var(--white)]
                         active:shadow-[inset_0.2rem_0.2rem_0.5rem_var(--greyLight-2),inset_-0.2rem_-0.2rem_0.5rem_var(--white)]"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--greyLight-2)]">
        <p className="text-xs text-[var(--greyLight-3)]">
          Powered by AI analysis for accurate keyword relevance
        </p>
      </div>
    </div>
  )
}
