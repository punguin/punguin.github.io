---
id: amazon-relay-load-board
number: "01.1"
title: Amazon Relay Load Board
navLabel: Amazon Relay Load Board
company: Amazon
context: Amazon Middle Mile, Relay
project: Web App Redesign
domain: Middle Mile Operations
summary: Redesigning a freight marketplace for the next stage of growth
role: Design Lead
timeline: 4 Months
platform: [Web, Meridian Design System]
partners: [Product Manager, Engineering, Design System]
accent: tracking
cover: /images/work/amazon-relay-load-board/cover.webp
hero: /images/work/amazon-relay-load-board/hero.webp
coverAlt: The Relay Load Board before and after the redesign, shown as two overlapping browser windows
order: 1
---

I led a four-month redesign of Amazon Relay’s Load Board, reshaping search, filtering, multi-search, load comparison, and booking so carriers could find work with less effort while giving the product a scalable interaction model for continued growth. After launch, US searches per carrier fell 46% while loads per carrier stayed relatively flat.

<dl class="case-overview">
<div><dt>The problem</dt><dd>A search experience designed for a few hundred available loads and six filters was now supporting 100K+ weekly volume, as many as 27K trips at Peak, and 22 filter options, for a carrier base that had grown far more varied.</dd></div>
<div><dt>My role</dt><dd>I partnered closely with the PM as the BRD evolved. I helped design and define the product itself, using research, design exploration, and technical conversations to shape requirements, interaction models, scope, prioritization, and phased delivery.</dd></div>
<div><dt>What I did</dt><dd>The redesign was already in motion when I joined, but the interaction model had not yet converged. The work required more than producing screens: I had to help turn a broad growth problem into a product model the team could align around, test, build, and launch at Amazon scale.</dd></div>
</dl>

#### 01 / Impact

Carriers found and booked work with substantially fewer searches.

<ul class="case-impact" role="list">
<li><p class="case-impact__figure">−46%</p><p class="case-impact__label">Searches per carrier in the US</p><p class="case-impact__note">While loads per carrier remained relatively flat: roughly the same amount of work, booked with substantially fewer searches.</p><p class="case-impact__kind">Measured in production</p></li>
<li><p class="case-impact__figure">−25%</p><p class="case-impact__label">Searches per carrier in the EU</p><p class="case-impact__note">While loads per carrier increased.</p><p class="case-impact__kind">Measured in production</p></li>
<li><p class="case-impact__figure">52%</p><p class="case-impact__label">of US carriers had used multi-search</p><p class="case-impact__note">About 40% used it weekly. In the EU, 65% had used it and roughly 54% were using it every week.</p><p class="case-impact__kind">Measured adoption</p></li>
<li><p class="case-impact__figure">5 of 5</p><p class="case-impact__label">carriers rated the experience 6 or 7 out of 7 for ease</p><p class="case-impact__note">In high-fidelity moderated testing, with no major UX blockers.</p><p class="case-impact__kind">Research finding</p></li>
</ul>

Fewer searches shows carriers finding work with less effort; on its own it is not a measure of marketplace growth. Early US business metrics were mixed, and Product paused the rollout at 50% before continuing to 100% in the US, EU, and Canada in 2023 (see <a href="#46-validation-and-phased-launch">4.6</a>).

#### 02 / Key decisions

The final UI looks straightforward. Getting there required a series of deliberate structural decisions.

<ol class="case-decisions">
<li><p class="case-decisions__title"><a href="#41-separate-primary-search-from-secondary-filtering">Separate viable-work search from secondary filtering</a></p><p>The global search shrank to the minimum criteria that establish viable work, and the growing set of secondary parameters moved into a filter panel beside results. New criteria can be added without breaking the search. <a class="case-decisions__more" href="#41-separate-primary-search-from-secondary-filtering">4.1 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#42-productize-the-workaround-multi-search">Turn carriers’ multi-tab workaround into multi-search</a></p><p>Carriers were already juggling saved searches and browser tabs. Designing multiple active searches into the Load Board let a search stand for a driver, a route or a backhaul. <a class="case-decisions__more" href="#42-productize-the-workaround-multi-search">4.2 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#43-balance-booking-speed-information-density-and-risk">Balance booking speed, information density, and risk</a></p><p>A split-view drawer kept the marketplace in view while carriers inspected a load. Book moved into it, one step deeper, because accidental bookings cost carriers more than a click. <a class="case-decisions__more" href="#43-balance-booking-speed-information-density-and-risk">4.3 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#44-keep-valid-future-needs-visible-without-forcing-them-into-mvp">Design for future marketplace complexity without overloading the MVP</a></p><p>Watching, pinning and other real needs stayed in the product definition, and the foundation left places for them to fit later instead of expanding the first release. <a class="case-decisions__more" href="#44-keep-valid-future-needs-visible-without-forcing-them-into-mvp">4.4 ↓</a></p></li>
</ol>

<figure class="visual visual--wide">
<img src="/images/work/amazon-relay-load-board/comparison-row-mv8kmzss.png" alt="Before: the old Load Board, with rows of search fields and filters across the top and a Book button in every result row. After: a short search bar with origin, radius and equipment, a filter panel beside the results, search tabs, and a load details panel with the Book button." loading="lazy" />
<figcaption>Before and after screenshots of Relay Load Board</figcaption>
</figure>

#### 03 / Understanding the problem

The product had outgrown the interaction model it started with.

A search experience designed for a few hundred available loads and six filters was now supporting 100K+ weekly volume, as many as 27K trips at Peak, and 22 filter options.

Relay had also expanded into new freight types, work types, equipment, facilities, and geographies. The carrier base had broadened from owner-operators with relatively narrow needs to mid-sized businesses coordinating multiple drivers across regions and types of work.

The product still converted well, so the problem was not that Relay had stopped working. The problem was accumulated complexity: years of incremental capabilities had created an inconsistent landing experience, a search model carrying too many responsibilities, and a booking flow that did not always surface critical information before commitment.

The business was still growing. With limited time, budget, engineering capacity, and legacy architecture, the redesign had to improve the current experience without creating another model that would need to be replaced as soon as the next capabilities arrived.

##### 3.1 People

<p class="case-insight">Carriers were not browsing a marketplace. They were continuously assembling work.</p>

Most carriers arrived with meaningful constraints already in mind.

They monitored the Load Board throughout the day, repeated variations of saved searches, booked for multiple drivers, and often focused on particular lanes or kinds of work. Before the redesign, some carriers were already managing several browser tabs at once just to keep different searches and loads in view.

That behavior changed how I thought about the product. A search was not always a disposable query; it could represent a driver, a route, a backhaul, or a piece of work the carrier was actively monitoring.

The default experience, however, often dropped carriers into a generic or inconsistent landing state and then required them to work through a large set of parameters before results became useful.

<p class="callout">Help carriers express the work they are actually available for first, then make the remaining options easier to evaluate.</p>

<figure class="visual visual--inline is-placeholder">
<img src="/images/work/amazon-relay-load-board/placeholder-carrier-behavior.svg" alt="Placeholder: Carrier behavior evidence" loading="lazy" />
<figcaption><span class="todo-tag">Why</span> Makes the new interaction model feel grounded in existing behavior rather than invented from a blank canvas. <span class="todo-tag">Source</span> BRD + research synthesis + XLR review</figcaption>
</figure>

<p class="case-methods"><span class="label">Methods</span> desk research · carrier interviews · existing-experience analysis · competitive review</p>

##### 3.2 System

<p class="case-insight">The redesign needed a foundation, not another layer of features.</p>

The immediate problem was usability. The larger problem was structural.

Search, recommendations, saved searches, Post A Truck, filters, trip details, booking controls, and new programs had accumulated in different parts of the experience. Every additional feature made the underlying model harder to extend.

Working with the PM, I helped organize the product definition into three layers: establish the new foundation, improve the core booking workflow, then expand on that foundation with later capabilities. That framing helped keep valid future needs visible without forcing them all into the MVP.

<p class="label">Foundation → Core workflow → Extension</p>

- **Foundation:** landing/zero state · global search · multi-search · search layout.
- **Core workflow:** trip cards/details · booking flow.
- **Extension:** richer discovery · watch/favorite/pin behaviors · additional personalized experiences.

**I also had to discover which constraints were actually real.** Not all project boundaries were clear when design exploration began. Some constraints were architectural, some were cost decisions, and some became explicit only after product and engineering conversations.

For example, I explored a cleaner top-level navigation model before learning which existing Relay structures could not be removed within this project. Post A Truck eventually became an explicit scope boundary with its own future redesign, while transitions between the experiences still had to be considered.

That pattern repeated throughout the work: explore far enough to understand the better model, then determine what was technically feasible, what was worth changing, and what belonged in later scope.

<figure class="visual visual--wide is-placeholder">
<img src="/images/work/amazon-relay-load-board/placeholder-boundary-discovery.svg" alt="Placeholder: Boundary discovery" loading="lazy" />
<figcaption><span class="todo-tag">Why</span> Demonstrates that the final simplicity came from constraint discovery and negotiation, not from starting with a fixed box. <span class="todo-tag">Source</span> Early iteration + final design</figcaption>
</figure>

##### 3.3 Gaps

<p class="case-insight">The old experience was making one search model carry too much complexity.</p>

The team could keep adding controls, or we could create a model that had somewhere for future complexity to go.

Carriers needed a small set of criteria to define viable work, but the growing product had accumulated 22 parameters. They needed to monitor more than one work context, but the product treated search as one temporary state. They needed richer load information, but navigating away from results interrupted comparison. And they needed booking speed without the risk of making costly mistakes.

The design problem was therefore not one feature. It was how the landing experience, search, filtering, multi-search, details, and booking flow should work together as one coherent system.

<p class="callout">How might we support increasing marketplace complexity without making the experience increasingly complicated?</p>

<figure class="visual visual--wide is-placeholder">
<img src="/images/work/amazon-relay-load-board/placeholder-impact-map.svg" alt="Placeholder: Impact map / product-definition artifact" loading="lazy" />
<figcaption><span class="todo-tag">Why</span> Shows how you moved from a long requirement list toward a coherent interaction model. <span class="todo-tag">Source</span> Impact map + BRD</figcaption>
</figure>

#### 04 / Making it work

Each decision had to survive research, engineering and a growing marketplace.

That meant user research, product scrutiny, engineering constraints, design-system calibration, and the needs of a rapidly growing marketplace.

<p class="label">Product goals</p>

- **Speed** — reduce time and effort to find and book work.
- **Confidence** — surface the information and eligibility constraints carriers need before committing.
- **Flexibility / personalization** — support different drivers, routes, equipment, and work preferences.
- **Scalability** — preserve speed and confidence as Amazon and individual carriers continue to grow.

##### 4.1 Separate primary search from secondary filtering

Search should define viable work. Filters should refine it.

The existing model had grown from six filters to 22. Continuing to place every new criterion into the primary search would make the starting interaction increasingly difficult to understand and increasingly expensive to change.

I reduced the global search to the minimum criteria needed to establish viable work, then moved the expanding set of secondary parameters into a persistent vertical filter panel alongside results.

That created a durable distinction: the primary search answers “What work could fit my operation?” while the filter panel answers “How do I narrow those viable options further?”

The structure was intentionally extensible. New criteria such as certifications, equipment, eligibility, and future program attributes could be added vertically without breaking the core search layout.

All five carriers in high-fidelity testing preferred the sidebar filter pattern and found it easier to discover and customize.

<figure class="visual visual--full is-placeholder">
<img src="/images/work/amazon-relay-load-board/placeholder-search-vs-filters.svg" alt="Placeholder: Primary search vs. filter architecture" loading="lazy" />
<figcaption><span class="todo-tag">Why</span> This is the clearest visual proof of the new information/interaction architecture. <span class="todo-tag">Source</span> GTM page 11 / launched results screenshot</figcaption>
</figure>

##### 4.2 Productize the workaround: multi-search

A search could represent a driver, a route, a backhaul, or another active work context.

Research showed carriers already approximating this behavior through saved-search variations and multiple browser tabs. Rather than treating that as incidental behavior, I designed multiple active search instances directly into the Load Board.

Carriers quickly supplied their own use cases: an outbound load in one search, the return trip in another, and a third search for another truck. Three of five test participants said the tabs would improve booking efficiency.

This became one of the deliberately custom patterns in the redesign. By launch, carriers could keep up to five simultaneous searches in one browser tab, and Relay restored recent search tabs when they returned within 24 hours.

The interaction also had real technical cost. Multi-search increased expected transaction load, so engineering reduced results per page from 100 to 50 after data showed that more than 95% of searches returned fewer than 50 results. We preserved the workflow value while making a data-backed implementation tradeoff.

<figure class="visual visual--wide is-placeholder">
<img src="/images/work/amazon-relay-load-board/placeholder-multi-search.svg" alt="Placeholder: Multi-search as operational model" loading="lazy" />
<figcaption><span class="todo-tag">Why</span> Makes the feature read as a model of real carrier operations rather than a novel tab treatment. <span class="todo-tag">Source</span> Final design + usability testing</figcaption>
</figure>

##### 4.3 Balance booking speed, information density, and risk

Carriers needed to inspect a load without abandoning the marketplace around it.

**Turn load details into a persistent work surface.** I introduced a split-view detail drawer beside the result list. It kept search results visible while giving the selected load enough space for stops, map context, payout, requirements, special services, and actions.

The pattern solved more than navigation. Results could continue refreshing while the carrier inspected details, and critical requirements could be surfaced before booking rather than appearing as a surprise afterward.

All five usability participants preferred reviewing load details in the side panel. I also designed the drawer as a flexible surface rather than a fixed content template so future workflows could extend it without replacing the surrounding information architecture.

That extensibility later became visible publicly: newer Relay workflows, including spot-rate negotiation, use the same split-view idea to introduce new actions while route, payout, stops, map, and load information remain in context.

<figure class="visual visual--wide is-placeholder">
<img src="/images/work/amazon-relay-load-board/placeholder-split-view.svg" alt="Placeholder: Split-view extensibility" loading="lazy" />
<figcaption><span class="todo-tag">Why</span> Demonstrates that the interaction scaffold held up beyond the MVP. <span class="todo-tag">Source</span> Launch screenshot + public Relay Assistant example</figcaption>
</figure>

**Optimize for speed and confidence, not click count.** Sometimes the safer interaction is one step deeper. The original Load Board put Book directly in the result row. That minimized clicks, but accidental bookings could force carriers to reject work and hurt their performance.

Moving Book into the detail panel was debated because speed mattered greatly in a competitive marketplace. We tested the tradeoff rather than resolving it by principle alone.

Carrier feedback leaned toward the new placement: users valued confirming the correct load before committing, and several specifically called out accidental bookings in the existing model. In this case, booking confidence took precedence over absolute minimum interaction count.

<figure class="visual visual--wide is-placeholder">
<img src="/images/work/amazon-relay-load-board/placeholder-speed-vs-confidence.svg" alt="Placeholder: Decision tradeoff: speed vs. confidence" loading="lazy" />
<figcaption><span class="todo-tag">Why</span> Shows judgment: you were not blindly optimizing fewer clicks. <span class="todo-tag">Source</span> BRD 'hotly debated topics' + usability synthesis</figcaption>
</figure>

##### 4.4 Keep valid future needs visible without forcing them into MVP

Not every useful idea belonged in the first release.

Research also surfaced a need to monitor or hold individual loads while waiting for prices to change or confirming with a driver. We explored watchlists, pinning, favorites, pop-out details, and later real-time behaviors.

Those needs were real, but not all were mature enough or essential enough for the MVP. We preserved them in the product definition and designed the foundation so they could be added later rather than expanding the first release indefinitely.

This was part of the project's scalability work: not predicting every future feature, but creating places for likely future behaviors to fit.

##### 4.5 Design system collaboration

I used Meridian as infrastructure, not as the boundary of the solution space.

The design system was still young, and it did not yet have patterns for every problem Relay was encountering.

My approach followed four steps: explore the strongest customer interaction first; move those ideas toward existing Meridian patterns; calibrate directly with the system team through office hours and reviews; then deliberately decide which remaining snowflakes were worth the cost.

The formal design review explicitly asked whether the work adhered to Meridian and where we were 'diverging with intention.' At the time, Meridian had no standard search pattern for this problem space.

Multi-search is a good example. It introduced a custom interaction and additional technical cost, but the carrier behavior, usability evidence, and operational value were strong enough to justify the investment.

<div class="callout"><p class="label">Design-system principle</p><p>Use the system aggressively where it solves the problem. Challenge it deliberately where it does not—and earn the exception with evidence.</p></div>

##### 4.6 Validation and phased launch

The model was scrutinized before it ever reached broad launch.

High-fidelity moderated testing covered the landing experience, search, filtering, load details, booking, and net-new features. All five experienced carriers rated the overall experience 6 or 7 out of 7 for ease, with no major UX blockers.

Testing did not simply validate the concept. It sharpened terminology, time-zone behavior, tab scalability, stop-information priority, booking placement, and confirmation latency. Later production feedback surfaced a small set of responsive-layout and control-placement issues that were folded into Phase 2 and fast-follow work.

The design then moved through internal review, carrier UAT, beta testing, and staged production dial-up so the interaction model could be evaluated with real data, real latency, and different carrier cohorts.

<figure class="visual visual--wide is-placeholder">
<img src="/images/work/amazon-relay-load-board/placeholder-validation-ladder.svg" alt="Placeholder: Validation ladder" loading="lazy" />
<figcaption><span class="todo-tag">Why</span> Makes the amount of scrutiny behind the final UI visible without turning the case study into a process timeline. <span class="todo-tag">Source</span> Research synthesis + XLR notes + GTM</figcaption>
</figure>

The rollout was designed to reduce risk at Amazon scale. The GTM split the experience into phased releases with internal bug bashes, carrier UAT, live beta testing, and gradual public dial-up before full rollout.

The public release began with a small carrier cohort and expanded through percentage-based stages. In the US, Product paused the rollout at 50% when early business metrics were mixed, using the pause to gather a larger sample, review carrier feedback, and distinguish short-term learning effects from more fundamental problems. The core UX held up; the team identified addressable refinements rather than foundational issues, then continued the rollout. The design ultimately reached 100% in the US, EU, and Canada in 2023.

That context matters because the design decisions had to work far beyond a prototype: across real marketplace latency, different operating models, global markets, learning curves, and measurable business risk.

#### 05 / What it enabled

The longer-term value was structural.

Post-launch carrier feedback echoed the research themes: easier multi-location searching, simpler booking, fewer dispatch mistakes, and less risk of overbooking.

Relay explicitly planned to use the redesign as the foundation for more personalized load discovery, including recommendations, suggested reloads, and targeted promotions. The split-view pattern also continued to support newer workflows later.

##### Reflection

The simplicity of the final design was the outcome of complexity, not the absence of it.

The visible features in this redesign are not exotic: a smaller search, a filter panel, tabs, a drawer, a booking action. The difficult work was deciding exactly what each of those structures should be responsible for, what should remain familiar, what needed to be invented, what could scale, and what the organization could realistically build.

This project reinforced the kind of design leadership I do best: create shared understanding in a complicated problem space, help define the product alongside product and engineering partners, make tradeoffs explicit, and carry a coherent interaction model all the way from ambiguity to launch.
