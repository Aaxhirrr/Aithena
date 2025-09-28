export class ExplainerAgent {
  async explain(topic) { return `Explanation for ${topic}` }
}

export default new ExplainerAgent()

