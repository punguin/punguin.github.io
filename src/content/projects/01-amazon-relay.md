---
id: amazon-relay
number: "01.1"
title: Amazon Relay Mobile
navLabel: Amazon Relay Mobile
company: Amazon
context: Amazon Middle Mile, Relay
project: Mobile App Redesign
domain: Middle Mile Operations
summary: Helping truck drivers execute loads more efficiently and confidently
role: Design Lead
timeline: 4 Months
platform: [iOS, Android, Meridian Design System]
partners: [Senior Software Engineer, Product Manager, UX Research]
accent: relay
cover: /images/work/amazon-relay/cover.webp
hero: /images/work/amazon-relay/hero.webp
coverAlt: Three Relay for Drivers screens in phone frames on lavender, showing the redesigned home screen at the yard, the in-transit view and the tasks concept
coverColor: "#c9c1fb"
order: 1
---

I led a new information architecture for the Relay driver app, built around a predictable, persona-based home screen that lets drivers get in and out with minimal effort. Within a month of release, product teams were shipping features without coordinating app releases. The framework enabled four major new capabilities in 2022, and drivers kept executing loads at the same rate.

<dl class="case-overview">
<div><dt>The problem</dt><dd>The driver app was built around one rigid trip sequence, and five product teams now needed to add to it without slowing more than a million drivers down.</dd></div>
<div><dt>My role</dt><dd>Responsible and accountable design lead, co-leading with the senior software engineer. UX Research and a senior product manager were consulted.</dd></div>
<div><dt>What I did</dt><dd>Leadership asked for a home screen that also served carriers. The real work was an architecture the team could align on, ship incrementally and keep building on.</dd></div>
<div><dt>What I owned</dt><dd><ul>
<li>Organized the app around the information drivers need before work, during work and all the time.</li>
<li>Shaped a predictable, persona-based home screen so drivers can find what they need quickly.</li>
<li>Defined the card, persona and priority model other teams build on.</li>
<li>Set feature parity as the first-release bar, wrapping the existing workflow instead of replacing it.</li>
<li>Set the long-term direction for tasks and stop details, and contributed patterns back to Meridian.</li>
</ul></dd></div>
</dl>

#### 01 / Impact

Drivers kept their pace, needed less help, and the platform could grow.

<ul class="case-impact" role="list">
<li><p class="case-impact__figure">17%</p><p class="case-impact__label">of loads needed a support call, down from 30%</p><p class="case-impact__note">Including fewer calls about load IDs and check-in information.</p><p class="case-impact__kind">Measured after launch</p></li>
<li><p class="case-impact__figure case-impact__figure--text">Steady</p><p class="case-impact__label">Completed tours per hour</p><p class="case-impact__note">The same as the week before launch.</p><p class="case-impact__kind">Measured after launch</p></li>
<li><p class="case-impact__figure case-impact__figure--text">Within a month</p><p class="case-impact__label">Product teams released features on their own</p><p class="case-impact__note">Without coordinating new app releases.</p><p class="case-impact__kind">Organizational outcome</p></li>
<li><p class="case-impact__figure">4</p><p class="case-impact__label">major new capabilities in 2022</p><p class="case-impact__note">Global Mile containers, identity, weather notifications and drive score, at lower design and engineering cost.</p><p class="case-impact__kind">Capability enabled</p></li>
</ul>

In the beta, 13 drivers rated the new screens 6.31 out of 7 for ease (SEQ). Moving to Meridian also made the UI more consistent and accessible.

#### 02 / Key decisions

The final screens look simple. A few structural decisions got them there.

<ol class="case-decisions">
<li><p class="case-decisions__title"><a href="#41-organize-the-app-around-information-not-steps">Organize the app around information, not steps</a></p><p>Drivers already knew their jobs. The structure follows the objects they work with (schedule, trip, stop, load), so information is reachable at any point, not only at one step. <a class="case-decisions__more" href="#41-organize-the-app-around-information-not-steps">4.1 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#42-use-predictable-persona-based-cards">Use predictable, persona-based cards</a></p><p>A card framework ordered by priority and disruption gives drivers a home screen they can rely on, and gives each team a place for its content. <a class="case-decisions__more" href="#42-use-predictable-persona-based-cards">4.2 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#43-wrap-the-existing-workflow-instead-of-replacing-it">Wrap the existing workflow instead of replacing it</a></p><p>The first release changed the structure around the execution workflow, not the workflow, so drivers kept their pace. <a class="case-decisions__more" href="#43-wrap-the-existing-workflow-instead-of-replacing-it">4.3 ↓</a></p></li>
</ol>

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/amazon-relay/before-after.webp" alt="Before: the old Relay trips screen with a map and a single Begin work button. After: the redesigned home screen, a weekly schedule, and the current stop screen." loading="lazy" />
<figcaption>Before and after: the old trips screen next to the new home screen, schedule and current stop.</figcaption>
</figure>

#### 03 / Understanding the problem

The app had outgrown the workflow it was built around.

Relay connects carriers to Amazon’s freight network. Its driver app launched in 2017 for picking up and dropping off loads, with about 10,000 drivers. By 2022 it had more than a million, covered trip planning, navigation, inspections and electronic logging, and served new sites and equipment, from post offices and airports to box trucks and containers.

Five dev teams now contributed to an app one team had built for a narrow use case, and leadership wanted it to serve carriers and dispatchers too. But every new capability had to squeeze into one rigid trip sequence. Engineering proposed a federated plugin model so each team could own its home screen widgets, and asked for a dynamic home screen for any user type. I drove the work with my dev counterpart from discovery to design, bringing PM and stakeholders along through workshops and reviews.

##### 3.1 People

<p class="case-insight">Drivers did not need step-by-step instructions. They needed information.</p>

I audited the app, interviewed stakeholders, reviewed feedback and data, interviewed drivers and rode along with one to Amazon and shipper warehouses. Drivers checked in with paperwork in one hand and a phone in the other.

What changed my thinking:

- The app’s workflows didn’t always match the real workflow at a site.
- Drivers didn’t need step-by-step instructions. Every step in the app was extra work.
- Information wasn’t always accurate, so drivers relied on workarounds, tribal knowledge and the Relay driver community.
- Being on time drives their performance, so they often arrive hours early. The day is hurry up and wait.
- They didn’t want unrelated messages, but did want quick access to training.

<figure class="visual visual--wide">
<div class="img-grid img-grid--3">
<img src="/images/work/amazon-relay/field-study-1.webp" alt="Field study photo: a driver checking in at a shipping window with a phone and paperwork." loading="lazy" />
<img src="/images/work/amazon-relay/field-study-2.webp" alt="Field study photo: a driver photographing a bill of lading in the cab." loading="lazy" />
<img src="/images/work/amazon-relay/field-study-3.webp" alt="Field study photo: a driver reviewing trip information at the wheel." loading="lazy" />
</div>
<figcaption>From the field study: checking in at a shipping window, capturing a bill of lading, and reviewing trip information in the cab.</figcaption>
</figure>

Drivers think about information in three dimensions: before work, during work and all the time. The old app handled the first two. It struggled with the third, which matters most when things go wrong, like needing a shipper’s reference number or a document from an earlier stop.

<p class="callout">Give drivers the information about their work whenever they need it, instead of walking them through steps they already know.</p>

<p class="case-methods"><span class="label">Methods</span> app audit · stakeholder interviews · ride-along · field study · driver interviews · journey mapping</p>

##### 3.2 System

<p class="case-insight">One linear workflow could not absorb new users and use cases.</p>

With the senior software engineer, I mapped the existing experience end to end. From the trips card, drivers entered a linear sequence of uniquely named screens with overlapping content. Each had one action forward, or a back button out to the trips card and “Resume work”.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/amazon-relay/existing-design.webp" alt="Map of the existing Relay workflow: home, begin work, register vehicle, then a repeating drive and task sequence for each stop, with screenshots of the old screens below." loading="lazy" />
<figcaption>The existing experience, mapped with engineering: one fixed sequence of screens per stop.</figcaption>
</figure>

That caused what we saw in the field: information scattered across screens and hard to reach outside the current step. A later trip information card was a patch, and there was no place for training or capabilities like drive score.

The code had the same shape: tightly coupled, expensive to extend, with one team as a bottleneck. As engineering built a federated foundation, the UX needed a matching structure. Resources were limited because the project was seen as technical, the MVP had to ship ahead of the year’s roadmap, yard procedures were unpredictable, and there was resistance to change.

##### 3.3 Gaps

<p class="case-insight">The app was organized around steps. Drivers think about stops.</p>

A journey mapping session I facilitated aligned the team on two themes:

1. Drivers need more information about their stops.
2. Drivers need that information whenever they need it.

<figure class="visual visual--wide">
<img src="/images/work/amazon-relay/journey-map.webp" alt="Journey map of a driver’s daily workflow, with rows for stages, doing, goals, feelings, pain points and opportunities across planning, driving to the yard, pre-trip, driving, yard execution and end of trip." loading="lazy" />
<figcaption>The driver journey map, from planning the day before to the end of the trip.</figcaption>
</figure>

An object mapping session then aligned us on drivers’ own nouns: a driver has a schedule, a schedule has trips, a trip has stops, and each stop has a location, a time and loads. The structure came from drivers’ language, not screens.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/amazon-relay/object-map.webp" alt="Object map: driver, schedule, trip, stop and load connected by has-one and has-many relationships, with vehicle, task, location, status and scheduled time." loading="lazy" />
<figcaption>Object mapping: the nouns of a driver’s work and how they relate.</figcaption>
</figure>

<p class="callout">How might we help drivers execute all loads more efficiently and with more confidence?</p>

Rebuilding the execution workflow would have added risk without closing the gap that mattered most: access to information. So the first release focused on the home screen, schedule and stop details, and sticky tasks became direction for later.

#### 04 / Making it work

Extensibility mattered as much as feasibility.

<p class="label">Tenets</p>

- **Driver safety first.** Low-touch, hands-free in normal scenarios.
- **Generic but flexible.** Scale without extra development or a worse experience.
- **Incremental improvements.** Smaller improvements, more often.

<p class="label">Project goals</p>

- **Usability.** Information when drivers need it, so they call support less.
- **Consistency.** Migrate to the Meridian design system.
- **Scalability.** A foundation that onboards new programs and use cases easily.
- **Parity.** Drivers execute loads at the same rate.

<p class="label">Concept evaluation</p>
<p class="concept-eval__title">We chose flexibility over the easiest path to implementation.</p>

In a team brainstorm, we explored four concepts and evaluated them against user value, feasibility, and extensibility. Persona-specific cards weren’t the easiest to build, but offered the strongest long-term flexibility for the app to grow.

<figure class="visual rating-table">
<p class="rating-table__title">Concept comparison</p>
<table>
<thead><tr><th scope="col">Concept</th><th scope="col">User value<span>How well it meets drivers' needs</span></th><th scope="col">Feasibility<span>Relative effort to implement</span></th><th scope="col">Extensibility<span>Ability to support future capability</span></th></tr></thead>
<tbody>
<tr><th scope="row"><div class="rating-table__concept"><img src="/images/work/amazon-relay/concept-generic.webp" alt="" width="102" height="162" loading="lazy" /><div><strong>Generic cards</strong><span class="rating-table__desc">Same card structure for all drivers.</span></div></div></th><td data-label="User value"><span class="rating" data-level="2"><span class="visually-hidden">2 of 3</span><i></i><i></i><i></i></span></td><td data-label="Feasibility"><span class="rating" data-level="1"><span class="visually-hidden">1 of 3</span><i></i><i></i><i></i></span></td><td data-label="Extensibility"><span class="rating" data-level="2"><span class="visually-hidden">2 of 3</span><i></i><i></i><i></i></span></td></tr>
<tr class="is-selected"><th scope="row"><div class="rating-table__concept"><img src="/images/work/amazon-relay/concept-persona.webp" alt="" width="102" height="162" loading="lazy" /><div><strong>Persona-specific cards</strong><span class="rating-table__desc">Cards tailored to different driver needs and contexts.</span><span class="rating-table__pick">Selected</span></div></div></th><td data-label="User value"><span class="rating" data-level="3"><span class="visually-hidden">3 of 3</span><i></i><i></i><i></i></span></td><td data-label="Feasibility"><span class="rating" data-level="2"><span class="visually-hidden">2 of 3</span><i></i><i></i><i></i></span></td><td data-label="Extensibility"><span class="rating" data-level="3"><span class="visually-hidden">3 of 3</span><i></i><i></i><i></i></span></td></tr>
<tr><th scope="row"><div class="rating-table__concept"><img src="/images/work/amazon-relay/concept-dynamic.webp" alt="" width="102" height="162" loading="lazy" /><div><strong>Dynamic cards</strong><span class="rating-table__desc">Content adapts based on real-time conditions.</span></div></div></th><td data-label="User value"><span class="rating" data-level="2"><span class="visually-hidden">2 of 3</span><i></i><i></i><i></i></span></td><td data-label="Feasibility"><span class="rating" data-level="1"><span class="visually-hidden">1 of 3</span><i></i><i></i><i></i></span></td><td data-label="Extensibility"><span class="rating" data-level="1"><span class="visually-hidden">1 of 3</span><i></i><i></i><i></i></span></td></tr>
<tr><th scope="row"><div class="rating-table__concept"><img src="/images/work/amazon-relay/concept-schedule.webp" alt="" width="102" height="162" loading="lazy" /><div><strong>Schedule-based</strong><span class="rating-table__desc">Organized around a driver’s scheduled timeline.</span></div></div></th><td data-label="User value"><span class="rating" data-level="1"><span class="visually-hidden">1 of 3</span><i></i><i></i><i></i></span></td><td data-label="Feasibility"><span class="rating" data-level="3"><span class="visually-hidden">3 of 3</span><i></i><i></i><i></i></span></td><td data-label="Extensibility"><span class="rating" data-level="2"><span class="visually-hidden">2 of 3</span><i></i><i></i><i></i></span></td></tr>
</tbody>
</table>
</figure>

<aside class="decision-callout">
<span class="decision-callout__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/><path d="M12 1v0M4 4l1 1M20 4l-1 1M2 11h1M21 11h1"/></svg></span>
<div>
<p class="decision-callout__label">Design decision</p>
<p class="decision-callout__title">Invest in a more extensible foundation now to support product growth later.</p>
<p>Persona-specific cards gave us a way to surface the most relevant information for different driver needs, while creating a foundation that could support new capabilities without reworking the homepage.</p>
</div>
</aside>

<p class="case-note">The scores above are transcribed from the mockup, which used illustrative ratings rather than validated quantitative measurements.</p>

##### 4.1 Organize the app around information, not steps

Planning and executing work are not linear. They happen at the same time.

<p class="label case-status">Shipped in the first release</p>

The object map became the structure. Drivers used to see one trip at a time. Now one schedule shows the current trip, upcoming work and any stop’s details.

<p class="concept-eval__title">Stop details became the home for always-needed information.</p>

Stop details held the information drivers needed again and again: what, where, and when, plus pickup and drop-off details, load IDs, contacts, and site requirements. The first release stayed close to the existing trips experience, while leaving room to expand for carrier details and programs like Global Mile and Amazon Freight.

<figure class="visual screen-compare">
<div class="screen-compare__grid">
<div class="screen-compare__col">
<p class="screen-compare__pill">MVP</p>
<p class="screen-compare__title">Stop details</p>
<p class="screen-compare__sub">Feature parity</p>
<div class="screen-compare__phone"><img src="/images/work/amazon-relay/stop-details-mvp.webp" alt="MVP stop details: current stop MIA 1 with address, in transit status, arrive by and depart by times, then pick up type and load ID, and a Resume work button." width="375" height="763" loading="lazy" /></div>
</div>
<span class="screen-compare__arrow" aria-hidden="true"></span>
<div class="screen-compare__col">
<p class="screen-compare__pill is-future">Future</p>
<p class="screen-compare__title">Stop details</p>
<p class="screen-compare__sub">Enhanced details + sticky task</p>
<div class="screen-compare__shot">
<div class="screen-compare__phone"><img src="/images/work/amazon-relay/stop-details-future.webp" alt="Future stop details: a photo of the site, address and times, a road construction notice, Details, Documents and Notes tabs with check in, pick up trailer and check out sections, and a sticky task card at the bottom with Drive to MIA1 and Get directions." width="428" height="1264" loading="lazy" /></div>
<ol class="screen-compare__notes">
<li style="--at: 10%"><strong>Richer context</strong> Photos, map and on-site notes help drivers prepare.</li>
<li style="--at: 45%"><strong>Tabs for deeper details</strong> Organized sections for details, documents and notes.</li>
<li style="--at: 88%"><strong>Persistent next action</strong> A sticky task keeps the next step in reach as drivers scroll.</li>
</ol>
</div>
</div>
</div>
<figcaption>Stop details for drivers and carriers used the same structure, with persona-specific content.</figcaption>
</figure>

<aside class="decision-callout">
<span class="decision-callout__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><rect x="5" y="13" width="3.2" height="6" rx="1.2"/><rect x="10.4" y="9" width="3.2" height="10" rx="1.2"/><rect x="15.8" y="5" width="3.2" height="14" rx="1.2"/></svg></span>
<div>
<p class="decision-callout__label">After launch</p>
<p>A contextual inquiry later showed drivers referencing pick-up and drop-off IDs from stop details at check-in. Load IDs and check-in information were among the reasons drivers called support.</p>
</div>
</aside>

##### 4.2 Use predictable, persona-based cards

The home screen should orient drivers, not do the heavy lifting.

<p class="label case-status">Shipped in the first release</p>

The project started as a “dynamic home screen”: depending on what a driver was doing, the app would adapt and surface the information we expected to be most valuable in that moment. The idea was appealing: show drivers only what they need for the task at hand. In practice, there was no reliable way to anticipate what a driver would be dealing with on the road. Field research also showed that drivers want to check the app quickly and get back to driving, and many owner-operators work with other companies too.

Rather than decide the direction on my own, I explored the problem with the team. We evaluated the dynamic approach alongside the alternatives, and I set up a weekly design review to keep everyone close to the work. Comparing the existing design with a more conventional home screen helped the team and managers weigh the trade-offs together. Working through the problem as a group led us to a consistent, predictable home screen that everyone stood behind.

The home screen became a curated set of cards: the current task first, then past and future loads and other useful content. Cards lead into each capability, and the work happens elsewhere. It is **focused** on the most important task, **organized** so status shows consistently, and **curated**: it summarizes, it doesn’t execute.

Account and menu, a row of widgets, then cards, some shared and some per persona. Each persona’s team decides its cards, so one framework shows a driver their current trip and a carrier their load board.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/amazon-relay/persona-cards.webp" alt="Card sets grouped by persona: standard cards such as learning center, Relay tips and support; driver cards such as current trip, safety score, calendar and eLog; carrier cards such as trips, load board and performance score; and hostler cards such as assignments, calendar and safety score." loading="lazy" />
<figcaption>Persona-based cards: standard cards for everyone, plus driver, carrier and hostler cards.</figcaption>
</figure>

<p class="concept-eval__title">Homepage content was prioritized by urgency and disruption.</p>

We ranked homepage content by two dimensions: how important it was for drivers to see, and how disruptive it was to their work. The most urgent and disruptive items were placed at the top of the homepage.

<figure class="visual">
<img class="is-mockup" src="/images/work/amazon-relay/priority-map.webp" width="2703" height="1895" alt="Homepage content plotted by priority against disruption. A path runs from Bottom, past safety score, calendar and current trip, up to Top. Cancellation, account alert and weather alert, marked in red, sit at the top with vehicle status; hours of service sits in the middle; safety score, the learning center and Relay tips sit lowest." loading="lazy" />
</figure>

<aside class="decision-callout">
<span class="decision-callout__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="m3 13 9 5 9-5"/></svg></span>
<div>
<p class="decision-callout__label">Design implication</p>
<p>Alerts surface first. Less urgent, less disruptive content appears lower on the homepage.</p>
</div>
</aside>

<figure class="visual visual--full">
<img class="is-mockup" src="/images/work/amazon-relay/home-variations.webp" alt="Wireframe variations of the home screen for a driver (current trip active, no current trip, weather alert, trip cancellation), a carrier, and an owner-operator who switches between both." loading="lazy" />
<figcaption>One home screen framework, different views: driver, carrier, and an owner-operator switching between them.</figcaption>
</figure>

Moving the UI to Meridian made it consistent with the rest of Relay. Where Meridian lacked a pattern drivers needed, I worked with the design system team and contributed one back.

##### 4.3 Wrap the existing workflow instead of replacing it

The first release changed the structure around the workflow, not the workflow itself.

<p class="label case-status">Shipped in the first release</p>

Drivers had to keep their pace, feedback on the existing app was good, and engineering was two people. So the first release made the smallest change that bought flexibility. The new home screen, schedule and current stop sit in front of the old workflow, “Continue load” hands drivers into screens they know, and they can get back to their information at any point.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/amazon-relay/mvp-flow.webp" alt="Three flow diagrams side by side: the existing linear flow, the MVP flow with new home, schedule and stop details screens, and the future flow." loading="lazy" />
<figcaption>Existing, MVP and future flows. New screens are marked in blue; the MVP keeps the execution steps intact.</figcaption>
</figure>

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/amazon-relay/current-stop-handoff.webp" alt="The new current stop screen, with its Continue load button connected by arrows to the four screens of the existing execution workflow." loading="lazy" />
<figcaption>The current stop hands off to the existing execution workflow, so the first release kept full parity.</figcaption>
</figure>

<p class="label">User testing</p>
<p class="concept-eval__title">User testing showed where the new model helped, and where it broke familiar patterns.</p>

We ran a moderated usability study of the first iteration with 8 drivers.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/amazon-relay/user-testing.webp" width="3309" height="1610" alt="Four screens from the first iteration with test results. Start of day home screen: 8 of 8 drivers valued the added content, like statuses and weather, and one said “I like that I can check my drive score and training while I wait”, but 3 of 8 struggled to start their work. Schedule: 3 of 8 struggled to find their trips. Schedule, expanded: 3 of 8 struggled to reach a future stop. Current step: 7 of 8 reached stop information." loading="lazy" />
</figure>

<aside class="decision-callout">
<span class="decision-callout__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/><path d="M19 3v4M17 5h4"/></svg></span>
<div>
<p class="decision-callout__label">Design response</p>
<p>I brought back familiar patterns, a <strong>Start</strong> button and the label <strong>Trips</strong>, then moved the screens into Meridian’s visual language.</p>
</div>
</aside>

##### 4.4 Keep the long-term vision visible without forcing it into the MVP

Drivers should always know where they are in their work, wherever they are in the app.

<p class="label case-status">Direction for later phases</p>

The long-term strategy added “sticky” tasks. Tasks used to take over the app. In the vision, a task sticks to the bottom of any non-modal screen and expands when needed, so drivers always see their load and step while reaching anything else.

<figure class="visual visual--inline">
<img class="is-mockup" src="/images/work/amazon-relay/sticky-task.webp" alt="Layout wireframe with a sticky task at the bottom of the screen, showing task instructions, context and an action, on any non-modal screen: home, trip, schedule and stop details." loading="lazy" />
<figcaption>The sticky task sits at the bottom of any non-modal screen.</figcaption>
</figure>

One task anatomy (stop, instructions, action, link to stop details) covers a shipper warehouse, an Amazon warehouse or a post office.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/amazon-relay/task-workflows.webp" alt="Three workflows built from sticky tasks: a third-party shipper warehouse, an Amazon warehouse and a post office, each a sequence of task cards from driving to the site to checking out." loading="lazy" />
<figcaption>Workflow examples: a third-party shipper warehouse, an Amazon warehouse and a post office.</figcaption>
</figure>

<figure class="visual visual--wide">
<img src="/images/work/amazon-relay/long-term-vision.webp" alt="Long-term vision boards for the home screen, sticky tasks and stop details, including card types and driver home screen states." loading="lazy" />
<figcaption>The long-term vision: home screen, sticky tasks and stop details.</figcaption>
</figure>

##### 4.5 Validation and launch

The structure was tested with drivers before and after it shipped.

Of 13 beta drivers, 12 were satisfied with stop details, 11 with the schedule and 10 with the home screen. They asked for a map, their block or trip number for ELD devices, and total miles. A contextual inquiry with 5 drivers found some use a phone and a tablet, and 3 missed the “Load Ready” notification.

The work ran from November 2021 to handoff in February 2022. After beta fixes it went to general availability at 1%, with a plan to reach 100% over the following weeks.

#### 05 / What it enabled

The model has kept absorbing new use cases.

Other teams could now build on the architecture. Driver feedback was positive, a work stream formed to consolidate shared views across Relay’s carrier and driver products, and phase 2 planned vehicle pairing, weather and smart support.

In a driver’s public video, the home screen keeps the same structure, now with a “Find work” card for load board and contract search.

<figure class="visual visual--inline">
<img style="max-width: 320px" src="/images/work/amazon-relay/in-the-wild.webp" alt="The Relay home screen in use, with a current stop card for San Diego and a Start work button, a My schedule card with two upcoming trips, and a new Find work card linking to Search Load Board and Search Contracts." loading="lazy" />
<figcaption>In the wild, from a driver’s public video: a new Find work card plugged into the same home screen.</figcaption>
</figure>

The full vision was never built. Amazon weighed it against the existing business, and not every right decision for users makes it above the line. It wasn’t wasted work, though: it changed how Relay thought about its architecture.

##### Reflection

Understand the boundaries first, then explore freely.

I start with engineering to learn the real boundaries, explore freely inside them with the team, then choose what moves forward by impact, time and resources.

On Relay, the most valuable decision was structural and mostly invisible: organizing the app around the objects drivers work with, leaving room for the next persona, program or team, and shipping it in front of the existing workflow without slowing drivers down.
