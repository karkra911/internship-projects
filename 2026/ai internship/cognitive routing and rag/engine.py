# engine.py
# Phase 2: Autonomous Content Engine using LangGraph

from langgraph.graph import StateGraph, END
from langchain.tools import tool
import random
import json

# -----------------------------
# MOCK SEARCH TOOL
# -----------------------------
@tool
def mock_searxng_search(query: str):
    query = query.lower()

    if "crypto" in query:
        return "Bitcoin hits all-time high amid ETF approvals and institutional buying."
    elif "ai" in query:
        return "New AI model claims to replace junior developers across tech companies."
    elif "market" in query:
        return "Interest rates expected to drop next quarter, boosting equity markets."
    else:
        return "Tech industry shows strong growth across AI and cloud sectors."


# -----------------------------
# STATE STRUCTURE
# -----------------------------
# state = {
#   "bot_id": "",
#   "persona": "",
#   "query": "",
#   "context": "",
#   "output": ""
# }


# -----------------------------
# NODE 1: Decide Topic
# -----------------------------
def decide_search(state):
    persona = state["persona"].lower()

    if "crypto" in persona:
        state["query"] = "crypto news"
    elif "finance" in persona or "market" in persona:
        state["query"] = "market news"
    elif "ai" in persona:
        state["query"] = "AI news"
    else:
        state["query"] = "tech news"

    return state


# -----------------------------
# NODE 2: Web Search (mock)
# -----------------------------
def web_search(state):
    query = state["query"]
    state["context"] = mock_searxng_search.invoke(query)
    return state


# -----------------------------
# NODE 3: Draft Post
# -----------------------------
def draft_post(state):
    persona = state["persona"]
    context = state["context"]

    # Simple “opinion generator”
    post = f"""
Persona: {persona}

News: {context}

Opinion: This development is highly significant and will reshape the industry trajectory.
"""

    # force 280 char limit
    post = post.strip()[:280]

    state["output"] = {
        "bot_id": state["bot_id"],
        "topic": state["query"],
        "post_content": post
    }

    return state


# -----------------------------
# BUILD LANGGRAPH
# -----------------------------
graph = StateGraph(dict)

graph.add_node("decide", decide_search)
graph.add_node("search", web_search)
graph.add_node("draft", draft_post)

graph.set_entry_point("decide")
graph.add_edge("decide", "search")
graph.add_edge("search", "draft")
graph.add_edge("draft", END)

app = graph.compile()


# -----------------------------
# RUN TEST
# -----------------------------
if __name__ == "__main__":

    bot_state = {
        "bot_id": "bot_a",
        "persona": "I am an AI and crypto optimist who believes technology solves everything."
    }

    result = app.invoke(bot_state)

    print("\nFINAL OUTPUT:\n")
    print(json.dumps(result["output"], indent=2))