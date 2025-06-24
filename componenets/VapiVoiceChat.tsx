'use client';

import { useEffect, useState } from 'react';
import Vapi from '@vapi-ai/web';
import Image from 'next/image';
import dashboardIllustration1 from '@/assests/dashboard-illustration-1.png'
import '@/styles/AnimatedVoiceButton.css';

interface VapiVoiceChatProps {
  handleVapiChatClick: (active: boolean) => void;
}

const VapiVoiceChat: React.FC<VapiVoiceChatProps> = ({ handleVapiChatClick }) => {
 
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const instance = new Vapi('0ee1ba88-d3d4-4c1f-a4f9-fa72d1142058');
    let liveTranscript = ''; // store user transcript across events
    instance.on('call-start', () => {
      console.log('✅ Call has started');
      setIsConnected(true);
      setIsListening(true);
      liveTranscript = '';
    });

    instance.on('call-end', () => {
      console.log('📞 Call has ended');
      setIsConnected(false);
      setIsListening(false);
    });

    instance.on('speech-start', () => console.log('🎤 User started speaking'));

    instance.on('speech-end', async () => {
      if (!liveTranscript.trim()) return;
      console.log("liveTranscript",liveTranscript)
  
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'User',                 // or use dynamic name
          description: liveTranscript.trim(),
        }),
      });
  
      const result = await res.json();
      console.log('📥 Saved to DB:', result);
  
      // Reset after storing
      liveTranscript = '';
    });
  
    instance.on('call-end', () => {
      console.log('📞 Call ended');
      setIsConnected(false);
      setIsListening(false);
      liveTranscript = '';
    });

    instance.on('message', (msg: any) => {
      // console.log('📝 Transcript:', msg);
      if (msg.type === 'transcript' && msg.role === 'user') {
        console.log('📝 Transcript:', msg.transcript);
        liveTranscript += ' ' + msg.transcript;
      }
    });
    
  

    setVapi(instance);
  }, []);

  const handleToggleVoice = () => {
    if (!vapi) {
      console.warn('⚠️ Vapi instance not ready yet');
      return;
    }

    if (!isListening) {
      try {
        vapi.start('c7383a66-3bc5-4df6-9054-7006d6d03c43'); // Your assistant ID
     
        handleVapiChatClick(true);
      } catch (error) {
        console.error('❌ Failed to start Vapi:', error);
      }
    } else {
      try {
        vapi.stop();
        handleVapiChatClick(false);
      } catch (error) {
        console.error('❌ Failed to stop Vapi:', error);
      }
    }
  };

  return (
    <div className="parnet-container">
      <div className="voice-container">
       <p> Call Reem <br /> to help you create a job</p>
        <button
          className={`voice-button ${isListening ? 'listening' : ''}`}
          onClick={handleToggleVoice}
          aria-label="Toggle voice"
        >
          {!isListening ? (
            <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24" width="32" fill="white">
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 
                4.34 9 6v6c0 1.66 1.34 3 3 3zm5-3c0 
                2.76-2.24 5-5 5s-5-2.24-5-5H5c0 
                3.53 2.61 6.43 6 
                6.92V21h2v-2.08c3.39-.49 6-3.39 
                6-6.92h-2z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="white" className="waveform">
              <rect x="2" y="8" width="2" height="8" className="bar bar1" />
              <rect x="6" y="6" width="2" height="12" className="bar bar2" />
              <rect x="10" y="4" width="2" height="16" className="bar bar3" />
              <rect x="14" y="6" width="2" height="12" className="bar bar4" />
              <rect x="18" y="8" width="2" height="8" className="bar bar5" />
            </svg>
          )}
        </button>
      </div>

      <Image
        src={dashboardIllustration1}
        alt="AI Recruiter"
        style={{ height: 200, position: 'absolute', right: '0', zIndex: -1 }}
      />
    </div>
  );
};

export default VapiVoiceChat;
