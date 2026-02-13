
import { jsPDF } from 'jspdf';
import { Source } from '../types';

declare const jspdf: { jsPDF: typeof jsPDF };

export const generatePdf = (title: string, content: string, sources: Source[], coverImageUrl: string, backCoverImageUrl: string): void => {
    const doc = new jspdf.jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 50;
    const maxLineWidth = pageWidth - margin * 2;
    let y = margin;

    const addPageIfNeeded = (lineHeight: number) => {
        if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };
    
    // Page 1: Cover Image
    doc.addImage(coverImageUrl, 'PNG', 0, 0, pageWidth, pageHeight);

    // Page 2: Title and start of content
    doc.addPage();
    y = margin;
    
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    const splitTitle = doc.splitTextToSize(title, maxLineWidth);
    addPageIfNeeded(28 * splitTitle.length + 20);
    doc.text(splitTitle, pageWidth / 2, y, { align: 'center' });
    y += 28 * splitTitle.length + 20;

    // Content
    const lines = content.split('\n').slice(1); // slice(1) to skip the title line from content
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
            y += 10;
            continue;
        }
        let isHeading2 = false;

        if (trimmedLine.startsWith('## ')) {
            isHeading2 = true;
        }

        doc.setFont("helvetica", isHeading2 ? "bold" : "normal");
        doc.setFontSize(isHeading2 ? 16 : 11);
        const lineHeight = isHeading2 ? 20 : 14;
        
        const textToRender = trimmedLine.replace(/^[#]+ /g, '');
        const textLines = doc.splitTextToSize(textToRender, maxLineWidth);
        
        addPageIfNeeded(lineHeight * textLines.length + (isHeading2 ? 15 : 5));

        doc.text(textLines, margin, y);
        y += lineHeight * textLines.length + (isHeading2 ? 15 : 5);
    }

    // Sources Page
    if (sources.length > 0) {
        if (y > margin) {
            doc.addPage();
        }
        y = margin;

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Fontes", margin, y);
        y += 25;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        for (const source of sources) {
            const sourceText = `${source.title || 'Untitled'}`;
            const urlText = `(${source.uri})`;
            
            addPageIfNeeded(12 * 2 + 6);
            doc.setTextColor(40, 40, 40);
            doc.text(sourceText, margin, y);
            y += 12;

            addPageIfNeeded(12);
            doc.setTextColor(0, 0, 238);
            doc.textWithLink(urlText, margin, y, { url: source.uri });
            y += 18;
        }
    }

    // Add Footers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        const footerText = `Página ${i - 1}`;
        doc.text(footerText, pageWidth / 2, pageHeight - 20, { align: 'center' });
        
        const attributionText = `Conteúdo sintetizado por Google Gemini.`;
        doc.text(attributionText, margin, pageHeight - 20);
    }

    // Final Page: Back Cover Image
    doc.addPage();
    doc.addImage(backCoverImageUrl, 'PNG', 0, 0, pageWidth, pageHeight);

    const safeFilename = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${safeFilename}.pdf`);
};
