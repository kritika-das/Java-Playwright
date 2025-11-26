Playwright agent scaffold

Files created:
- `pages/*` - page object models
- `agent/testAgent.ts` - the agent that maps natural language steps to page methods
- `steps/*` - example step definition files that call `agent.run(...)`
- `support/hook.ts` - helper to create browser/page/agent
- `features/sample.feature` - example Gherkin feature file

How it works

- Input file: Java Selenium test code or Gherkin steps (you can pass a single step string to `agent.run(step)`)
- Output: Playwright TypeScript calls executed via the agent and example step files. This scaffold demonstrates how to map natural-language steps to page object methods using regex mappings.

How to run an example (requires Node.js and Playwright installed):

1. Install dependencies:

```powershell
npm install playwright ts-node typescript
npx playwright install
```

2. Run an example step file:

```powershell
npx ts-node playwrite/steps/login.steps.ts
```

Extending

- Add more regex mappings with `agent.extend(/regex/i, async (pages, groups, raw) => { ... })`.
- Add more page objects under `pages/` and wire them into `TestAgent`.
