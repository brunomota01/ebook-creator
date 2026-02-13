
import React, { useState, useCallback } from 'react';
import { TopicForm } from './components/TopicForm';
import { EbookPreview } from './components/EbookPreview';
import { LoadingSpinner } from './components/LoadingSpinner';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { generateEbook } from './services/geminiService';
import { Ebook } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadingMessages = [
    "Pesquisando o tópico...",
    "Gerando a arte da capa...",
    "Consultando fontes confiáveis...",
    "Escrevendo os capítulos...",
    "Criando a contracapa...",
    "Revisando o conteúdo...",
    "Formatando seu eBook..."
  ];

  const handleGenerateEbook = useCallback(async (topic: string, language: string, chapters: number, tone: string, coverStyle: string, isChildrensBook: boolean, additionalTopic: string) => {
    setIsLoading(true);
    setError(null);
    setEbook(null);

    let messageIndex = 0;
    setLoadingMessage(loadingMessages[messageIndex]);
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 2500);

    try {
      const result = await generateEbook(topic, language, chapters, tone, coverStyle, isChildrensBook, additionalTopic);
      const title = result.content.split('\n')[0].replace(/#/g, '').trim() || topic;
      setEbook({ ...result, title });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao gerar o eBook. Verifique sua chave de API e tente novamente.');
    } finally {
      clearInterval(interval);
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [loadingMessages]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center my-8">
          <div className="flex justify-center items-center gap-4">
            <BookOpenIcon className="w-12 h-12 text-indigo-400" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
              Criador de eBooks com IA
            </h1>
          </div>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Transforme qualquer tópico em um eBook completo, pesquisado e escrito por IA. Pronto para download em PDF.
          </p>
        </header>

        <main>
          <div className="bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700">
            <TopicForm onGenerate={handleGenerateEbook} isLoading={isLoading} />
          </div>

          {isLoading && <LoadingSpinner message={loadingMessage} />}
          {error && <div className="mt-6 text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
          
          {ebook && !isLoading && (
            <div className="mt-8">
              <EbookPreview ebook={ebook} />
            </div>
          )}
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Powered by Google Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
