import OpenAI from 'openai';

const getOpenAIClient = (apiKey: string) => {
    return new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });
};

export interface FoodAnalysisResponse {
    calories: number;
    protein: number;
    foodQuality: number;
    isJunkFood: boolean;
    insights: string;
}

export const analyzeFoodWithAI = async (foodDescription: string, apiKey: string): Promise<FoodAnalysisResponse> => {
    const openai = getOpenAIClient(apiKey);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Or gpt-4o-mini for better results
            messages: [
                {
                    role: "system",
                    content: `You are a nutrition expert. Analyze the food described and return a JSON object with:
                    {
                        "calories": number,
                        "protein": number (in grams),
                        "foodQuality": number (1-5 scale),
                        "isJunkFood": boolean,
                        "insights": "short 1-sentence health insight"
                    }
                    Be realistic with portion sizes. If no portion is specified, assume a standard serving.
                    Return ONLY the JSON.`
                },
                {
                    role: "user",
                    content: foodDescription
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("Empty response from AI");

        return JSON.parse(content) as FoodAnalysisResponse;
    } catch (error) {
        console.error("AI Food Analysis Error:", error);
        throw error;
    }
};
