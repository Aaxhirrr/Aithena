from .base_agent import BaseAgent


class PlannerAgent(BaseAgent):
    name = "planner"

    async def run(self, goal: str):
        return {"goal": goal, "steps": []}


agent = PlannerAgent()

