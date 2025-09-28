class BaseAgent:
    name = "agent"

    async def run(self, *args, **kwargs):
        raise NotImplementedError

