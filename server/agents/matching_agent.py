from .base_agent import BaseAgent


class MatchingAgent(BaseAgent):
    name = "matching"

    async def run(self, profile, pool=None):
        return pool or []


agent = MatchingAgent()

