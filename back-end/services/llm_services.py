from dotenv import load_dotenv
load_dotenv()

import os
from openai import OpenAI

def run_llm_chat_completion(system, messages, tools = []):
    client = OpenAI(
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
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=all_messages,
        tools=tools,
    )
    
    return response.choices[0].message

def run_llm_structure_output(system, user_input, response_format):
    client = OpenAI(
        api_key = os.getenv("OPENAI_API_KEY"),
        base_url="https://oai.helicone.ai/v1",
        default_headers= {  # Optionally set default headers or set per request (see below)
            "Helicone-Auth": f"Bearer {os.getenv('HELICONE_API_KEY')}",
        }
    )
    
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_input}
        ],
        response_format=response_format
    )
    
    return completion.choices[0].message.parsed.model_dump()

def get_word_embeddings(text):
    client = OpenAI(api_key = os.getenv("OPENAI_API_KEY"))
    
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )

    return response.data[0].embedding
