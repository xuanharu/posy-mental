import requests
from pydantic import BaseModel
from typing import List, Literal
from markdownify import markdownify as md
from services import llm_services
from utils import constants, logger

def crawl(url):
    payload = {}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive"
    }
    response = requests.request("GET", url, headers=headers, data=payload)
    markdown = md(response.text)
    
    return markdown

class CrawlRequest(BaseModel):
    title: str
    content: str
    author: str
    imageUrl: str
    tags: List[Literal[tuple(constants.tags)]]

def parse_crawled_content(markdown: str):
    
    return llm_services.run_llm_structure_output(
        system = constants.parse_crawled_article_system_prompt,
        user_input = markdown,
        response_format = CrawlRequest
    )

def crawl_and_parse(url):
    markdown = crawl(url)
    logger.logger.info("Crawl successfully, begin AI analysis ...")
    result = parse_crawled_content(markdown)
    logger.logger.info("AI analyse successfully.")
    result['source'] = url
    return result