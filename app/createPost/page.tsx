'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabaseClient';

type Post = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};


export default function CreatePost() {
  const [name, setTitle] = useState('');
  const [description, setContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    });

    const result = await res.json();

    if (result.success) {
      setMessage('Post created!');
      setTitle('');
      setContent('');
    } else {
      setMessage('Error: ' + result.error);
    }
  };



  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPost = async () => {
    const res = await fetch('/api/posts', {
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
  // useEffect(() => {
  //   fetchPost();
  // }, []);


  const subscribeToChanges = () => {
    const channel = supabase
    .channel('public:posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
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
    fetchPost()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Tab activated — refreshing connection');
        supabase.removeChannel(channel);
        channel = subscribeToChanges();
        fetchPost(); // also refresh posts
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
  return (
    <div>
      <h2>Create a Post</h2>
      <input
        value={name}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      /><br />
      <textarea
        value={description}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
      /><br />
      <button onClick={handleSubmit}>Submit</button>
      <p>{message}</p>


      <div>
      <h1>Posts</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.name}</h2>
          <p>{post.description}</p>
        </article>
      ))}
      </div>
    </div>
  );
}
