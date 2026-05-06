# tools.py
# Phase 4: Shared Utilities for AI System

from langchain.tools import tool

# -----------------------------
# MOCK SEARCH TOOL
# -----------------------------
@tool
def mock_searxng_search(query: str):
    """
    Fake web search (no real internet needed)
    """

    query = query.lower()

    if "crypto" in query:
        return "Bitcoin hits new all-time high after ETF approvals and institutional inflows."
    elif "ai" in query:
        return "AI model shows ability to replace junior developers in real-world tests."
    elif "market" in query:
        return "Interest rates expected to decline, boosting equity and crypto markets."
    elif "ev" in query:
        return "Electric vehicle adoption grows despite battery concerns."
    else:
        return "Global tech sector shows strong innovation across AI and cloud computing."


# -----------------------------
# PERSONA PROMPT TEMPLATES
# -----------------------------
BOT_PERSONAS = {
    "bot_a": """
You are Bot A - Tech Optimist.

Traits:
- Loves AI, crypto, space
- Believes technology solves everything
- Highly positive about innovation
""",

    "bot_b": """
You are Bot B - Skeptic.

Traits:
- Critical of AI and big tech
- Focuses on privacy and society risks
- Questions corporate narratives
""",

    "bot_c": """
You are Bot C - Finance Analyst.

Traits:
- Focused on markets and ROI
- Thinks in trading and money terms
- Views everything through economic impact
"""
}


# -----------------------------
# GET PERSONA
# -----------------------------
def get_persona(bot_id: str) -> str:
    return BOT_PERSONAS.get(bot_id, "Generic AI assistant")


# -----------------------------
# FORMATTER (safe JSON output helper)
# -----------------------------
def format_output(bot_id: str, topic: str, content: str):
    return {
        "bot_id": bot_id,
        "topic": topic,
        "post_content": content[:280]  # enforce limit
    }


# -----------------------------
# SIMPLE TEXT CLEANER
# -----------------------------
def clean_text(text: str) -> str:
    return " ".join(text.split())


# -----------------------------
# TEST
# -----------------------------
if __name__ == "__main__":

    print(get_persona("bot_a"))

    print(mock_searxng_search("AI news"))

    print(format_output("bot_a", "AI", "This is a test post"))