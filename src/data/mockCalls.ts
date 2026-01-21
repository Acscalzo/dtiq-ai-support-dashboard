/**
 * Mock call data for the Call Management feature
 * Realistic scenarios for DTIQ (video surveillance company)
 */

export type CallStatus = 'in_progress' | 'completed' | 'failed' | 'no_answer';

export interface TranscriptEntry {
  speaker: 'Caller' | 'AI';
  text: string;
  timestamp?: string;
}

export interface Call {
  id: string;
  phoneNumber: string;
  callerName: string | null;
  status: CallStatus;
  isHandled: boolean;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  aiSummary: string;
  transcript: TranscriptEntry[];
  intent: string;
  isUrgent?: boolean;
}

// Helper to create dates relative to now
const hoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

const minutesAgo = (minutes: number): string => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date.toISOString();
};

const daysAgo = (days: number, hours = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

export const mockCalls: Call[] = [
  {
    id: 'call-001',
    phoneNumber: '5551234567',
    callerName: 'Michael Torres',
    status: 'in_progress',
    isHandled: false,
    startTime: minutesAgo(3),
    durationSeconds: 180,
    aiSummary: 'Customer is reporting that their outdoor camera stopped recording approximately two hours ago. Currently walking them through troubleshooting steps to check power connection and network status...',
    transcript: [
      { speaker: 'AI', text: 'Thank you for calling DTIQ technical support. My name is DTIQ Assistant. How can I help you today?' },
      { speaker: 'Caller', text: 'Hi, yes, I have a camera that stopped recording. It was working fine this morning but now nothing.' },
      { speaker: 'AI', text: "I understand that can be frustrating. I'd be happy to help you troubleshoot this issue. Can you tell me which camera is having the problem? Is it an indoor or outdoor camera?" },
      { speaker: 'Caller', text: "It's the outdoor one in the back parking lot. Model DT-4500 I think." },
      { speaker: 'AI', text: 'Thank you. For the DT-4500 outdoor camera, let me walk you through a few quick checks. First, can you verify if the LED light on the camera is on? It should be a small green or amber light.' },
      { speaker: 'Caller', text: "Hold on, let me check... I can see from the window, looks like there's no light on at all." },
      { speaker: 'AI', text: 'That indicates the camera may have lost power. This could be due to a tripped breaker, a loose power connection, or possibly weather-related damage to the power supply. Do you have safe access to check the power source for this camera?' },
    ],
    intent: 'Technical Support - Camera Not Recording',
  },
  {
    id: 'call-002',
    phoneNumber: '5559876543',
    callerName: 'Sarah Johnson',
    status: 'completed',
    isHandled: true,
    startTime: hoursAgo(2),
    endTime: hoursAgo(2),
    durationSeconds: 425,
    aiSummary: 'Customer inquired about adding 4 additional cameras to their existing 8-camera system for their retail store. Provided pricing information for DT-2000 indoor cameras and scheduled a callback from sales team for tomorrow at 10 AM.',
    transcript: [
      { speaker: 'AI', text: 'Thank you for calling DTIQ. My name is DTIQ Assistant. How can I help you today?' },
      { speaker: 'Caller', text: "Hi, I'm interested in getting some more cameras. We have a system from you guys already." },
      { speaker: 'AI', text: "That's great to hear you're looking to expand your system. I can definitely help with that. Can you tell me a bit about your current setup and what areas you're looking to add coverage to?" },
      { speaker: 'Caller', text: 'We have 8 cameras right now at our retail store, but we recently expanded and need to cover the new section. Probably need 4 more cameras.' },
      { speaker: 'AI', text: 'Perfect. For retail environments, our DT-2000 indoor cameras are very popular. They offer 4K resolution with excellent low-light performance and integrate seamlessly with your existing DVR. Would these be for general floor coverage or do you need any specialized features like facial recognition or license plate reading?' },
      { speaker: 'Caller', text: 'Just general floor coverage for now. What would 4 of those cost?' },
      { speaker: 'AI', text: 'The DT-2000 cameras are $299 each, which would be $1,196 for four units. This includes our standard 2-year warranty. Installation is available for an additional $150 per camera. Would you like me to have one of our sales representatives give you a call to discuss the options in more detail and potentially set up a site visit?' },
      { speaker: 'Caller', text: 'Yes, that would be great. Can they call tomorrow morning?' },
      { speaker: 'AI', text: "Absolutely. I have you scheduled for a callback tomorrow at 10 AM. You'll hear from one of our sales team members who can provide a detailed quote and answer any questions about installation. Is there anything else I can help you with today?" },
      { speaker: 'Caller', text: "No, that's all. Thank you!" },
      { speaker: 'AI', text: "You're welcome, Sarah. Thank you for choosing DTIQ. Have a great day!" },
    ],
    intent: 'Sales Inquiry - System Expansion',
  },
  {
    id: 'call-003',
    phoneNumber: '5552468135',
    callerName: 'Robert Chen',
    status: 'completed',
    isHandled: false,
    startTime: hoursAgo(4),
    endTime: hoursAgo(4),
    durationSeconds: 312,
    aiSummary: 'URGENT: Customer reporting DVR storage full error. System has stopped recording across all 12 cameras. Customer has critical security needs for their warehouse. Attempted remote troubleshooting but requires on-site technician visit. Customer requests immediate callback from technical team.',
    transcript: [
      { speaker: 'AI', text: 'Thank you for calling DTIQ technical support. My name is DTIQ Assistant. How can I help you today?' },
      { speaker: 'Caller', text: 'Hi, this is urgent. Our DVR is showing a storage full error and none of our cameras are recording!' },
      { speaker: 'AI', text: 'I understand this is urgent and I want to help you resolve this as quickly as possible. A storage full error typically means your DVR hard drive has reached capacity. Can you tell me how long ago this started and how many cameras are connected to your system?' },
      { speaker: 'Caller', text: 'I noticed it about an hour ago when I went to check yesterday\'s footage. We have 12 cameras - this is a 50,000 square foot warehouse and we need everything recorded!' },
      { speaker: 'AI', text: "I completely understand the urgency for a warehouse operation. Let me help you with some immediate steps. First, do you have access to your DVR interface? We may be able to free up space by adjusting your retention settings or identifying any corrupted files that are taking up excessive space." },
      { speaker: 'Caller', text: 'Yes, I\'m looking at it now. It says 0 GB free and the recording status shows "Stopped" for everything.' },
      { speaker: 'AI', text: 'Let me guide you through accessing the storage management. Go to Settings, then Storage, then Recording Settings. Do you see an option for "Overwrite Oldest Recordings"?' },
      { speaker: 'Caller', text: "I see it but it's grayed out. Something's not right here." },
      { speaker: 'AI', text: "That's unusual behavior. This may indicate a firmware issue or a potential hard drive problem. Given the critical nature of your security needs, I strongly recommend having one of our technicians come on-site to diagnose this properly. I can flag this as urgent and have our technical team call you back within the next 30 minutes to schedule an emergency visit. Would that work for you?" },
      { speaker: 'Caller', text: 'Yes, please do that. This needs to be fixed today if possible.' },
      { speaker: 'AI', text: "I've flagged this as urgent priority. You should receive a callback within 30 minutes from our senior technical team. They'll be able to discuss emergency on-site service options. In the meantime, your system will continue to display live feeds even without recording. Is there anything else I can help you with right now?" },
      { speaker: 'Caller', text: 'No, just please make sure they call soon.' },
      { speaker: 'AI', text: "Absolutely, Robert. I've marked this as urgent priority. You'll hear from us very shortly. Thank you for calling DTIQ." },
    ],
    intent: 'Technical Support - DVR Storage Full (Urgent)',
    isUrgent: true,
  },
  {
    id: 'call-004',
    phoneNumber: '5557891234',
    callerName: null,
    status: 'no_answer',
    isHandled: true,
    startTime: hoursAgo(5),
    durationSeconds: 0,
    aiSummary: 'Incoming call - no answer after 30 seconds. Voicemail was not left.',
    transcript: [],
    intent: 'Unknown - No Answer',
  },
  {
    id: 'call-005',
    phoneNumber: '5553216549',
    callerName: 'Patricia Williams',
    status: 'completed',
    isHandled: true,
    startTime: hoursAgo(6),
    endTime: hoursAgo(6),
    durationSeconds: 198,
    aiSummary: 'Customer called about a billing discrepancy on their most recent invoice. They were charged $89.99 instead of the expected $79.99. Confirmed this was due to the annual price adjustment communicated in November. Customer understood and was satisfied with the explanation.',
    transcript: [
      { speaker: 'AI', text: 'Thank you for calling DTIQ. My name is DTIQ Assistant. How can I help you today?' },
      { speaker: 'Caller', text: "Hi, I'm calling about my bill. It seems higher than usual this month." },
      { speaker: 'AI', text: "I'd be happy to help you review your billing. Can you tell me the amount you were charged and what you were expecting?" },
      { speaker: 'Caller', text: "I was charged $89.99 but I've been paying $79.99 for the past two years." },
      { speaker: 'AI', text: 'Thank you for that information. I can see your account here. The change from $79.99 to $89.99 is due to our annual service rate adjustment that went into effect this billing cycle. A notice about this adjustment was sent to all customers in November. The increase helps us continue providing 24/7 monitoring services and system updates.' },
      { speaker: 'Caller', text: 'Oh, I must have missed that notice. Is this the new regular price then?' },
      { speaker: 'AI', text: "Yes, $89.99 is your new monthly rate going forward. I apologize if the communication wasn't clear. Is there anything else about your billing I can help clarify?" },
      { speaker: 'Caller', text: "No, that makes sense. I just wanted to make sure it wasn't a mistake. Thank you for explaining." },
      { speaker: 'AI', text: "You're welcome, Patricia. Thank you for being a valued DTIQ customer. Have a great day!" },
    ],
    intent: 'Billing Inquiry',
  },
  {
    id: 'call-006',
    phoneNumber: '5558529637',
    callerName: 'David Martinez',
    status: 'completed',
    isHandled: false,
    startTime: daysAgo(1, 3),
    endTime: daysAgo(1, 3),
    durationSeconds: 267,
    aiSummary: 'Customer reports intermittent camera feed for camera #3 in their office building. Feed cuts out every few hours for 5-10 minutes. Recommended checking ethernet cable connections and provided instructions. Customer will try troubleshooting and call back if issue persists.',
    transcript: [
      { speaker: 'AI', text: 'Thank you for calling DTIQ technical support. My name is DTIQ Assistant. How can I help you today?' },
      { speaker: 'Caller', text: 'Yeah, I have a camera that keeps cutting out. Not completely dead, just goes blank every few hours.' },
      { speaker: 'AI', text: "I understand - intermittent issues can be particularly frustrating. When the camera goes blank, does it come back on its own, and approximately how long does the outage last?" },
      { speaker: 'Caller', text: "It comes back after maybe 5-10 minutes each time. It's camera 3 in our system - the one in the main hallway." },
      { speaker: 'AI', text: 'Thank you for those details. Intermittent outages like this are often related to network connectivity rather than the camera itself. Is this camera connected via ethernet cable or WiFi?' },
      { speaker: 'Caller', text: 'Ethernet. We ran cables when we set everything up.' },
      { speaker: 'AI', text: 'Perfect. The most common cause of intermittent ethernet issues is a loose or damaged cable connection. I recommend checking both ends of the ethernet cable - where it connects to the camera and where it connects to your router or switch. Look for any visible damage to the cable and make sure the connections are firmly seated with an audible click.' },
      { speaker: 'Caller', text: 'Okay, I can check that. Anything else it might be?' },
      { speaker: 'AI', text: "If the cables look good, it could also be a port issue on your network switch - try moving the cable to a different port. In rare cases, it could be a failing network adapter in the camera itself, but let's rule out the simpler causes first. Would you like me to keep this ticket open so you can call back with the results?" },
      { speaker: 'Caller', text: "Yes, I'll try the cable check and call back if it keeps happening." },
      { speaker: 'AI', text: "Sounds good, David. I've noted the troubleshooting steps we discussed. If the issue persists after checking the connections, our technical team can schedule a site visit to diagnose further. Thank you for calling DTIQ." },
    ],
    intent: 'Technical Support - Intermittent Camera Feed',
  },
  {
    id: 'call-007',
    phoneNumber: '5551472583',
    callerName: 'Jennifer Adams',
    status: 'failed',
    isHandled: false,
    startTime: daysAgo(1, 8),
    durationSeconds: 45,
    aiSummary: 'Call disconnected unexpectedly after 45 seconds. Caller was beginning to describe an issue with mobile app access. Callback attempted but went to voicemail.',
    transcript: [
      { speaker: 'AI', text: 'Thank you for calling DTIQ. My name is DTIQ Assistant. How can I help you today?' },
      { speaker: 'Caller', text: "Hi, I'm having trouble with the app on my phone. I can't seem to..." },
    ],
    intent: 'Technical Support - Mobile App (Incomplete)',
  },
];

// Stats calculation helpers
export function getCallStats(calls: Call[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const callsToday = calls.filter((call) => {
    const callDate = new Date(call.startTime);
    callDate.setHours(0, 0, 0, 0);
    return callDate.getTime() === today.getTime();
  });

  const needsAttention = calls.filter((call) => !call.isHandled && call.status !== 'in_progress');

  const completedCalls = calls.filter((call) => call.status === 'completed');
  const totalDuration = completedCalls.reduce((sum, call) => sum + call.durationSeconds, 0);
  const avgDuration = completedCalls.length > 0 ? Math.round(totalDuration / completedCalls.length) : 0;

  return {
    totalCalls: calls.length,
    callsToday: callsToday.length,
    needsAttention: needsAttention.length,
    avgDurationSeconds: avgDuration,
  };
}
