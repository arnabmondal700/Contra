# Contra Clone AI Agent Usage Guide

## Objective

Guidelines for coordinating AI coding agents while building a Contra
(NES) browser clone using Phaser 3 and TypeScript.

## Agent Roles

### Architect Agent

-   Maintains project architecture
-   Reviews interfaces
-   Prevents circular dependencies

### Gameplay Agent

Owns: - Player movement - Weapons - Collisions - Pickups - Score system

### Enemy AI Agent

Owns: - Enemy behavior - Spawn system - Difficulty tuning

### Boss Agent

Owns: - Boss logic - State machines - Attack patterns

### Level Agent

Owns: - Tilemaps - Triggers - Camera logic - Stage scripting

### UI Agent

Owns: - HUD - Menus - Settings - Pause screens

### Audio Agent

Owns: - Music - Sound effects - Volume settings

### Optimization Agent

Owns: - Object pooling - Performance profiling - Rendering optimization

## Planning Mode

Use for: - Architecture - Specifications - Refactoring plans -
Dependency review

Output: - Documentation - Task breakdowns - UML diagrams

No code changes allowed.

## Act Mode

Use for: - Feature implementation - Bug fixes - Tests - Refactoring

Rules: - Modify owned modules only. - Keep changes focused. - Update
documentation.

## Model Routing

Heavy reasoning: - GPT-5.5 - DeepSeek Reasoner

Fast implementation: - DeepSeek Flash - StepFun coding models

## Workflow

1.  Planning Mode
2.  Create implementation plan
3.  Switch to Act Mode
4.  Implement feature
5.  Run tests
6.  Merge changes
7.  Return to Planning Mode

## Commit Format

feat(player): add jump mechanics feat(weapon): implement spread gun
fix(enemy): fix spawn timing issue refactor(audio): simplify manager

## Definition of Done

-   Build passes
-   Tests pass
-   Documentation updated
-   No console errors
-   No FPS regression

## Recommended Development Order

1.  Engine setup
2.  Player controller
3.  Weapons
4.  Enemies
5.  Stage 1
6.  Bosses
7.  Remaining stages
8.  UI
9.  Audio
10. Optimization
11. Release
