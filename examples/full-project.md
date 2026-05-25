# Full Project Workflow

```
/autopilot "build a user authentication system with JWT, tests, and documentation"
```

Phases detected:
1. Plan & Design → writing-plans
2. Implement Core → subagent-driven-development
3. Add Auth → subagent-driven-development
4. Write Tests → tdd
5. Review → requesting-code-review
6. Ship → finishing-a-development-branch

Each phase runs autonomously. The agent:
- Generates tailored prompts for each phase
- Monitors progress via task list, git, tests
- Retries failed phases with adjusted prompts
- Runs final verification before reporting done
