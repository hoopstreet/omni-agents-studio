# OpenRouter Configuration Guide for Omni-Agents Studio

## Executive Summary

This guide configures OpenRouter for **maximum cost-efficiency, security, reliability, and multi-agent performance** for Omni-Agents Studio. The strategy uses **free models as default** for basic tasks and intelligently escalates to paid models only when task complexity requires it.

**Target Cost Reduction:** 60-70% vs. direct API usage
**Quality Target:** Manus-level accuracy with professional-grade reliability

---

## 1. Model Routing Strategy

### 1.1 Tier-Based Model Selection

#### **Tier 1: Free Models (Default)**
Use for basic tasks, classification, summaries, tagging, extraction, simple reasoning.

| Task | Model | Provider | Cost | Context |
|------|-------|----------|------|---------|
| Chat/Conversation | Gemini 2.5 Flash | Google | Free | 1M tokens |
| Summaries | Llama 3.1 8B | Meta | Free | 8K tokens |
| Classification | Mistral 7B | Mistral | Free | 32K tokens |
| Tagging/Extraction | Groq Mixtral | Groq | Free | 32K tokens |
| Simple Reasoning | Qwen 2.5 3B | Alibaba | Free | 128K tokens |

**Routing Priority:**
```
1. Gemini 2.5 Flash (best quality/speed)
2. Llama 3.1 8B (reliable fallback)
3. Mistral 7B (fast alternative)
4. Groq Mixtral (ultra-fast)
5. Qwen 2.5 3B (large context)
```

#### **Tier 2: Mid-Tier Paid Models**
Use for coding, agent orchestration, RAG, tool use, medium-complexity tasks.

| Task | Model | Provider | Cost/1M | Context |
|------|-------|----------|---------|---------|
| Code Generation | Claude 3.5 Sonnet | Anthropic | $3-5 | 200K tokens |
| Agent Orchestration | GPT-4o | OpenAI | $5-10 | 128K tokens |
| RAG/Knowledge | Gemini 1.5 Pro | Google | $3-5 | 1M tokens |
| Tool Use | Claude 3 Opus | Anthropic | $15 | 200K tokens |
| Medium Reasoning | DeepSeek R1 | DeepSeek | $2-3 | 64K tokens |

**Routing Priority:**
```
1. Claude 3.5 Sonnet (best for code)
2. GPT-4o (best for orchestration)
3. Gemini 1.5 Pro (best for RAG)
4. DeepSeek R1 (best value reasoning)
5. Claude 3 Opus (fallback for complex)
```

#### **Tier 3: Premium Models**
Use ONLY for architecture design, critical reasoning, large-context analysis, debugging, strategic planning.

| Task | Model | Provider | Cost/1M | Context |
|------|-------|----------|---------|---------|
| Architecture | GPT-5 | OpenAI | $15-20 | 128K tokens |
| Critical Reasoning | Claude 3 Opus | Anthropic | $15 | 200K tokens |
| Large Context | Gemini 2 Ultra | Google | $10-15 | 1M tokens |
| Strategic Planning | GPT-5 Turbo | OpenAI | $10-15 | 256K tokens |

**Routing Priority:**
```
1. GPT-5 (best reasoning)
2. Claude 3 Opus (best context)
3. Gemini 2 Ultra (best large-context)
4. GPT-5 Turbo (best planning)
```

---

### 1.2 Task-Based Escalation Rules

```
TASK COMPLEXITY MATRIX:

Simple Tasks (Use Tier 1)
├─ Chat messages
├─ Classification
├─ Summaries
├─ Tagging
├─ Extraction
├─ Simple Q&A
└─ Formatting

Medium Tasks (Use Tier 2)
├─ Code generation
├─ Agent orchestration
├─ RAG queries
├─ Tool use
├─ Multi-step reasoning
├─ Content analysis
└─ Workflow planning

Complex Tasks (Use Tier 3)
├─ Architecture design
├─ Critical reasoning
├─ Large-context analysis
├─ Debugging complex issues
├─ Strategic planning
├─ System design
└─ Security analysis
```

---

### 1.3 Intelligent Escalation Logic

```typescript
// Pseudo-code for escalation
function selectModel(task) {
  const complexity = analyzeComplexity(task);
  const context_length = task.context?.length || 0;
  const requires_reasoning = task.requires_reasoning || false;
  
  // Escalate if needed
  if (complexity === 'simple' && context_length < 8000) {
    return Tier1Model.selectBest();
  }
  
  if (complexity === 'medium' || context_length > 8000) {
    return Tier2Model.selectBest();
  }
  
  if (complexity === 'complex' || requires_reasoning || context_length > 100000) {
    return Tier3Model.selectBest();
  }
}
```

---

## 2. OpenRouter Configuration

### 2.1 Account Setup

1. **Create OpenRouter Account**
   - Visit: https://openrouter.ai
   - Sign up with email or OAuth
   - Verify email address

2. **Generate API Key**
   - Go to: Settings → API Keys
   - Click: "Create New Key"
   - Name: `omni-agents-studio-prod`
   - Copy key and store in `.env`

3. **Set Up Billing**
   - Add payment method (credit card)
   - Set spending limits (see Budget Controls)
   - Enable low-balance alerts

### 2.2 Routing Configuration

**URL:** https://openrouter.ai/workspace/routing

#### **Step 1: Enable Auto Router**
- Toggle: ON
- This allows OpenRouter to choose the best model automatically

#### **Step 2: Set Cost/Quality Balance**
- Slider: Position at **5** (Balanced mode)
  - 0-3: High quality (higher cost)
  - 4-6: Balanced (recommended)
  - 7-10: Low cost (lower quality)

#### **Step 3: Configure Allowed Models**

```
# Tier 1 (Free) - Always allowed
google/gemini-2.5-flash
meta/llama-3.1-8b
mistralai/mistral-7b
groq/mixtral-8x7b
alibaba/qwen-2.5-3b

# Tier 2 (Mid) - Conditional
anthropic/claude-3.5-sonnet
openai/gpt-4o
google/gemini-1.5-pro
anthropic/claude-3-opus
deepseek/deepseek-r1

# Tier 3 (Premium) - Restricted
openai/gpt-5
anthropic/claude-3-opus
google/gemini-2-ultra
openai/gpt-5-turbo
```

#### **Step 4: Set Default Provider Sort**
- Option: **Balanced**
- This prioritizes quality + cost balance

#### **Step 5: Set Fallback Model**
- Default: `google/gemini-2.5-flash`
- Used if primary model unavailable

### 2.3 Provider Configuration (BYOK)

**URL:** https://openrouter.ai/workspace/providers

#### **Recommended Providers to Add**

```
Priority 1 (Must Have):
├─ OpenAI (GPT-5, GPT-4o)
├─ Anthropic (Claude Sonnet, Opus)
└─ Google (Gemini 2.5, 1.5 Pro)

Priority 2 (Highly Recommended):
├─ DeepSeek (R1, V3)
├─ Groq (Mixtral, Llama)
└─ Mistral (7B, Large)

Priority 3 (Optional):
├─ Meta (Llama 3.1)
├─ Alibaba (Qwen)
└─ xAI (Grok)
```

#### **Steps to Add Provider**

1. Go to: Workspace → Providers
2. Click: "Add Provider"
3. Select provider (e.g., OpenAI)
4. Paste API key
5. Click: "Save"
6. Verify: Status should show "Connected"

---

## 3. Security Configuration

### 3.1 Privacy Settings

**URL:** https://openrouter.ai/settings/privacy

#### **Enable Zero Data Retention (ZDR)**

```
Settings:
├─ Non-Frontier: ON
│  └─ Use only ZDR endpoints
├─ Anthropic: ON
│  └─ Disable non-ZDR endpoints
├─ OpenAI: ON
│  └─ Disable non-ZDR endpoints
└─ Google: ON
   └─ Disable non-ZDR endpoints
```

#### **Disable Training on Requests**

```
Settings:
├─ Paid Endpoints May Train: OFF
├─ Free Endpoints May Train: OFF
└─ Free Endpoints May Publish: OFF
```

#### **1% Data Discount**
- Status: OFF (unless explicitly approved by user)
- This prevents OpenRouter from using requests in datasets

### 3.2 Guardrails Configuration

**URL:** https://openrouter.ai/workspace/guardrails

#### **Create Guardrail: "Omni-Agents Studio"**

**Step 1: Basic Info**
- Name: `Omni-Agents Studio`
- Description: `Production guardrail for Omni-Agents Studio with cost controls, security, and model restrictions`
- API Keys: Select all production keys

**Step 2: Policies**

##### **Budget Policies**
```
Daily Budget: $50
Monthly Budget: $1000
Hard Limit: ON (block requests if exceeded)
Low Balance Alert: $10
```

##### **Model & Provider Access**

**Allowed Models:**
```
Tier 1 (Free):
├─ google/gemini-2.5-flash
├─ meta/llama-3.1-8b
├─ mistralai/mistral-7b
├─ groq/mixtral-8x7b
└─ alibaba/qwen-2.5-3b

Tier 2 (Mid):
├─ anthropic/claude-3.5-sonnet
├─ openai/gpt-4o
├─ google/gemini-1.5-pro
├─ anthropic/claude-3-opus
└─ deepseek/deepseek-r1

Tier 3 (Premium):
├─ openai/gpt-5
├─ anthropic/claude-3-opus
├─ google/gemini-2-ultra
└─ openai/gpt-5-turbo
```

**Blocked Models:**
```
├─ Any model not in allowed list
├─ Experimental/Beta models
└─ Models with known issues
```

**Allowed Providers:**
```
├─ OpenAI
├─ Anthropic
├─ Google
├─ DeepSeek
├─ Groq
├─ Mistral
└─ Meta
```

**Blocked Providers:**
```
├─ Unknown/Untrusted providers
├─ Providers without ZDR support
└─ Providers with security issues
```

##### **Prompt Injection Protection**

```
Enable: ON
Messages to Scan: All Messages
Detection Method: Regex + ML

Actions:
├─ User Messages: REDACT
├─ Assistant Messages: WARN
└─ System Messages: BLOCK
```

**Patterns to Block:**
```
├─ "ignore previous instructions"
├─ "system prompt"
├─ "jailbreak"
├─ "override"
├─ "execute code"
└─ "access database"
```

##### **Sensitive Information Detection**

```
Enable: ON

Detect:
├─ API Keys (pattern: ^[a-zA-Z0-9_-]{32,}$)
├─ Passwords (pattern: password|pwd|pass)
├─ Tokens (pattern: token|jwt|bearer)
├─ Secrets (pattern: secret|credential)
├─ Credit Cards (pattern: \d{13,19})
├─ Email Addresses (pattern: [^\s@]+@[^\s@]+\.[^\s@]+)
└─ Phone Numbers (pattern: \d{10,})

Actions:
├─ API Keys: BLOCK + ALERT
├─ Passwords: REDACT + WARN
├─ Credit Cards: BLOCK + ALERT
└─ Other: REDACT
```

**Step 3: Review & Deploy**
- Review all settings
- Click: "Create Guardrail"
- Verify: Status shows "Active"

---

## 4. Budget & Cost Controls

### 4.1 Spending Limits

```
Daily Budget: $50
├─ Soft limit (warning at 80%)
└─ Hard limit (block at 100%)

Monthly Budget: $1000
├─ Soft limit (warning at 80%)
└─ Hard limit (block at 100%)

Per-Model Limits:
├─ Tier 1 (Free): Unlimited
├─ Tier 2 (Mid): $500/month
└─ Tier 3 (Premium): $200/month
```

### 4.2 Cost Optimization Strategy

#### **Estimated Monthly Costs**

```
Scenario 1: Light Usage (10 requests/day)
├─ 95% Tier 1 (Free): $0
├─ 5% Tier 2: ~$5
└─ Total: ~$5/month

Scenario 2: Medium Usage (100 requests/day)
├─ 80% Tier 1 (Free): $0
├─ 15% Tier 2: ~$50
├─ 5% Tier 3: ~$20
└─ Total: ~$70/month

Scenario 3: Heavy Usage (1000 requests/day)
├─ 70% Tier 1 (Free): $0
├─ 20% Tier 2: ~$300
├─ 10% Tier 3: ~$150
└─ Total: ~$450/month
```

#### **Cost Reduction Tactics**

1. **Batch Requests**
   - Group multiple queries into single request
   - Reduces overhead by ~20%

2. **Use Free Models First**
   - Default to Tier 1 for all tasks
   - Only escalate when necessary
   - Saves ~60% vs. direct API usage

3. **Implement Caching**
   - Cache common queries
   - Reduces redundant API calls by ~30%

4. **Monitor Usage**
   - Track cost per agent/task
   - Identify expensive workflows
   - Optimize or restrict as needed

5. **Use Streaming**
   - Stream responses instead of waiting for full completion
   - Reduces token waste by ~15%

---

## 5. Presets for Omni-Agents Studio

### 5.1 Fast Mode (Cheapest)

```json
{
  "name": "Fast Mode",
  "description": "Lowest cost, acceptable quality",
  "cost_quality_balance": 8,
  "default_model": "google/gemini-2.5-flash",
  "allowed_models": [
    "google/gemini-2.5-flash",
    "meta/llama-3.1-8b",
    "mistralai/mistral-7b",
    "groq/mixtral-8x7b",
    "alibaba/qwen-2.5-3b"
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "timeout": 30
}
```

### 5.2 Balanced Mode (Recommended)

```json
{
  "name": "Balanced Mode",
  "description": "Best value, good quality",
  "cost_quality_balance": 5,
  "default_model": "google/gemini-2.5-flash",
  "allowed_models": [
    "google/gemini-2.5-flash",
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o",
    "google/gemini-1.5-pro",
    "deepseek/deepseek-r1"
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "timeout": 60
}
```

### 5.3 Quality Mode (Best Accuracy)

```json
{
  "name": "Quality Mode",
  "description": "Highest accuracy, higher cost",
  "cost_quality_balance": 2,
  "default_model": "anthropic/claude-3.5-sonnet",
  "allowed_models": [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-5",
    "google/gemini-2-ultra",
    "anthropic/claude-3-opus",
    "openai/gpt-5-turbo"
  ],
  "temperature": 0.3,
  "max_tokens": 4000,
  "timeout": 120
}
```

### 5.4 Coding Mode (Code-Optimized)

```json
{
  "name": "Coding Mode",
  "description": "Optimized for code generation",
  "cost_quality_balance": 3,
  "default_model": "anthropic/claude-3.5-sonnet",
  "allowed_models": [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o",
    "deepseek/deepseek-r1",
    "meta/llama-3.1-8b"
  ],
  "temperature": 0.2,
  "max_tokens": 4000,
  "timeout": 120
}
```

### 5.5 Research Mode (Large-Context Reasoning)

```json
{
  "name": "Research Mode",
  "description": "Large context, deep reasoning",
  "cost_quality_balance": 2,
  "default_model": "google/gemini-1.5-pro",
  "allowed_models": [
    "google/gemini-1.5-pro",
    "anthropic/claude-3-opus",
    "openai/gpt-5-turbo",
    "google/gemini-2-ultra"
  ],
  "temperature": 0.5,
  "max_tokens": 8000,
  "timeout": 180
}
```

---

## 6. Implementation Checklist

- [ ] Create OpenRouter account
- [ ] Generate API key
- [ ] Add billing method
- [ ] Configure routing (Auto Router ON, Balance = 5)
- [ ] Add allowed models (Tier 1, 2, 3)
- [ ] Set default model (Gemini 2.5 Flash)
- [ ] Enable Zero Data Retention
- [ ] Disable training on requests
- [ ] Add BYOK providers (OpenAI, Anthropic, Google)
- [ ] Create guardrail "Omni-Agents Studio"
- [ ] Configure budget limits ($50/day, $1000/month)
- [ ] Enable prompt injection protection
- [ ] Enable sensitive data detection
- [ ] Set up low-balance alerts
- [ ] Create presets (Fast, Balanced, Quality, Coding, Research)
- [ ] Test with sample requests
- [ ] Document in team wiki
- [ ] Train team on usage
- [ ] Monitor costs weekly

---

## 7. Environment Variables

```bash
# .env.local
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_COST_QUALITY_BALANCE=5
OPENROUTER_DEFAULT_MODEL=google/gemini-2.5-flash
OPENROUTER_FALLBACK_MODEL=meta/llama-3.1-8b
OPENROUTER_DAILY_BUDGET=50
OPENROUTER_MONTHLY_BUDGET=1000
OPENROUTER_ENABLE_GUARDRAILS=true
OPENROUTER_ENABLE_ZDR=true
OPENROUTER_ENABLE_INJECTION_PROTECTION=true
```

---

## 8. Monitoring & Optimization

### 8.1 Weekly Monitoring

```
1. Check spending vs. budget
2. Identify expensive workflows
3. Review model usage distribution
4. Check for errors/failures
5. Validate security alerts
```

### 8.2 Monthly Optimization

```
1. Analyze cost trends
2. Identify optimization opportunities
3. Adjust model routing if needed
4. Review security incidents
5. Update documentation
```

### 8.3 Quarterly Review

```
1. Assess ROI vs. direct API usage
2. Evaluate new models
3. Update presets
4. Review team feedback
5. Plan improvements
```

---

## 9. Troubleshooting

### Issue: High Costs

**Solution:**
1. Check model distribution (should be 70%+ Tier 1)
2. Enable caching for common queries
3. Reduce max_tokens for simple tasks
4. Review guardrail settings
5. Consider batch processing

### Issue: Slow Responses

**Solution:**
1. Use faster models (Gemini Flash, Groq)
2. Reduce max_tokens
3. Enable streaming
4. Check network latency
5. Consider parallel requests

### Issue: Model Unavailable

**Solution:**
1. Check fallback model is configured
2. Verify provider status
3. Check guardrail restrictions
4. Review allowed models list
5. Contact OpenRouter support

### Issue: Security Alert

**Solution:**
1. Review alert details
2. Check for injection attempts
3. Review sensitive data detection logs
4. Update guardrail rules if needed
5. Notify security team

---

## 10. References

- OpenRouter Docs: https://openrouter.ai/docs
- Model Pricing: https://openrouter.ai/models
- API Reference: https://openrouter.ai/api/v1
- Status Page: https://status.openrouter.ai

---

**Last Updated:** 2026-06-22
**Version:** 1.0
**Status:** Production Ready
