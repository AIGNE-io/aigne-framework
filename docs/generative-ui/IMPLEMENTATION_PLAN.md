# AIGNE Generative UI - Implementation Plan

Phased roadmap for building production-ready generative UI capabilities in AIGNE Framework.

## Overview

This plan outlines a **6-8 week development cycle** split into three main phases:

1. **Phase 1: Minimal Prototype** (Week 1-2) - Prove the concept
2. **Phase 2: Core Implementation** (Week 3-5) - Build essential features
3. **Phase 3: Production Polish** (Week 6-8) - Make it production-ready

## Phase 1: Minimal Prototype (Weeks 1-2)

### Goal

Prove that generative UI works in AIGNE with a minimal viable implementation.

### Deliverables

#### Week 1: CLI Prototype

**Objective**: Single working CLI component

```
ui/
├── core/                         # @aigne/ui
│   ├── src/
│   │   ├── types.ts              # Core interfaces
│   │   ├── component.ts          # UIComponent base
│   │   ├── registry.ts           # ComponentRegistry
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── cli/                          # @aigne/ui-cli
    ├── src/
    │   ├── components/
    │   │   └── simple-chart.ts   # First component!
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

**Tasks**:

- [ ] Create `@aigne/ui` core package
- [ ] Define core types (`UIComponent`, `ComponentContext`)
- [ ] Implement `ComponentRegistry`
- [ ] Create `@aigne/ui-cli` package
- [ ] Build `SimpleChart` CLI component (Ink.js)
- [ ] Convert component to AIGNE skill
- [ ] Test with real AI agent

**Success Criteria**:

```typescript
// User says: "Show me a chart of [5, 10, 15]"
// AI invokes: ui_simple_chart
// Output:
//   Chart
//   ██████████ 15
//   ███████    10
//   ████       5
```

**Estimated Effort**: 2-3 days

#### Week 2: Web Prototype

**Objective**: Single working React component

```
ui/
└── web/                          # @aigne/ui-web
    ├── src/
    │   ├── hooks/
    │   │   └── use-aigne.ts      # React hook
    │   ├── components/
    │   │   └── simple-chart.tsx  # Recharts component
    │   └── index.ts
    ├── package.json
    └── tsconfig.json

examples/
└── ui-web-demo/                  # Next.js demo
    └── app/
        └── page.tsx
```

**Tasks**:

- [ ] Create `@aigne/ui-web` package
- [ ] Create `useAIGNE` React hook
- [ ] Build `SimpleChart` React component (MUI + Recharts)
- [ ] Create Next.js demo app
- [ ] Test component registration and rendering

**Success Criteria**:

- User can type in chat input
- AI generates chart component
- Chart renders with Recharts
- No errors in console

**Estimated Effort**: 3-4 days

### Milestone 1 Complete

**Validation**:

- ✅ Both CLI and Web versions working
- ✅ AI can generate UI components
- ✅ Components render correctly
- ✅ ~400 lines of code total
- ✅ Demo video recorded

---

## Phase 2: Core Implementation (Weeks 3-5)

### Goal

Build essential features for production use.

### Week 3: Component Library

**CLI Components**:

- [ ] `TerminalTable` (ink-table)
- [ ] `TerminalChart` (@pppp606/ink-chart)
- [ ] `TerminalDashboard` (Ink.js Box/Text)
- [ ] `TerminalProgress` (ink-spinner)

**Web Components**:

- [ ] `WebTable` (MUI Table/DataGrid)
- [ ] `WebDashboard` (MUI Card/Grid)
- [ ] `WebChart` (Recharts - multiple types)

**Tasks**:

- [ ] Define component prop schemas (Zod)
- [ ] Implement rendering logic
- [ ] Add TypeScript types
- [ ] Write unit tests for each component
- [ ] Create component documentation

**Estimated Effort**: 5-6 days

### Week 4: State Management & Message Integration

**Objectives**:

- Implement message-based state persistence
- Integrate with AIGNE's conversation system

**Deliverables**:

```
ui/
└── core/                         # @aigne/ui
    └── src/
        ├── component-state.ts    # State manager (simplified)
        ├── message-types.ts      # Message + component types
        └── streaming.ts          # Stream coordinator
```

**Tasks**:

- [ ] Create `ComponentState` class (in-memory)
- [ ] Define `AIGNEMessageWithComponent` interface
- [ ] Extend conversation storage to handle component data
- [ ] Add state serialization/deserialization
- [ ] Write message integration tests
- [ ] Update components to use state

**Example**:

```typescript
// Component uses state
const value = context.state.get('count');
context.state.set('count', value + 1);

// On next AI turn, state is saved in message:
// {
//   role: 'assistant',
//   component: { name: 'Counter', props: {...}, state: { count: 1 } }
// }
```

**Estimated Effort**: 3-4 days (simplified from previous approach)

### Week 5: Streaming & UIAgent

**Objectives**:

- Implement progressive rendering
- Create UIAgent class

**Deliverables**:

```
ui/
├── core/                         # @aigne/ui
│   └── src/
│       ├── ui-agent.ts           # UIAgent extends AIAgent
│       ├── streaming.ts          # Progressive rendering
│       └── partial-json.ts       # JSON parser
├── cli/                          # @aigne/ui-cli
│   └── src/
│       └── ui-agent-cli.ts       # CLI-specific
└── web/                          # @aigne/ui-web
    └── src/
        └── ui-agent-web.ts       # Web-specific
```

**Tasks**:

- [ ] Implement `UIAgent` class
- [ ] Add component-to-skill conversion
- [ ] Build streaming coordinator
- [ ] Implement partial JSON parsing
- [ ] Create CLI-specific UIAgent
- [ ] Create Web-specific UIAgent
- [ ] Write integration tests

**Example**:

```typescript
const agent = UIAgent.forCLI({
  name: 'Assistant',
  components: [Chart, Table, Dashboard],
  afs: setupAFS(),
});

// AI can now invoke:
// - ui_Chart
// - ui_Table
// - ui_Dashboard
```

**Estimated Effort**: 5-6 days

### Milestone 2 Complete

**Validation**:

- ✅ 6+ working components (3 CLI + 3 Web)
- ✅ State persistence working
- ✅ Streaming with progressive rendering
- ✅ UIAgent fully functional
- ✅ Integration tests passing
- ✅ ~2000 lines of code

---

## Phase 3: Production Polish (Weeks 6-8)

### Goal

Make it production-ready with polish, tests, and documentation.

### Week 6: Advanced Components & Forms

**Components**:

- [ ] `TerminalForm` (ink-text-input + ink-select-input)
- [ ] `TerminalMenu` (ink-select-input)
- [ ] `WebForm` (React Hook Form)
- [ ] `WebModal` (MUI Dialog)
- [ ] `WebDataGrid` (MUI DataGrid)

**Features**:

- [ ] Form validation
- [ ] Interactive state updates
- [ ] Error handling
- [ ] Loading states

**Estimated Effort**: 5-6 days

### Week 7: CLI Integration & Examples

**CLI Enhancements**:

```bash
# New commands
aigne run-ui              # Run with UI capabilities
aigne ui-demo             # Interactive demo
```

**Example Projects**:

- [ ] System monitor (CLI)
- [ ] Data analytics dashboard (Web)
- [ ] Configuration wizard (CLI)
- [ ] Project management app (Web)

**Tasks**:

- [ ] Add `run-ui` command to @aigne/cli
- [ ] Create example projects
- [ ] Write tutorials
- [ ] Record demo videos

**Estimated Effort**: 4-5 days

### Week 8: Testing, Docs & Release

**Testing**:

- [ ] Unit tests (>80% coverage)
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Performance benchmarks
- [ ] Cross-platform testing

**Documentation**:

- [ ] API reference (TypeDoc)
- [ ] Component library docs
- [ ] Tutorial series
- [ ] Migration guide
- [ ] Troubleshooting guide

**Release**:

- [ ] Changelog
- [ ] Version bump (1.0.0-beta.1)
- [ ] npm publish
- [ ] GitHub release
- [ ] Announcement blog post

**Estimated Effort**: 6-7 days

### Milestone 3 Complete

**Validation**:

- ✅ 10+ production components
- ✅ Complete test coverage
- ✅ Full documentation
- ✅ Example projects
- ✅ Ready for beta release
- ✅ ~5000 lines of code

---

## Development Workflow

### Daily Process

1. **Morning Standup** (if team)
   - What did you work on yesterday?
   - What are you working on today?
   - Any blockers?

2. **Development**
   - Write tests first (TDD)
   - Implement feature
   - Run tests (`pnpm test`)
   - Run linter (`pnpm lint:fix`)

3. **End of Day**
   - Commit code
   - Update progress tracking
   - Document learnings

### Code Review Checklist

- [ ] Tests pass
- [ ] Types are correct
- [ ] Linter passes
- [ ] Documentation updated
- [ ] No console.logs
- [ ] Performance considered
- [ ] Accessibility checked (Web)

### Git Workflow

```bash
# Feature branch
git checkout -b feature/ui-dashboard-component

# Commit frequently
git commit -m "feat(ui): add dashboard component"

# Push for review
git push origin feature/ui-dashboard-component

# Create PR
gh pr create --title "feat(ui): Dashboard component"
```

---

## Package Structure

### Final Structure

Follows AFS pattern with root-level `ui/` directory containing independent packages:

```
aigne-framework/
├── packages/
│   ├── core/
│   ├── cli/
│   │   └── src/
│   │       └── commands/
│   │           └── run-ui.ts      # New UI command
│   └── ...
├── afs/
│   ├── core/                       # @aigne/afs
│   ├── history/                    # @aigne/afs-history
│   └── ...
├── ui/                             # Root-level UI packages (mirrors AFS)
│   ├── README.md                   # Overview of all UI packages
│   ├── core/                       # @aigne/ui
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── component.ts
│   │   │   ├── registry.ts
│   │   │   ├── ui-agent.ts
│   │   │   ├── streaming.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   ├── lib/                    # Build outputs (cjs, esm, dts)
│   │   └── package.json
│   ├── cli/                        # @aigne/ui-cli
│   │   ├── src/
│   │   │   ├── ui-agent-cli.ts
│   │   │   ├── components/
│   │   │   │   ├── chart.ts
│   │   │   │   ├── table.ts
│   │   │   │   ├── dashboard.ts
│   │   │   │   ├── form.ts
│   │   │   │   └── progress.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   ├── lib/
│   │   └── package.json
│   └── web/                        # @aigne/ui-web
│       ├── src/
│       │   ├── ui-agent-web.tsx
│       │   ├── hooks/
│       │   │   ├── use-aigne.ts
│       │   │   └── use-component-state.ts
│       │   ├── components/
│       │   │   ├── chart.tsx
│       │   │   ├── table.tsx
│       │   │   ├── dashboard.tsx
│       │   │   ├── form.tsx
│       │   │   └── modal.tsx
│       │   └── index.ts
│       ├── test/
│       ├── lib/
│       └── package.json
└── examples/
    ├── ui-cli-demo/                # CLI demo
    └── ui-web-demo/                # Web demo
```

---

## Dependencies

### Core Package (@aigne/ui)

```json
// ui/core/package.json
{
  "name": "@aigne/ui",
  "dependencies": {
    "@aigne/core": "workspace:^",
    "zod": "^3.25.67",
    "typescript": "^5.9.0"
  }
}
```

### CLI Package (@aigne/ui-cli)

```json
// ui/cli/package.json
{
  "name": "@aigne/ui-cli",
  "dependencies": {
    "@aigne/ui": "workspace:^",
    "ink": "^5.1.0",
    "ink-text-input": "^6.0.0",
    "ink-select-input": "^6.0.0",
    "ink-table": "^3.1.0",
    "ink-spinner": "^5.0.0",
    "@pppp606/ink-chart": "^0.2.4",
    "chalk": "^5.4.0"
  }
}
```

### Web Package (@aigne/ui-web)

```json
// ui/web/package.json
{
  "name": "@aigne/ui-web",
  "dependencies": {
    "@aigne/ui": "workspace:^",
    "react": "^18.3.0",
    "recharts": "^2.15.0",
    "react-hook-form": "^7.55.0",
    "@mui/material": "^7.3.7",
    "@mui/x-data-grid": "^8.24.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1"
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  }
}
```

---

## Success Metrics

### Technical Metrics

- **Test Coverage**: >80%
- **Build Time**: <30s
- **Package Size**: <500KB (gzipped)
- **TypeScript Errors**: 0
- **Linter Warnings**: 0

### User Metrics

- **Component Count**: 10+ production components
- **Example Projects**: 4+ working demos
- **Documentation Pages**: 20+ pages
- **GitHub Stars**: Track adoption

### Performance Metrics

- **Component Render Time**: <100ms
- **Streaming Latency**: <500ms
- **State Persistence**: <50ms
- **Memory Usage**: <100MB for typical session

---

## Risk Management

### Potential Risks

| Risk                      | Probability | Impact | Mitigation                            |
| ------------------------- | ----------- | ------ | ------------------------------------- |
| **Streaming complexity**  | Medium      | High   | Use proven libraries (partial-json)   |
| **Cross-platform issues** | High        | Medium | Test on macOS, Linux, Windows early   |
| **Performance**           | Medium      | Medium | Profile regularly, optimize hot paths |
| **Integration breaks**    | Low         | High   | Maintain backward compatibility       |
| **Scope creep**           | High        | High   | Stick to plan, defer non-essentials   |

### Mitigation Strategies

1. **Start Simple** - Minimal prototype first
2. **Test Early** - Don't wait for full implementation
3. **Regular Reviews** - Weekly progress check
4. **Scope Control** - Defer nice-to-haves to post-1.0
5. **Community Feedback** - Share early, iterate based on feedback

---

## Post-Launch Roadmap

### Version 1.1 (Month 2)

- [ ] More components (10 → 20)
- [ ] Animation support
- [ ] Theme customization
- [ ] Component templates

### Version 1.2 (Month 3)

- [ ] Mobile web components
- [ ] Accessibility improvements
- [ ] Performance optimizations
- [ ] Advanced state patterns

### Version 2.0 (Month 6)

- [ ] 3D visualizations
- [ ] Real-time collaboration
- [ ] Component marketplace
- [ ] No-code UI builder

---

## Team & Resources

### Recommended Team

- **1 Senior Engineer** - Architecture, core implementation
- **1 Mid-level Engineer** - Components, integration
- **1 Junior Engineer** - Testing, documentation
- **1 Designer** (part-time) - Component UX

### Time Allocation

- **Development**: 60%
- **Testing**: 20%
- **Documentation**: 15%
- **Planning/Review**: 5%

### Budget Estimate

- **Engineering**: 6-8 weeks × team size
- **Infrastructure**: Minimal (uses existing AIGNE)
- **Tools**: Open source (no licenses needed)

---

## Conclusion

This plan provides a clear, actionable roadmap for implementing generative UI in AIGNE Framework. By following a phased approach, we can:

1. **Validate** the concept quickly (Weeks 1-2)
2. **Build** essential features (Weeks 3-5)
3. **Polish** for production (Weeks 6-8)

The result will be a production-ready generative UI system that extends AIGNE's capabilities while maintaining its elegance and simplicity.

**Next Steps**:

1. Review plan with stakeholders
2. Set up development environment
3. Start Phase 1: Week 1 tasks
4. Schedule weekly reviews

**Questions?** See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details or [EXAMPLES.md](./EXAMPLES.md) for usage patterns.
