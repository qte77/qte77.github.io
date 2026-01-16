# GraphJudge: Measuring How Agents Collaborate

> Measure how, not just whether

## About AgentBeats & Agentic AI Learning

GraphJudge is built for the
[AgentBeats competition](https://rdi.berkeley.edu/agentx-agentbeats), part of
the RDI Foundation's initiative to advance agent evaluation infrastructure.
AgentBeats establishes a standardized framework (A2A protocol) for
benchmarking AI agents through competitive and collaborative tasks.

This competition runs alongside the
[Agentic AI Learning MOOC](https://agenticai-learning.org)—a comprehensive
course teaching agent system design, evaluation, and deployment. The course
materials at [docs.agentbeats.org](https://docs.agentbeats.org) and
[docs.agentbeats.dev/tutorial](https://docs.agentbeats.dev/tutorial/) provide
hands-on experience building green (assessor) and purple (evaluated) agents
using the A2A protocol.

GraphJudge contributes to this ecosystem by introducing graph-based
coordination assessment—a novel evaluation methodology that complements
existing task-completion benchmarks with structural analysis of agent
interactions.

## The Problem: Success Isn't the Whole Story

When you evaluate multi-agent systems today, you typically ask: "Did they
complete the task?" But here's what that misses—two agents might both succeed
at a task, yet one does it through elegant coordination while the other
stumbles through with redundant communication and bottlenecks. Traditional
benchmarks can't tell the difference.

Think of it like evaluating team projects in school. Getting an A on the final
deliverable doesn't tell you whether the team collaborated effectively or if
one person did all the work while others copied notes at the last minute. We
need to measure **how** agents work together, not just whether they succeed.

## Our Approach: Graph-Based Coordination Analysis

GraphJudge is a graph-centric evaluation framework built for the AgentBeats
competition that measures **coordination network complexity against execution
outcomes**. We capture interaction traces as agents communicate, then
transform these traces into directed graphs where nodes represent agents and
edges represent their communications. This isn't just bookkeeping—it reveals
the structure of collaboration and whether agents achieve results through
efficient coordination or convoluted communication patterns.

We extract **structural metrics** that quantify what's actually happening:

- **Centrality**: Which agents are coordination hubs vs peripheral
  participants?
- **Density**: How connected is the communication network?
- **Efficiency**: Are agents taking direct paths or bouncing messages around?

These NetworkX-based graph metrics form our primary evaluation tier (Tier 1),
complemented by latency analysis that tracks performance bottlenecks. Together,
they provide quantitative measures of coordination quality that you can compare
across different agent systems.

### Beyond Pure Numbers: The LLM-as-Judge Layer

Graphs tell you the structure, but what about the quality of interactions?
That's where our **Tier 2 LLM-as-judge** comes in. We use real LLM API calls
(with rule-based fallback) to provide qualitative assessment of coordination
patterns—did agents adapt their strategies? Did they share information
effectively? This semantic layer complements the quantitative graph metrics
with behavioral insights.

For consistency validation, **Tier 3 text metrics** measure response
similarity across multiple runs, ensuring reproducibility in evaluation.

## Origins: Building on Agents-eval

GraphJudge is derived from
[Agents-eval](https://github.com/qte77/Agents-eval), a PeerRead-based
benchmark for autonomous research agent systems. We adapted its evaluation
philosophy—measuring the quality of agent behavior, not just outcomes—to the
AgentBeats context. Where Agents-eval focuses on research paper assessment
using text similarity metrics, GraphJudge pivots to graph structural analysis
for general multi-agent coordination.

This isn't a fork—it's an architectural adaptation. We took the core insight
that agent evaluation needs multiple complementary metrics and specialized it
for coordination assessment through graph theory.

## Implementation: A2A-Compliant and Production-Ready

GraphJudge operates as an A2A-compliant assessor, exposing standard endpoints
that any purple agent can interact with. The evaluation flow is
straightforward:

1. Purple agent submits evaluation request via A2A protocol
2. GraphJudge captures interaction traces during task execution
3. Traces → Directed graph → Structural metrics extraction
4. Three-tier evaluation produces comprehensive coordination scores
5. Results returned as structured A2A artifacts

The complete agentic graph benchmark architecture is visualized below, showing
the full evaluation pipeline from trace capture through multi-tier scoring:

![Agentic Graph Benchmark Architecture](images/RDI-AgentX-Architecture-light.png)

We validated the framework on a baseline purple agent across 5 independent
runs, achieving **perfect reproducibility** (0% variance across all metrics).
This isn't just about proving correctness—it demonstrates that our evaluation
is stable and fair for comparing different agent implementations.

Deployment is containerized via Docker, with results integrating directly into
the [AgentBeats
leaderboard](https://github.com/qte77/RDI-AgentX-AgentBeats-Competition-Leaderboard)
for transparent comparison. The agent is registered at
[agentbeats.dev/qte77/graphjudge](https://agentbeats.dev/qte77/graphjudge).

## Why This Matters

No existing AgentBeats benchmark quantifies coordination quality through graph
structural analysis. GraphJudge fills that gap by providing researchers with
actionable insights into **how effectively agents collaborate**.

You don't just get a pass/fail grade—you get metrics that reveal:

- Communication bottlenecks in your agent network
- Centralization vs distributed coordination patterns
- Performance characteristics under different workloads
- Behavioral adaptability through qualitative assessment

This enables evidence-based improvements to multi-agent system design. You can
see exactly where coordination breaks down and iterate accordingly.

## Development Insights & Contributions

### Lessons Learned

**Ralph Loop TDD**: Enforcing TEST-first then IMPL proved challenging. The
Ralph loop naturally wants to implement before testing, requiring scaffolding
through linting rules, Claude Code skills (`.claude/skills/`), and core
principles (`.claude/rules/`) to maintain TDD discipline. Interestingly,
specialized subagents became less critical than initially expected—well-
structured skills and rules provide sufficient guidance for the main agent.

**AgentBeats Submission**: The submission process is comprehensive—requiring
both green (assessor) and purple (evaluated) agents, a main agent repository
plus separate leaderboard repository, registration on agentbeats.dev, GitHub
workflow permissions configuration, container package tokens for GHCR
publishing, Docker image deployment, demo video creation, abstract writing,
MOOC article contribution, and finally a multi-page submission form with tight
deadline. Each component serves a purpose (reproducibility, transparency,
education), though coordinating everything in time tests your project
management skills. The resulting infrastructure is well-designed for the agent
ecosystem's long-term growth.

**Time Constraints**: Competition deadlines unfortunately cut development time
short, limiting implementation of advanced features like interactive graph
visualizations, Phase 2 ART training on traces, and comprehensive plugin
ecosystem expansion. The current release prioritizes core graph-based
coordination assessment with proven reproducibility, establishing a foundation
for future enhancements. The agentic benchmark architecture visualization
(`assets/AgenticBenchArch.png`) documents the intended full system design.

### Technical Contributions

GraphJudge introduces three novel elements to AgentBeats:

1. **Custom trace engine**: Captures interaction patterns during task execution,
   transforming A2A message flows into directed graphs for structural analysis
2. **Network complexity scoring**: Combines graph metrics (where lower
   complexity often indicates efficient coordination) with LLM-as-judge
   qualitative assessment of MAS execution quality
3. **Plugin architecture**: Future-ready extensibility enabling domain-specific
   evaluators—demonstrated through the text metrics module designed for
   Agents-eval's PeerRead dataset assessment

This architecture balances quantitative structural analysis with qualitative
behavioral assessment, while remaining extensible for specialized evaluation
contexts.

## Categories & Contribution

**Competition Categories**: Multi-agent Evaluation, Research Agent

**Core Contribution**: First AgentBeats benchmark measuring coordination
quality through graph structural analysis, enabling researchers to understand
not just if agents coordinate, but how effectively.

GraphJudge pioneers **agentified benchmarking** for multi-agent systems—using
automated evaluation agents to assess coordination quality. This approach is
demonstrated through integration with agents-eval, a research MAS that
evaluates autonomous agents on the PeerRead dataset. By combining graph-based
structural metrics with domain-specific evaluation plugins, GraphJudge
establishes a framework where assessment agents can be specialized for
different contexts while maintaining consistent coordination analysis.

## Competition Compliance

GraphJudge meets all official
[AgentBeats competition requirements](https://rdi.berkeley.edu/agentx-agentbeats):

- **A2A Protocol**: Universal agent interface with standard endpoints at
  `/.well-known/agent.json`
- **Docker Deployment**: Containerized for `linux/amd64`, published to GHCR,
  accepts CLI args (`--host`, `--port`, `--card-url`)
- **Reproducibility**: Fresh state per assessment, task ID namespacing,
  documented across 5 validation runs
- **Leaderboard Integration**: DuckDB queries extract graph metrics,
  coordination scores, and similarity measures from published results

Judging criteria alignment: Technical correctness (A2A-compliant, typed,
tested), reproducibility (0% variance documented), benchmark quality (graph
metrics reveal genuine coordination patterns), evaluation methodology
(three-tier quantitative + qualitative assessment), innovation (first
graph-based coordination benchmark in AgentBeats).

---

**Agent Registry**: [agentbeats.dev/qte77/graphjudge](https://agentbeats.dev/qte77/graphjudge)

**Repository**:
[github.com/qte77/RDI-AgentX-AgentBeats-Competition](https://github.com/qte77/RDI-AgentX-AgentBeats-Competition)

**Leaderboard**:
[github.com/qte77/RDI-AgentX-AgentBeats-Competition-Leaderboard](https://github.com/qte77/RDI-AgentX-AgentBeats-Competition-Leaderboard)

**References**:
[Competition Page](https://rdi.berkeley.edu/agentx-agentbeats) |
[AgentBeats Tutorial](https://github.com/RDI-Foundation/agentbeats-tutorial) |
[Green Agent Template](https://github.com/RDI-Foundation/green-agent-template) |
[Documentation](https://docs.agentbeats.dev/tutorial/)
