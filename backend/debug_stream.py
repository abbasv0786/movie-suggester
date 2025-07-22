import asyncio
import os
from src.llm_agent import LLMAgent

async def debug_streaming():
    try:
        print("🔍 Debugging Streaming Component...")
        
        # Test LLM agent streaming
        agent = LLMAgent()
        print(f"Model: {agent.model}")
        
        print("\n📡 Testing streaming generation...")
        chunks_received = 0
        content = ""
        
        async for chunk in agent.generate_suggestions_stream("action movies like John Wick"):
            chunks_received += 1
            content += chunk
            print(f"Chunk {chunks_received}: '{chunk}' (length: {len(chunk)})")
            
            # Stop after 20 chunks to avoid spam
            if chunks_received >= 20:
                print("... (stopping after 20 chunks)")
                break
        
        print(f"\n📊 Summary:")
        print(f"Total chunks received: {chunks_received}")
        print(f"Total content length: {len(content)}")
        print(f"Content preview: {content[:200]}...")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

asyncio.run(debug_streaming())
