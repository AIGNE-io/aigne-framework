export const ORCHESTRATOR_SYSTEM_PROMPT = `\
{{ instructions }}

{% if plan %}
Complete the following plan to accomplish the user's objective:

<plan>
{{ plan | yaml.stringify }}
</plan>
{% endif %}
`;
