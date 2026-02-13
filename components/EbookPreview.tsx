
import React, { useState } from 'react';
import { Ebook } from '../types';
import { generatePdf } from '../services/pdfService';
import { DownloadIcon } from './icons/DownloadIcon';

interface EbookPreviewProps {
  ebook: Ebook;
}

const SourceList: React.FC<{ sources: Ebook['sources'] }> = ({ sources }) => {
    if (sources.length === 0) return null;

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Fontes</h3>
            <ul className="space-y-2">
                {sources.map((source, index) => (
                    <li key={index} className="text-sm">
                        <a
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 hover:underline break-all"
                            title={source.title}
                        >
                            {`[${index + 1}] ${source.title || source.uri}`}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const EbookPreview: React.FC<EbookPreviewProps> = ({ ebook }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      generatePdf(ebook.title, ebook.content, ebook.sources, ebook.coverImageUrl, ebook.backCoverImageUrl);
    } catch (e) {
      console.error("Failed to generate PDF:", e);
      alert("Falha ao gerar o PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const previewContent = ebook.content.substring(0, 500) + '...';

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <img 
                    src={ebook.coverImageUrl} 
                    alt={`Capa do eBook: ${ebook.title}`} 
                    className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
            </div>
            <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                    {ebook.title}
                </h2>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 max-h-48 overflow-y-auto p-2 rounded-md bg-slate-900/50 border border-slate-700">
                    <p>{previewContent}</p>
                </div>
                <div className="mt-4 text-center md:text-left">
                    <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="inline-flex items-center justify-center gap-2 bg-cyan-600 text-white font-semibold py-2.5 px-6 rounded-md shadow-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                    <DownloadIcon className="w-5 h-5" />
                    {isDownloading ? 'Gerando PDF...' : 'Baixar PDF'}
                    </button>
                </div>
            </div>
        </div>
      
      <SourceList sources={ebook.sources} />
    </div>
  );
};
