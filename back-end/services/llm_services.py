from dotenv import load_dotenv
load_dotenv()

import os
from openai import AsyncOpenAI

async def run_llm_chat_completion(system, messages, tools = []):
    client = AsyncOpenAI(
        api_key = os.getenv("OPENAI_API_KEY"),
        base_url="https://oai.helicone.ai/v1",
        default_headers= {  # Optionally set default headers or set per request (see below)
            "Helicone-Auth": f"Bearer {os.getenv('HELICONE_API_KEY')}",
        }
    )
    
    all_messages = [
        {
            "role": "system",
            "content": system
        }
    ] + messages
    
    response = await client.chat.completions.create(
        model="gpt-4",
        messages=all_messages,
        tools=tools,
    )
    
    return response.choices[0].message

async def run_llm_structure_output(system, user_input, response_format):
    client = AsyncOpenAI(
        api_key = os.getenv("OPENAI_API_KEY"),
        base_url="https://oai.helicone.ai/v1",
        default_headers= {  # Optionally set default headers or set per request (see below)
            "Helicone-Auth": f"Bearer {os.getenv('HELICONE_API_KEY')}",
        }
    )
    
    # Convert response_format to a format specification in the system prompt
    format_description = "Please provide your response in the following JSON format:\n"
    for key, value in response_format["properties"].items():
        format_description += f"- {key}: {value['type']}\n"
    
    enhanced_system = f"{system}\n\n{format_description}"
    
    completion = await client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": enhanced_system},
            {"role": "user", "content": user_input}
        ]
    )
    
    # Parse the response text as JSON
    import json
    try:
        response_text = completion.choices[0].message.content
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse LLM response as JSON: {str(e)}")

async def get_word_embeddings(text):
    client = AsyncOpenAI(api_key = os.getenv("OPENAI_API_KEY"))
    
    response = await client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )

    return response.data[0].embedding
