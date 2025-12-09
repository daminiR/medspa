#!/usr/bin/env python3
"""
Script to fetch and populate all Mango Mint help articles
"""
import json
import os
import sys
from pathlib import Path

def load_fetch_queue():
    """Load the fetch queue JSON file"""
    with open('fetch_queue.json', 'r') as f:
        return json.load(f)

def get_all_articles(data):
    """Extract all articles from the fetch queue into a flat list"""
    articles = []
    for category, items in data['categories'].items():
        for item in items:
            articles.append(item)
    return articles

def main():
    # Load the fetch queue
    data = load_fetch_queue()
    articles = get_all_articles(data)

    print(f"Total articles to process: {len(articles)}")
    print(f"Categories: {len(data['categories'])}")

    # Output the article list for processing
    for i, article in enumerate(articles, 1):
        print(f"{i}|{article['file']}|{article['url']}|{article['category']}")

if __name__ == '__main__':
    main()
