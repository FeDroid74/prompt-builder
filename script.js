const API_URL = 'https://api.intelligence.io.solutions/api/v1/chat/completions';
const API_KEY = 'io-v2-eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvd25lciI6IjBlOTBmMWEzLTJmMzEtNDkwMy1hYTNiLWMxZjQyY2MyZDlkOSIsImV4cCI6NDg5NTc2MTE5Mn0.OPlYgcT87Mj2YI-I-UfrNsRWkKqWeSTHLbxZjaf3-bFk9svoAhX6ER5J1uSkCh9q12wGTzG2euLzdnlQ_3v1Dg';

async function generatePrompt() {
  const taskType = document.getElementById("taskType").value;
  const description = document.getElementById("description").value.trim();
  const tone = document.querySelector('input[name="tone"]:checked').value;

  const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
  const requirements = Array.from(checkboxes).map(cb => cb.value);

  if (!description) {
    alert("Пожалуйста, опишите задачу.");
    return;
  }

  // Генерация промпта
  let prompt = `Тип задачи: ${taskType}. `;
  prompt += `Описание: ${description}. `;
  prompt += `Тон общения: ${tone}. `;
  if (requirements.length > 0) {
    prompt += `Дополнительные требования: ${requirements.join(', ')}. `;
  }
  prompt += `Сформулируй ответ согласно указанным параметрам. `;
  prompt += `Пиши не больше 300 символов.`;

  // Вывод промпта в поле
  document.getElementById("output").value = prompt;

  // Подготовка запроса
  const payload = {
    model: "mistralai/Mistral-Large-Instruct-2411",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    max_completion_tokens: 300
  };

  // Очистка поля ответа
  document.getElementById("response").textContent = "⏳ Ждём ответ от модели...";

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка API: ${response.status} — ${errorText}`);
    }

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content?.trim();

    document.getElementById("response").textContent = reply || 'Пустой ответ от модели.';
  } catch (err) {
    document.getElementById("response").textContent = `Ошибка: ${err.message}`;
  }
}

function copyPrompt() {
  const response = document.getElementById("response");
  const text = response.textContent.trim();

  if (!text || text === 'Пока ничего нет.' || text.startsWith('⏳')) {
    alert("Сначала сгенерируй ответ от модели.");
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, 99999);
  document.execCommand("copy");
  document.body.removeChild(textarea);

  alert("Ответ от модели скопирован!");
}