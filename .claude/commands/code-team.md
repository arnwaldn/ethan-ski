# Commande: /code-team

## Description
Lance l'equipe de coding multimodal (Vision + Code + Execution).
Transforme des images/mockups en code fonctionnel execute en sandbox.

## Usage
```
/code-team [input] [options]
```

## Types d'Input

### Image/Screenshot
```bash
/code-team "C:/screenshots/leetcode.png"
/code-team "C:/mockups/dashboard.png"
```

### Description Textuelle
```bash
/code-team "Write a function to find longest palindrome"
/code-team "Create a React component for user profile card"
```

### Mixte (Image + Description)
```bash
/code-team "C:/mockups/form.png" "Add validation and dark mode"
```

### URL (Capture et analyse)
```bash
/code-team --url="https://example.com/login"
```

## Workflow

### Phase 1: Vision Agent
```yaml
model: Gemini 2.0 Flash
input: Image/Screenshot
output:
  - Problem statement
  - Requirements extracted
  - Constraints identified
  - Examples detected
```

### Phase 2: Coding Agent
```yaml
model: Claude Opus 4.5
input: Structured requirements
output:
  - Optimized code
  - Type hints
  - Documentation
  - Edge case handling
```

### Phase 3: Execution Agent
```yaml
tool: E2B Sandbox
input: Generated code
output:
  - Execution logs
  - Results
  - Generated files
  - Explanation
```

## Output Format

```markdown
# Code Team Result

## Problem Extracted
[Description from image analysis]

## Solution

### Code
```python
[Generated code with documentation]
```

### Complexity
- Time: O(n)
- Space: O(1)

## Execution Results

### Logs
```
[Execution output]
```

### Result
[Final result or generated files]

### Explanation
[Agent explanation of what happened]

## Files Generated
- output.html
- styles.css
```

## Options

```bash
--lang=[python|javascript|typescript]  # Force language
--no-execute    # Skip execution phase
--save          # Save code to file
--tests         # Generate tests too
--optimize      # Focus on optimization
```

## Exemples Concrets

### LeetCode Problem
```bash
/code-team "C:/screenshots/two-sum.png"

# Output:
# - Analyse du probleme Two Sum
# - Code Python optimise O(n)
# - Execution avec test cases
# - Resultat valide
```

### UI Mockup
```bash
/code-team "C:/mockups/login-form.png" --lang=typescript

# Output:
# - Composant React LoginForm
# - Validation Zod
# - Styles Tailwind
# - Fichiers generes
```

### Algorithm Challenge
```bash
/code-team "Implement quicksort with visualization" --execute

# Output:
# - Implementation quicksort
# - Visualisation ASCII
# - Execution avec array test
```

## MCPs Utilises
- Vision: mcp__figma__, mcp__desktop-automation__
- Execution: mcp__e2b__run_code
- Files: mcp__filesystem__

## Integration
- Self-Check apres execution
- Patterns sauvegardes dans Hindsight
- Apprentissage des solutions
