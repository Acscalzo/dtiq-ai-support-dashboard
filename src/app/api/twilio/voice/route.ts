import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

// Twilio webhook for incoming calls
// This endpoint returns TwiML to start a media stream to our WebSocket server
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // Extract call information from Twilio's request
  const callSid = formData.get('CallSid') as string;
  const from = formData.get('From') as string;
  const to = formData.get('To') as string;
  const callStatus = formData.get('CallStatus') as string;

  console.log(`[Twilio] Incoming call: ${callSid} from ${from} to ${to} (${callStatus})`);

  // Get the WebSocket URL from environment or construct it
  // In production, this should be your deployed WebSocket server URL
  const wsUrl = process.env.TWILIO_WS_URL || 'wss://your-domain.com/api/twilio/stream';

  // Create TwiML response
  const response = new VoiceResponse();

  // Start bidirectional media stream to our WebSocket server
  const connect = response.connect();
  const stream = connect.stream({
    url: wsUrl,
    // Send both inbound and outbound audio
  });

  // Pass call metadata to the WebSocket via custom parameters
  stream.parameter({ name: 'callSid', value: callSid });
  stream.parameter({ name: 'from', value: from });
  stream.parameter({ name: 'to', value: to });

  // Return TwiML response
  return new NextResponse(response.toString(), {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

// Handle call status webhooks (optional - for tracking call state)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Twilio voice webhook endpoint'
  });
}
