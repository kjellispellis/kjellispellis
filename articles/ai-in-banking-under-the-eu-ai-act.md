# AI in banking under the EU AI Act

*The high-risk deadline moved to December 2027. What the Act asks of lenders did not. For anyone buying credit software this year, the decisive question turns out to be architectural.*

On 27 July 2026, six days before the EU AI Act's high-risk obligations were due to bite, Regulation (EU) 2026/1744, the Digital Omnibus on AI, entered into force and moved the date. Standalone high-risk systems under Annex III, the category that contains creditworthiness assessment, now apply from 2 December 2027. AI embedded in products already covered by EU product-safety law moves to 2 August 2028.

The reaction in most banks was relief, followed by quiet reprioritisation. That is understandable and it is a mistake. Sixteen extra months is not a reprieve. It is the last window in which a lender can still change how its credit process is built, rather than write documentation around what it already has.

## What moved, and what did not

The Omnibus is mostly a deferral. It does make targeted easings elsewhere: the AI literacy duty in Article 4 becomes an obligation to support literacy rather than to ensure it, Article 6 gains exclusions for systems used purely for non-safety purposes, and fines for SMEs and small mid-caps are capped at the lower of the two limits rather than the higher. What it leaves alone is the part that costs money. The risk management, data governance, technical documentation, logging, human oversight and accuracy requirements in Articles 9 to 15 are intact, and so are the deployer duties in Article 26 and the conformity assessment and registration machinery behind them.

Two things did land this summer and neither was deferred.

The first is Article 50. Transparency obligations for AI that interacts directly with people apply from 2 August 2026. If a person is talking to your system, they have to know it is a system. Generative output has to carry machine-readable marking, with a grace period to 2 December 2026 for generative systems already on the market before August. Market surveillance authorities can act on Article 50 breaches now, and the ceiling is €15 million or 3% of worldwide annual turnover.

The second is that the enforcement apparatus itself switched on. Penalties and supervisory powers, including over general-purpose models, are live across all 27 member states.

There is also a deadline this year that has nothing to do with the AI Act and lands on the same processes. The revised Consumer Credit Directive, Directive (EU) 2023/2225 or CCD2, applies in full from 20 November 2026. Where a creditworthiness assessment rests on automated processing, including profiling, the consumer gets the right to request human intervention, to obtain a meaningful explanation of the assessment, to state their view and to contest the outcome. The explanation has to cover the main variables, the logic and the risks in the processing. That is a product requirement in the origination flow, not a policy document.

For a European lender, then, "the AI Act was postponed" is the wrong summary of late 2026. The conversational layer is regulated now. The consumer's right to an explanation follows in November. The heavy regime, the one that lands on the credit assessment itself, arrives in December 2027.

## Why credit is the sharpest case in banking

Annex III, point 5(b) classifies AI systems intended to evaluate the creditworthiness of natural persons or to establish their credit score as high-risk. The drafting is worth reading closely, because three boundaries in it decide a great deal.

It covers natural persons. A model assessing corporate counterparties sits outside 5(b), whatever else applies to it under prudential rules. It excludes systems used to detect financial fraud, which is why the same neural network can be routine in one part of the bank and high-risk in another. And it attaches to the use, not the licence: being a supervised credit institution neither triggers nor exempts you.

The trap is scope creep inside your own estate. If a model produces a score, a feature, a ranking or a recommendation that an underwriter then acts on, supervisors and commentators have consistently read that as within 5(b). "A human signs it off" has never been a reliable defence, and after the Court of Justice's ruling in *SCHUFA* (C-634/21) it is weaker still: a probability score produced by one party and relied on heavily by another was held to be an automated individual decision under Article 22 GDPR in its own right. Preparatory does not mean out of scope.

## The clause that sets your cost base

Article 6(3) is the most consequential provision in the Act for a lending architecture, and it is the one least often discussed in board papers.

It allows a provider to conclude that a system sitting in an Annex III category is not high-risk, where the system does not pose a significant risk of harm and where one of four conditions holds: it performs a narrow procedural task; it improves the result of a previously completed human activity; it detects deviations from prior decision-making patterns without replacing or influencing the human assessment; or it performs a preparatory task to the relevant assessment.

The Commission's guidance gives recognisable examples. Turning unstructured data into structured data. Classifying incoming documents. Detecting duplicate applications. Polishing the language of a decision a human has already drafted. File indexing and search.

Read that list next to a loan origination process and the shape of the problem becomes clear. Document extraction from an employment contract or a tax return is a narrow procedural task. Pre-filling an application from a conversation is a preparatory task. Drafting the credit file summary for a case handler to review improves the result of a completed human activity. Assigning the applicant a probability of default is none of these things.

Two constraints keep this honest. There is a carve-out that overrides all four conditions: a system in an Annex III category is always high-risk where it performs profiling of natural persons. And the derogation is not free. The provider has to document the assessment before the system goes into service and still register itself and the system in the EU database. Parliament and Council refused the Commission's proposal to drop that registration step; it survived with lighter information requirements.

The derogation is narrow, and how much of it survives contact with a national supervisor will depend on guidance that is still settling. But the direction it points is unambiguous, and it is architectural. Whether your AI capability lands inside or outside the high-risk perimeter depends on where the decision boundary sits in your system, and on whether you can demonstrate the boundary rather than assert it.

## The reassurance, and the part of it that is false

Banks tend to assume the AI Act means a second compliance universe. On 21 November 2025 the European Banking Authority told the Commission otherwise. Its mapping exercise across banking and payments legislation found no significant contradictions between the AI Act and CRR/CRD, DORA, CCD2, the Mortgage Credit Directive and the EBA's own guidelines, and concluded that the AI Act is complementary to a framework that already governs these risks. The EBA saw no immediate need for new guidelines.

The Act itself carries this through in Article 17(4): for providers that are financial institutions already subject to internal governance requirements under Union financial services law, the quality management system obligation is deemed satisfied by complying with those rules, save for three specific points. The requirements in Articles 9 and 10 sit close to ground that CRD Article 74 and the CRR internal-model articles already cover.

The genuine conclusion is that the work is extension, not duplication. Model risk management, credit policy governance and the DORA ICT framework are the right homes for AI Act obligations, and a bank that has those in decent order is further along than it thinks.

The false conclusion is that this makes the AI Act cheap. Three things are new.

Supervision is now plural. A credit institution using a high-risk system answers to its financial supervisor and to the AI Act's market surveillance regime, and the EBA itself flagged supervisory cooperation as the open question. Two authorities asking about the same model at different times of year is a governance cost even when the answers are identical.

The evidence has to be produced, not assembled. Article 12 requires automatic logging over the lifetime of the system. Article 26 requires deployers to keep those logs for at least six months. Article 86 gives an affected person the right to a clear and meaningful explanation of the role the AI system played in a decision that affects them. And Article 27 requires a fundamental rights impact assessment from deployers of creditworthiness systems specifically, not only from public bodies. Private lenders reading summaries of the Act miss that one regularly. None of that is satisfiable by a quarterly report compiled by hand.

And the provider question cuts across procurement. Under Article 25, a deployer becomes the provider of a high-risk system, with the full weight of Article 16 obligations, if it puts its own name or trademark on that system, substantially modifies it while it remains high-risk, or changes its intended purpose such that it becomes high-risk. For a bank that white-labels a vendor's scoring capability under its own brand, or fine-tunes it materially, that is a transfer of regulatory liability effected by a branding decision. Buy versus build has acquired a regulatory dimension it did not have three years ago.

## Four questions for the architecture

For a CTO or a chief architect scoping the work, the Act reduces to four questions about the system rather than about the policy.

**Where is the decision boundary, and can you show it to someone hostile?** In a credit process where approval and rejection are governed by explicit rules (affordability thresholds, debt-to-income limits, collateral requirements, segment and country policy) the decision is an artefact you can point at, version, simulate and defend. In a process where the decision is learned by a model, the decision is a behaviour, and every question about it becomes a research project. This is the difference between one regulatory object and another.

**Can you produce the case record without starting a project?** The realistic test has nothing to do with whether the data exists somewhere. Ask instead whether a named person can pull the complete history of a single case (who did what, when, which third-party data was retrieved, which rule version applied, what the AI component contributed) in an afternoon rather than a quarter. Articles 12, 26 and 86, CCD2's explanation right and your existing audit function all resolve to that same capability.

**Who is the provider of each system, and does the contract say so?** Answer it per system, before someone answers it for you by launching a rebranded model. Article 25 makes this a design and procurement decision jointly, and the Act's value chain provisions expect the upstream provider to give you what you need to hold up your end.

**Can you replace the model without touching the policy?** Model vendors change, capabilities improve, prices move, and a model you deploy today will not be the one you run in 2029. If your credit logic is entangled with a specific model, every swap is a policy change, often an invisible one, and every swap re-opens your conformity position. If the logic is separate, a model swap is a supplier decision. This is the most underrated question on the list and the one with the longest tail.

## Where AI actually belongs in a credit process

Lending is a process rather than a decision: intake, document interpretation, affordability analysis, decision, disbursement, servicing. Read that sequence against Article 6(3) and the AI Act turns out to be broadly aligned with where AI earns its keep anyway.

The high-value work sits in the parts of origination that are expensive because they are manual and unstructured. Extracting and validating structured data from an employment contract or a set of accounts, and flagging the discrepancies. Collecting a complete application through conversation, so an applicant who would have abandoned a twelve-field form finishes it and the call centre never hears about it. Surfacing the things a case handler on a borderline commercial file would want to know: household debt concentration, unused collateral, a valuation that has gone stale. Drafting the summary that goes into the credit file for a human to check and own.

Every one of those is a candidate for the Article 6(3) derogation, and none of them requires the model to decide anything. The decision stays deterministic, encoded in policy, versioned and tested before it reaches production. Put crudely: AI-assisted, not AI-decided. Read as a compliance posture, that sounds like caution. It is really the only version of the architecture in which the credit team keeps control of the loan book, which is why it would be the right answer with or without the Act.

This is the case Stacc set out in [*AI in loan origination: the case for credit-native AI*](https://www.stacc.com/research/ai-in-loan-origination-the-case-for-credit-native-ai): the decision should be explicit, the architecture durable, and AI fitted to specific points in the process where it pays for itself. The Digital Omnibus has not changed that argument. It has given banks sixteen months to act on it.

## What this means for Stacc Flow

Stacc Flow orchestrates the credit process in BPMN and expresses decision rules in DMN. That choice was made for engineering reasons, years before the AI Act existed, and it happens to produce most of what the Act now asks for as a by-product.

Because the process is a BPMN model, the path a case took is a fact about the system rather than a reconstruction. Because the rules are DMN, credit policy is a versioned artefact that the credit team edits, simulates and stages, with a complete change history behind it. The Stacc Credit Decision Engine, one of eight vendors named by Gartner® as a Sample Vendor for credit decision engines in the Hype Cycle™ for Bank Lending, 2025, has an editor and a simulator for exactly that purpose. Every case carries a full audit trail, and a report detailing every step, including who did what, when, and which third-party data was retrieved, is generated rather than assembled. The platform is SOC 2 Type 2 attested and ISO 27001 and ISO 9001 certified, with a live trust centre.

Against that substrate, AI is a plugin in the precise sense. Document Intelligence reads and validates the documents. The Lending AI Agent conducts the application by chat or voice and hands structured, decision-ready data to the process. Decision support surfaces analysis for advisors on the cases where judgement is actually required. Each of them attaches at a defined point in a BPMN-defined process, produces output that the rules validate, and leaves a trace. None of them moves the decision boundary. When a better model arrives, it replaces a module, not a policy.

The Article 50 obligations that are live now are a useful illustration of the difference. Telling an applicant that they are talking to an AI, at the start of the interaction, is a small change in one module when the conversational layer is a component of an orchestrated process. It is six separate projects when the chatbot was bolted onto six channels.

And on the buy-versus-build axis, Flow was built as a modular platform precisely so institutions can choose how much they build and how much they buy. That flexibility now carries a regulatory consequence worth being deliberate about: which components you brand as your own, and which you modify substantially, determines whether you are the deployer or the provider of a high-risk system under Article 25.

## Using the sixteen months

None of this requires a programme. It requires four decisions and one piece of engineering discipline.

Inventory AI by use, not by tool. The unit of classification under the Act is the system and its intended purpose, so a single model can appear in your register three times with three different classifications. Fraud detection, corporate scoring and consumer creditworthiness are three answers, not one.

Write the Article 6(3) assessments now, for the capabilities you intend to keep outside the perimeter. Doing it while the architecture is still movable means the assessment can come out clean. Doing it in late 2027 means writing a justification for something you can no longer change, and the profiling carve-out is not negotiable.

Settle provider and deployer roles per system, in contracts, before a branding decision settles them for you.

Ship the two things that are already due: Article 50 disclosure in every interface where a person meets a model, and the CCD2 explanation and human-intervention path in consumer origination, before 20 November.

Then make the record automatic. If the case history, the rule version and the AI component's contribution are all produced by the process itself, the December 2027 regime is largely a documentation exercise over evidence you already hold. If they are not, no amount of lead time will be enough, because the work does not scale. It has to be repeated for every case, every model change and every supervisor.

The deadline moved. The architecture decision is the same one it was in July, and it is still open.

---

### Key dates

| Date | What applies |
| --- | --- |
| 2 February 2025 | Prohibited practices (Article 5) and AI literacy |
| 2 August 2025 | GPAI obligations; governance and penalty provisions |
| **2 August 2026** | **Article 50 transparency; enforcement and penalties fully applicable** |
| **20 November 2026** | **CCD2 applies in full, including the creditworthiness explanation and human-intervention rights** |
| 2 December 2026 | Article 50(2) marking for generative systems already on the market |
| **2 December 2027** | **Annex III high-risk obligations, including creditworthiness assessment** |
| 2 August 2028 | High-risk AI embedded in products under Annex I |

### Sources

- Regulation (EU) 2026/1744 (Digital Omnibus on AI), OJ 24 July 2026, in force 27 July 2026
- Regulation (EU) 2024/1689 (AI Act), Articles 5, 6, 9–15, 17, 25, 26, 27, 50, 86, 99 and Annex III
- Directive (EU) 2023/2225 (CCD2), Article 18
- EBA, *Outcome of the AI Act mapping exercise*, letter to the European Commission, 21 November 2025
- CJEU, Case C-634/21 *SCHUFA Holding (Scoring)*, 7 December 2023
- Gartner, *Hype Cycle™ for Bank Lending, 2025*, 28 July 2025

Gartner does not endorse any vendor, product or service depicted in its research publications and does not advise technology users to select only those vendors with the highest ratings or other designation. Gartner research publications consist of the opinions of Gartner's research organisation and should not be construed as statements of fact. Gartner and Hype Cycle are registered trademarks and service marks of Gartner, Inc. and/or its affiliates in the U.S. and internationally and are used herein with permission. All rights reserved.

This article describes the regulatory position as at 20 August 2026 and is not legal advice.
