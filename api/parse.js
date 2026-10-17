import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const CATEGORIES = ['school', 'bill', 'health', 'event', 'shopping', 'home', 'kids'];

const TaskSchema = z.object({
  title: z.string(),
  date: z.string().nullable(),
  time: z.string().nullable(),
  category: z.enum(CATEGORIES).catch('home'),
  owner: z.string().nullable(),
  planner: z.string().nullable(),
  shared: z.boolean().default(false)
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch (e) {
    return res.status(400).json({ error: 'Bad JSON' });
  }

  const text = String(body.text || '').trim();
  if (text.length < 8) {
    return res.status(400).json({ error: 'text too short' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(503).json({ error: 'GEMINI_API_KEY not configured', fallback: true });
  }

  const members = Array.isArray(body.members) && body.members.length
    ? body.members.map(m => ({ id: String(m.id || ''), name: String(m.name || ''), role: String(m.role || ''), kind: String(m.kind || '') }))
    : [];
  const today = new Date().toISOString().slice(0, 10);

  const memberList = members.length
    ? members.map(m => `- ${m.id}: ${m.name} (${m.role || m.kind || 'th\u00e0nh vi\u00ean'})`).join('\n')
    : '- me: M\u1eb9\n- bo: B\u1ed1\n- bin: B\u1ea1n l\u1edbn\n- su: B\u1ea1n nh\u1ecf';

  const prompt = `B\u1ea1n l\u00e0 tr\u1ee3 l\u00fd gia \u0111\u00ecnh c\u1ee7a \u1ee9ng d\u1ee5ng HomeFlow (Vi\u1ec7t Nam). Ng\u01b0\u1eddi d\u00f9ng nh\u1eafn m\u1ed9t \u0111o\u1ea1n m\u00f4 t\u1ea3 vi\u1ec7c nh\u00e0 b\u1eb1ng ti\u1ebfng Vi\u1ec7t t\u1ef1 nhi\u00ean, c\u00f3 th\u1ec3 g\u1ed3m nhi\u1ec1u vi\u1ec7c. H\u00e3y t\u00e1ch th\u00e0nh t\u1eebng vi\u1ec7c ri\u00eang bi\u1ec7t.

QUY T\u1eaeC:
- title: t\u00ean vi\u1ec7c ng\u1eafn g\u1ecdn, \u0111\u1ee7 ngh\u0129a, ti\u1ebfng Vi\u1ec7t c\u00f3 d\u1ea5u.
- date: suy ra ng\u00e0y t\u1eeb ng\u1eef c\u1ea3nh (h\u00f4m nay, mai, th\u1ee9 X, cu\u1ed1i tu\u1ea7n, ng\u00e0y c\u1ee5 th\u1ec3). H\u00f4m nay l\u00e0 ${today}. \u0110\u1ecbnh d\u1ea1ng YYYY-MM-DD. Kh\u00f4ng ch\u1eafc ch\u1eafn th\u00ec \u0111\u1ec3 null.
- time: gi\u1edd n\u1ebfu c\u00f3 (HH:MM, 24h), kh\u00f4ng c\u00f3 th\u00ec null.
- category: m\u1ed9t trong ${CATEGORIES.join('|')}.
- owner: ng\u01b0\u1eddi th\u1ef1c hi\u1ec7n \u2014 d\u00f9ng \u0110\u00daNG id trong danh s\u00e1ch th\u00e0nh vi\u00ean. Kh\u00f4ng n\u00f3i r\u00f5 th\u00ec "me".
- planner: ng\u01b0\u1eddi l\u1eadp k\u1ebf ho\u1ea1ch/nh\u1edb vi\u1ec7c \u2014 m\u1eb7c \u0111\u1ecbnh "me".
- shared: true n\u1ebfu c\u1ea3 nh\u00e0 c\u00f9ng l\u00e0m, ng\u01b0\u1ee3c l\u1ea1i false.

DANH S\u00c1CH TH\u00c0NH VI\u00caN:
${memberList}

Ch\u1ec9 tr\u1ea3 v\u1ec1 JSON \u0111\u00fang schema, kh\u00f4ng th\u00eam l\u1eddi gi\u1ea3i th\u00edch.

\u0110O\u1ea0N NH\u1eaeN:
${text}`;

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash', { apiKey: key }),
      schema: z.object({ tasks: z.array(TaskSchema) }),
      prompt
    });
    const tasks = (object.tasks || []).filter(t => String(t.title || '').trim());
    if (!tasks.length) {
      return res.status(422).json({ error: 'no tasks parsed', fallback: true });
    }
    return res.status(200).json({ tasks, source: 'llm' });
  } catch (e) {
    console.error('LLM error:', e && e.message ? e.message : e);
    return res.status(502).json({ error: 'llm_error', fallback: true, detail: String(e && e.message ? e.message : e).slice(0, 400) });
  }
}