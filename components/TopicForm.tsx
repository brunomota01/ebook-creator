
import React, { useState } from 'react';
import { LANGUAGE_OPTIONS, TONE_OPTIONS, COVER_STYLE_OPTIONS } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';

interface TopicFormProps {
  onGenerate: (topic: string, language: string, chapters: number, tone: string, coverStyle: string, isChildrensBook: boolean, additionalTopic: string) => void;
  isLoading: boolean;
}

export const TopicForm: React.FC<TopicFormProps> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [additionalTopic, setAdditionalTopic] = useState('');
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].value);
  const [chapters, setChapters] = useState<number>(7);
  const [tone, setTone] = useState(TONE_OPTIONS[0].value);
  const [coverStyle, setCoverStyle] = useState(COVER_STYLE_OPTIONS[0].value);
  const [isChildrensBook, setIsChildrensBook] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic, language, chapters, tone, coverStyle, isChildrensBook, additionalTopic);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="topic" className="block text-sm font-medium text-slate-300">
            Tópico Principal do eBook
          </label>
          <div className="flex items-center">
            <input
              id="childrens-book"
              type="checkbox"
              checked={isChildrensBook}
              onChange={(e) => setIsChildrensBook(e.target.checked)}
              className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="childrens-book" className="ml-2 block text-sm text-slate-300">
              EBook Infantil
            </label>
          </div>
        </div>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: A História da Internet"
          className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          required
        />
      </div>

      <div>
        <label htmlFor="additional-topic" className="block text-sm font-medium text-slate-300 mb-1">
          Agregar Assunto (Opcional)
        </label>
        <input
          type="text"
          id="additional-topic"
          value={additionalTopic}
          onChange={(e) => setAdditionalTopic(e.target.value)}
          placeholder="Ex: O impacto da inteligência artificial"
          className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-slate-300 mb-1">
            Idioma
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
            <label htmlFor="chapters" className="block text-sm font-medium text-slate-300 mb-1">
                Capítulos ({chapters})
            </label>
            <input
                id="chapters"
                type="range"
                min="1"
                max="20"
                value={chapters}
                onChange={(e) => setChapters(Number(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
        </div>

        <div>
            <label htmlFor="tone" className="block text-sm font-medium text-slate-300 mb-1">
                Tom de Voz
            </label>
            <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                disabled={isChildrensBook}
            >
                {TONE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>

        <div>
            <label htmlFor="coverStyle" className="block text-sm font-medium text-slate-300 mb-1">
                Estilo da Capa
            </label>
            <select
                id="coverStyle"
                value={coverStyle}
                onChange={(e) => setCoverStyle(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
                {COVER_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
      </div>
      
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-md shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          <SparklesIcon className="w-5 h-5" />
          {isLoading ? 'Gerando...' : 'Gerar eBook'}
        </button>
      </div>
    </form>
  );
};
