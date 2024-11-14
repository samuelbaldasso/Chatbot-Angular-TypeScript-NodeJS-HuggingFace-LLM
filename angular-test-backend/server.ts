import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const hf = new HfInference(process.env.API_TOKEN);

const app = express();
const PORT = 3001;

app.use(bodyParser.json());

app.use(cors());

app.post('/generate', async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;

  try {
    let out = "";

    const stream = hf.chatCompletionStream({
      model: "Qwen/Qwen2.5-Coder-32B-Instruct",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500
    });
    
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const newContent = chunk.choices[0].delta.content;
        out += newContent;
      }  
    }
    res.json({ response: out });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Error generating response' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});