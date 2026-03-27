const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/ai/tutor', (req, res) => {
  const userMessage = req.body.user_message;
  console.log('Received tutor message:', userMessage);

  if (userMessage.includes('write some python code')) {
    res.json({
      reply: "Here is some Python code I wrote for you.",
      content_type: "code_suggestion",
      code_suggestion: {
        code: "def hello_playwright():\n    print('Hello Playwright!')",
        language: "python",
        description: "A simple function"
      },
      write_to_editor: true,
      task_completed: false
    });
  } else {
    res.json({
      reply: "I am a simple mock tutor.",
      content_type: "explanation",
      write_to_editor: false,
      task_completed: false
    });
  }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`Mock LEX-AI backend listening on port ${PORT}`));
