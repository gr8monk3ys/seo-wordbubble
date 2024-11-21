'use client';

import TopicInput from '@/components/TopicInput';
import WordBubble from '@/components/WordBubble';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [bubbleData, setBubbleData] = useState<Array<{ text: string; size: number }>>([]);

  const handleAnalyze = async (topic: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze topic');
      }

      const data = await response.json();
      setBubbleData(data);
    } catch (error) {
      console.error('Error analyzing topic:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <TopicInput onAnalyze={handleAnalyze} loading={loading} />
        {bubbleData.length > 0 && (
          <div className="aspect-[4/3] w-full neumorphic">
            <WordBubble data={bubbleData} />
          </div>
        )}
      </div>
    </main>
  );
}
