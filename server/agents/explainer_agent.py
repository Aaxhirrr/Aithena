from .base_agent import BaseAgent


class ExplainerAgent(BaseAgent):
    name = "explainer"

    async def run(self, topic: str):
        return f"Explanation for {topic}"


agent = ExplainerAgent()

