import { base44 } from "@/api/base44Client";

export async function autoTranslate(text, fromLang = 'es', toLang = 'en') {
  if (!text || text.trim() === '') return '';
  
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Translate the following text from ${fromLang === 'es' ? 'Spanish' : 'English'} to ${toLang === 'es' ? 'Spanish' : 'English'}. 
Only return the translated text, nothing else. Keep the same tone and style. If it's HTML, preserve the HTML tags.

Text to translate:
${text}`,
      response_json_schema: {
        type: "object",
        properties: {
          translation: { type: "string" }
        },
        required: ["translation"]
      }
    });
    return result.translation || '';
  } catch (error) {
    console.error('Translation error:', error);
    return '';
  }
}

// Auto-translate data in background before saving
export async function autoTranslateData(data, fieldsToTranslate) {
  const result = { ...data };
  
  const translationPromises = fieldsToTranslate.map(async (field) => {
    const enField = `${field}_en`;
    if (data[field] && (!data[enField] || data[enField].trim() === '')) {
      const translation = await autoTranslate(data[field]);
      return { field: enField, value: translation };
    }
    return null;
  });
  
  const translations = await Promise.all(translationPromises);
  translations.forEach(t => {
    if (t) result[t.field] = t.value;
  });
  
  return result;
}