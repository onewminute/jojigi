export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API Key가 설정되지 않았습니다." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const prompt = `너는 세상에서 가장 창의적이고 무해한 장난을 설계하는 '조지기 마스터'야. 
  20대 사용자가 친구나 직장 동료에게 할 수 있는 '킹받지만 웃음 터지는' 장난을 하나 추천해줘. 
  준비물, 실행 단계, 그리고 걸렸을 때의 변명까지 세트로 알려줘. 
  말투는 장난끼 넘치고 친근하게 해줘.`;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "조지기 마스터가 잠시 자리를 비웠어. 다시 시도해봐!";

    return new Response(JSON.stringify({ recommendation: generatedText }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
