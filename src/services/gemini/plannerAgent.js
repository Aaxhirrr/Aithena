export class PlannerAgent {
  async plan(goal) { return { goal, steps: [] } }
}

export default new PlannerAgent()

