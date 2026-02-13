
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Source, Ebook } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const handleGeminiError = (error: any, fallbackMessage: string): Error => {
    console.error(fallbackMessage, error);
    if (error instanceof Error && error.message) {
        if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
            return new Error("Limite de solicitações da API atingido. Por favor, aguarde um minuto e tente novamente.");
        }
    }
    return new Error(fallbackMessage);
};

const generateEbookCover = async (topic: string, coverStyle: string, isChildrensBook: boolean, additionalTopic: string): Promise<string> => {
    const stylePrompt = isChildrensBook
        ? `estilo de livro infantil, colorido, lúdico e amigável`
        : `estilo ${coverStyle}`;
    
    const fullTopic = additionalTopic ? `${topic} com o tema de ${additionalTopic}` : topic;
    const prompt = `Capa de livro com ${stylePrompt} para um eBook sobre "${fullTopic}". A capa deve ser visualmente atraente, focada em um personagem ou cena central, e não deve conter nenhum texto.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                imageConfig: {
                    aspectRatio: "3:4",
                },
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }
        throw new Error("Nenhuma imagem foi gerada para a capa.");
    } catch (error) {
        throw handleGeminiError(error, "Falha ao gerar a capa do eBook.");
    }
};

const generateEbookBackCover = async (topic: string, coverStyle: string, isChildrensBook: boolean, contentSummary: string, additionalTopic: string): Promise<string> => {
    const stylePrompt = isChildrensBook
        ? `estilo de livro infantil, colorido, lúdico e amigável`
        : `estilo ${coverStyle}`;
    
    const fullTopic = additionalTopic ? `${topic} com o tema de ${additionalTopic}` : topic;
    const prompt = `Contracapa de livro com ${stylePrompt} para um eBook sobre "${fullTopic}". A imagem deve ser visualmente interessante, relacionada ao conteúdo a seguir, mas diferente da arte da capa frontal. A imagem não deve conter nenhum texto. Resumo do conteúdo: "${contentSummary}"`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                imageConfig: {
                    aspectRatio: "3:4",
                },
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }
        throw new Error("Nenhuma imagem foi gerada para a contracapa.");
    } catch (error) {
        throw handleGeminiError(error, "Falha ao gerar a contracapa do eBook.");
    }
};

const getContentPrompt = (topic: string, language: string, chapters: number, tone: string, isChildrensBook: boolean, additionalTopic: string) => {
    const additionalTopicInstruction = additionalTopic
        ? `**Assunto Adicional:** Integre e desenvolva de forma coesa o seguinte assunto ao longo do eBook: "${additionalTopic}".`
        : '';
    
    if (isChildrensBook) {
        return `
Você é um autor de livros infantis. Sua tarefa é escrever um eBook infantil sobre o tópico: "${topic}".

**Instruções:**
1.  **Idioma:** Escreva o eBook inteiramente em ${language}.
2.  **Público:** O conteúdo deve ser apropriado para crianças de 5 a 8 anos. Use uma linguagem simples, frases curtas e um tom lúdico e divertido.
3.  **Estrutura:** Organize o eBook com a seguinte estrutura, usando Markdown para formatação:
    -   Um título mágico e cativante na primeira linha (ex: # A Incrível Jornada de...).
    -   Uma seção "Era uma vez..." (Introdução).
    -   Exatamente ${chapters} capítulos curtos e envolventes.
    -   Uma seção "E viveram felizes para sempre." (Conclusão com uma lição positiva).
4.  **Qualidade:** A história deve ser criativa, com personagens interessantes e uma mensagem positiva. Evite conceitos complexos.
5.  ${additionalTopicInstruction}

Comece a escrever a história diretamente, começando pelo título.
`;
    }
    return `
Você é um autor especialista e pesquisador. Sua tarefa é escrever um eBook abrangente sobre o tópico: "${topic}".

**Instruções:**
1.  **Idioma:** Escreva o eBook inteiramente em ${language}.
2.  **Tamanho:** O conteúdo deve ser substancial e bem detalhado.
3.  **Estrutura:** Organize o eBook com a seguinte estrutura, usando Markdown para formatação:
    -   Um título claro e cativante na primeira linha (ex: # Título do eBook).
    -   Uma seção "Introdução".
    -   Exatamente ${chapters} capítulos principais, cada um com um título claro (ex: ## Capítulo 1: Título do Capítulo).
    -   Uma seção "Conclusão".
4.  **Qualidade:** O texto deve ser informativo, bem escrito, envolvente e preciso. Utilize a Pesquisa Google para garantir que as informações sejam atuais e factuais.
5.  **Tom:** Mantenha um tom ${tone === 'padrão' ? 'profissional e educacional' : tone}.
6.  ${additionalTopicInstruction}

Comece a escrever o eBook diretamente, começando pelo título. Não inclua a capa ou qualquer referência a ela no texto.
`;
}


const generateEbookText = async (topic: string, language: string, chapters: number, tone: string, isChildrensBook: boolean, additionalTopic: string): Promise<{ content: string; sources: Source[] }> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: getContentPrompt(topic, language, chapters, tone, isChildrensBook, additionalTopic),
        config: {
            tools: isChildrensBook ? [] : [{googleSearch: {}}], // Disable search for children's books
        },
    });

    const content = response.text || '';

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: Source[] = [];
    if (groundingMetadata?.groundingChunks) {
        groundingMetadata.groundingChunks.forEach((chunk: any) => {
            if (chunk.web) {
                sources.push({
                    uri: chunk.web.uri,
                    title: chunk.web.title,
                });
            }
        });
    }

    if (!content) {
        throw new Error("A API não retornou conteúdo.");
    }

    return { content, sources };
  } catch (error) {
    throw handleGeminiError(error, "Falha ao comunicar com a API do Gemini para gerar o texto.");
  }
};


export const generateEbook = async (
    topic: string, 
    language: string, 
    chapters: number, 
    tone: string, 
    coverStyle: string,
    isChildrensBook: boolean,
    additionalTopic: string
): Promise<Omit<Ebook, 'title'>> => {
    try {
        // Run API calls sequentially to avoid rate limiting
        const { content, sources } = await generateEbookText(topic, language, chapters, tone, isChildrensBook, additionalTopic);
        
        await delay(2000); // Wait 2 seconds before the next call

        const coverImageUrl = await generateEbookCover(topic, coverStyle, isChildrensBook, additionalTopic);
        
        await delay(2000); // Wait 2 seconds before the next call

        const backCoverImageUrl = await generateEbookBackCover(topic, coverStyle, isChildrensBook, content.substring(0, 500), additionalTopic);

        return { coverImageUrl, backCoverImageUrl, content, sources };
    } catch (error) {
        console.error("Error generating ebook:", error);
        throw error;
    }
};
