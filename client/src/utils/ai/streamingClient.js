/**
 * Streaming Client - Handles SSE streaming from backend
 */

import api from '../../config/api';

class StreamingClient {
  /**
   * Stream message with real-time token updates
   */
  async streamMessage(params, callbacks) {
    const {
      message,
      history = [],
      context = {},
      mode = 'normal',
      marks = null
    } = params;

    const {
      onStart,      // Called when stream starts
      onToken,      // Called for each token
      onComplete,   // Called when stream completes
      onError       // Called on error
    } = callbacks;

    try {
      const response = await fetch(`${api.defaults.baseURL}/api/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          history,
          context,
          mode,
          marks
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      let fullResponse = '';
      let metadata = {};

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'start':
                  metadata = {
                    model: data.model,
                    mode: data.mode
                  };
                  if (onStart) onStart(metadata);
                  break;

                case 'token':
                  fullResponse += data.content;
                  if (onToken) onToken(data.content, fullResponse);
                  break;

                case 'done':
                  metadata = {
                    ...metadata,
                    tokens: data.tokens,
                    marks: data.marks
                  };
                  if (onComplete) onComplete(fullResponse, metadata);
                  break;

                case 'error':
                  if (onError) onError(data.message);
                  break;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('Streaming error:', error);
      if (onError) onError(error.message);
    }
  }

  /**
   * Stop streaming (by aborting fetch)
   */
  stopStream(controller) {
    if (controller) {
      controller.abort();
    }
  }
}

export default new StreamingClient();
