'use client';
import VapiVoiceChat from "@/componenets/VapiVoiceChat";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
type Post = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export default function Home() {
  const [voiceActive, setVoiceActive] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
  
    const fetchVoice = async () => {
      const res = await fetch('/api/voice', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!res.ok) {
        console.error('Failed to fetch posts', res.status);
        return;
      }
  
      const json = await res.json();
      console.log('Response JSON:', json);
  
      setPosts(json.data);
    };

    useEffect(()=>{
      fetchVoice()
    },[])


      const subscribeToChanges = () => {
        const channel = supabase
        .channel('public:voice_message')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'voice_message' },
            (payload) => {
    
              setPosts((currentPosts) => {
                const newPost = payload.new as Post;
                const oldPost = payload.old as Post;
    
                switch (payload.eventType) {
                  case 'INSERT':
                    return [newPost, ...currentPosts];
                  case 'UPDATE':
                    return currentPosts.map((post) =>
                      post.id === newPost.id ? newPost : post
                    );
                  case 'DELETE':
                    return currentPosts.filter((post) => post.id !== oldPost.id);
                  default:
                    return currentPosts;
                }
              });
            }
          )
          .on('system', { type: 'channel_closed' }, () => {
            console.warn('📡 Supabase channel closed. Reconnecting...');
            // optionally recreate the channel here
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('📡 Realtime channel connected');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              const date = new Date()
              console.log('📡 Realtime channel',status,date );
              console.warn('⚠️ Realtime channel error, reconnecting...');
              setTimeout(() => subscribeToChanges(), 2000); // retry
            }
          });
    
        return channel;
      };
    
    
      useEffect(() => {
       
        let channel = subscribeToChanges();
        fetchVoice()
        const handleVisibility = () => {
          if (document.visibilityState === 'visible') {
            console.log('🔄 Tab activated — refreshing connection');
            supabase.removeChannel(channel);
            channel = subscribeToChanges();
            fetchVoice(); // also refresh posts
          }
        };
    
        document.addEventListener('visibilitychange', handleVisibility);
    
        return () => {
          supabase.removeChannel(channel);
          document.removeEventListener('visibilitychange', handleVisibility);
        };
      }, []);


  return (
    <div >
     <main>
    {voiceActive && <p>voice active</p>}
      <VapiVoiceChat handleVapiChatClick={setVoiceActive} />
   
    </main>
    {posts.map((post,index) => (
        <article key={post.id}>
            <h2>{index}</h2>
          <h2>{post.name}</h2>
          <p>{post.description}</p>
        </article>
      ))}
    
    </div>
  );
}
