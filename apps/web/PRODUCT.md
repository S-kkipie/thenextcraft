# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Builders demonstrate their ability by solving real startup problems. Startup users publish those challenges and review the resulting work.

## Product Purpose

The Next Ship connects a real business challenge to proof-of-work submissions, ranked review, a shortlist, and ultimately hiring. Success is a credible work artifact and a warm hiring path rather than another résumé screen.

## Positioning

The product evaluates builders through solutions to real startup problems. AI handles the heavy comparison work, while startups retain the final hiring decision and authorship is established through human explanation.

## Operating Context

Startups publish challenges with measurable success criteria. Builders submit one public GitHub repository per challenge. Evaluation and ranking happen after submission, and the platform never executes submitted code.

## Capabilities and Constraints

- Convex is the reactive backend and Next.js is the web client.
- GitHub OAuth is used only to establish sign-in identity; private repository access is not requested.
- New identities may exist before a builder or startup role is assigned by a later profile/onboarding flow.
- Challenge states are draft, open, closed, and archived.
- A builder may submit only once per challenge.

## Brand Commitments

The product is named The Next Ship and uses direct, craft-oriented Spanish product language. The incumbent warm-craft interface is the visual authority.

## Evidence on Hand

The repository contains the product concept and flow in the root README, a working Convex data model and API, and an established component/token system in `apps/web`.

## Product Principles

- Proof of work outranks résumé claims.
- Real business outcomes outrank artificial exercises.
- Public, inspectable artifacts keep submissions concrete.
- Automated ranking supports rather than replaces human hiring judgment.
- Authentication should ask only for the access the product currently needs.
