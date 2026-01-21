/**
 * WebSocket Server for Twilio Media Streams + OpenAI Realtime API
 *
 * This server:
 * 1. Accepts WebSocket connections from Twilio Media Streams
 * 2. Connects to OpenAI's Realtime API for voice AI
 * 3. Bridges audio between the caller and AI
 * 4. Stores call data and transcripts in Firestore
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import OpenAI from 'openai';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for the AI receptionist
const SYSTEM_PROMPT = `You are a friendly and professional AI phone receptionist for DTiQ, a company that provides video surveillance, loss prevention, and business intelligence solutions for restaurants and retail businesses.

Your role is to:
1. Greet callers warmly and professionally
2. Understand their needs (technical support, sales inquiries, billing questions, etc.)
3. Gather relevant information to help route or resolve their request
4. For technical issues: Get details about the problem, what equipment is affected, and any error messages
5. For sales inquiries: Understand their business type and needs
6. For billing: Verify basic information and understand their question

Important guidelines:
- Be concise but friendly - this is a phone call
- Ask clarifying questions when needed
- If the issue is urgent (system down, security concern), acknowledge the urgency
- Let callers know you're an AI assistant and a human can call them back if needed
- Always be helpful and patient

Common DTiQ products/services you should know about:
- Video surveillance systems (cameras, DVRs, NVRs)
- SmartAudit loss prevention software
- Drive-thru optimization
- Cloud-based video storage
- Mobile app for remote viewing`;

// Active call sessions
interface CallSession {
  callSid: string;
  from: string;
  to: string;
  startTime: Date;
  transcript: Array<{ speaker: 'Caller' | 'AI'; text: string; timestamp: Date }>;
  twilioWs: WebSocket;
  openaiWs: WebSocket | null;
  streamSid: string | null;
  firestoreDocId: string | null;
}

const activeSessions = new Map<string, CallSession>();

// Create HTTP server
const server = createServer(async (req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', activeCalls: activeSessions.size }));
    return;
  }

  // Twilio voice webhook - handles incoming calls
  if (req.url === '/api/twilio/voice' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      // Parse form data from Twilio
      const params = new URLSearchParams(body);
      const callSid = params.get('CallSid') || '';
      const from = params.get('From') || '';
      const to = params.get('To') || '';

      console.log(`[Twilio] Incoming call: ${callSid} from ${from} to ${to}`);

      // Get the WebSocket URL (this server)
      const wsUrl = process.env.TWILIO_WS_URL || `wss://${req.headers.host}`;

      // Return TwiML response
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew">Thank you for calling DTiQ. Please hold while I connect you to our AI assistant.</Say>
  <Connect>
    <Stream url="${wsUrl}">
      <Parameter name="callSid" value="${callSid}" />
      <Parameter name="from" value="${from}" />
      <Parameter name="to" value="${to}" />
    </Stream>
  </Connect>
</Response>`;

      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml);
    });
    return;
  }

  // 404 for everything else
  res.writeHead(404);
  res.end();
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', async (ws: WebSocket) => {
  console.log('[WS] New Twilio connection');

  let session: CallSession | null = null;

  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.event) {
        case 'connected':
          console.log('[Twilio] Media stream connected');
          break;

        case 'start':
          // Stream started - extract call metadata
          const { streamSid, start } = message;
          const customParameters = start?.customParameters || {};

          const callSid = customParameters.callSid || `call-${Date.now()}`;
          const from = customParameters.from || 'Unknown';
          const to = customParameters.to || 'Unknown';

          console.log(`[Twilio] Stream started: ${streamSid} for call ${callSid}`);

          // Create session
          session = {
            callSid,
            from,
            to,
            startTime: new Date(),
            transcript: [],
            twilioWs: ws,
            openaiWs: null,
            streamSid,
            firestoreDocId: null,
          };

          activeSessions.set(callSid, session);

          // Create Firestore document for this call
          const callDoc = await db.collection('calls').add({
            callSid,
            phoneNumber: from,
            callerName: null,
            status: 'in_progress',
            isHandled: false,
            startTime: admin.firestore.FieldValue.serverTimestamp(),
            endTime: null,
            durationSeconds: 0,
            aiSummary: '',
            transcript: [],
            intent: 'Unknown',
            isUrgent: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          session.firestoreDocId = callDoc.id;
          console.log(`[Firestore] Created call document: ${callDoc.id}`);

          // Connect to OpenAI Realtime API
          await connectToOpenAI(session);
          break;

        case 'media':
          // Audio data from caller
          if (session?.openaiWs && session.openaiWs.readyState === WebSocket.OPEN) {
            // Forward audio to OpenAI
            const audioData = message.media.payload;
            session.openaiWs.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: audioData,
            }));
          }
          break;

        case 'stop':
          console.log('[Twilio] Stream stopped');
          if (session) {
            await endCallSession(session);
          }
          break;

        default:
          console.log(`[Twilio] Unknown event: ${message.event}`);
      }
    } catch (error) {
      console.error('[WS] Error processing message:', error);
    }
  });

  ws.on('close', async () => {
    console.log('[WS] Twilio connection closed');
    if (session) {
      await endCallSession(session);
    }
  });

  ws.on('error', (error) => {
    console.error('[WS] Twilio WebSocket error:', error);
  });
});

async function connectToOpenAI(session: CallSession) {
  try {
    // Connect to OpenAI Realtime API via WebSocket
    const openaiWs = new WebSocket(
      'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview',
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      }
    );

    session.openaiWs = openaiWs;

    openaiWs.on('open', () => {
      console.log('[OpenAI] Connected to Realtime API');

      // Configure the session
      openaiWs.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: SYSTEM_PROMPT,
          voice: 'alloy',
          input_audio_format: 'g711_ulaw',
          output_audio_format: 'g711_ulaw',
          input_audio_transcription: {
            model: 'whisper-1',
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
        },
      }));

      // Send initial greeting
      openaiWs.send(JSON.stringify({
        type: 'response.create',
        response: {
          modalities: ['text', 'audio'],
          instructions: 'Greet the caller warmly. Introduce yourself as DTiQ\'s AI assistant and ask how you can help them today.',
        },
      }));
    });

    openaiWs.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        // Log all OpenAI events for debugging
        if (!['response.audio.delta', 'input_audio_buffer.speech_started', 'input_audio_buffer.speech_stopped'].includes(message.type)) {
          console.log(`[OpenAI] Event: ${message.type}`, message.type === 'response.done' ? JSON.stringify(message.response?.status_details || message) : '');
        }

        switch (message.type) {
          case 'session.created':
            console.log('[OpenAI] Session created successfully');
            break;

          case 'session.updated':
            console.log('[OpenAI] Session updated');
            break;

          case 'error':
            console.error('[OpenAI] Error:', JSON.stringify(message.error));
            break;

          case 'response.audio.delta':
            // Send AI audio back to Twilio
            if (session.twilioWs.readyState === WebSocket.OPEN && session.streamSid) {
              session.twilioWs.send(JSON.stringify({
                event: 'media',
                streamSid: session.streamSid,
                media: {
                  payload: message.delta,
                },
              }));
            }
            break;

          case 'response.audio_transcript.done':
            // AI finished speaking - save transcript
            if (message.transcript) {
              session.transcript.push({
                speaker: 'AI',
                text: message.transcript,
                timestamp: new Date(),
              });
              await updateTranscript(session);
            }
            break;

          case 'conversation.item.input_audio_transcription.completed':
            // Caller speech transcribed
            if (message.transcript) {
              session.transcript.push({
                speaker: 'Caller',
                text: message.transcript,
                timestamp: new Date(),
              });
              await updateTranscript(session);

              // Check for urgency keywords
              const urgentKeywords = ['emergency', 'urgent', 'down', 'not working', 'critical', 'broken'];
              const isUrgent = urgentKeywords.some(kw =>
                message.transcript.toLowerCase().includes(kw)
              );
              if (isUrgent && session.firestoreDocId) {
                await db.collection('calls').doc(session.firestoreDocId).update({
                  isUrgent: true,
                  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
              }
            }
            break;

          case 'error':
            console.error('[OpenAI] Error:', message.error);
            break;
        }
      } catch (error) {
        console.error('[OpenAI] Error processing message:', error);
      }
    });

    openaiWs.on('close', () => {
      console.log('[OpenAI] Connection closed');
    });

    openaiWs.on('error', (error) => {
      console.error('[OpenAI] WebSocket error:', error);
    });

  } catch (error) {
    console.error('[OpenAI] Failed to connect:', error);
  }
}

async function updateTranscript(session: CallSession) {
  if (!session.firestoreDocId) return;

  try {
    await db.collection('calls').doc(session.firestoreDocId).update({
      transcript: session.transcript.map(t => ({
        speaker: t.speaker,
        text: t.text,
        timestamp: t.timestamp.toISOString(),
      })),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('[Firestore] Error updating transcript:', error);
  }
}

async function endCallSession(session: CallSession) {
  console.log(`[Session] Ending call ${session.callSid}`);

  // Close OpenAI connection
  if (session.openaiWs) {
    session.openaiWs.close();
  }

  // Calculate duration
  const endTime = new Date();
  const durationSeconds = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

  // Generate summary using OpenAI (non-realtime)
  let aiSummary = '';
  let intent = 'General Inquiry';

  if (session.transcript.length > 0) {
    try {
      const transcriptText = session.transcript
        .map(t => `${t.speaker}: ${t.text}`)
        .join('\n');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze this call transcript and provide:
1. A brief 2-3 sentence summary of the call
2. The primary intent (Technical Support, Sales Inquiry, Billing Question, General Inquiry, Complaint, or Other)

Respond in JSON format: {"summary": "...", "intent": "..."}`
          },
          {
            role: 'user',
            content: transcriptText
          }
        ],
        temperature: 0.3,
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      aiSummary = result.summary || '';
      intent = result.intent || 'General Inquiry';
    } catch (error) {
      console.error('[OpenAI] Error generating summary:', error);
      aiSummary = 'Call ended. Summary generation failed.';
    }
  }

  // Update Firestore with final call data
  if (session.firestoreDocId) {
    try {
      await db.collection('calls').doc(session.firestoreDocId).update({
        status: 'completed',
        endTime: admin.firestore.FieldValue.serverTimestamp(),
        durationSeconds,
        aiSummary,
        intent,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`[Firestore] Updated call ${session.firestoreDocId} as completed`);
    } catch (error) {
      console.error('[Firestore] Error updating call:', error);
    }
  }

  // Remove from active sessions
  activeSessions.delete(session.callSid);
}

// Start server
const PORT = parseInt(process.env.WS_PORT || '3001', 10);

server.listen(PORT, () => {
  console.log(`[Server] WebSocket server running on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] Shutting down...');
  wss.clients.forEach((client) => {
    client.close();
  });
  server.close(() => {
    console.log('[Server] Shut down complete');
    process.exit(0);
  });
});
