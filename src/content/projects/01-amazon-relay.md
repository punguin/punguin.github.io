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

I turned an in-flight request for a “dynamic home screen” into a new information architecture for the Relay driver app. Within a month of release, product teams were shipping features without coordinating app releases. The framework enabled four major new capabilities in 2022, and drivers kept executing loads at the same rate.

<dl class="case-overview">
<div><dt>The problem</dt><dd>The driver app was built around one rigid trip sequence, and five product teams now needed to add to it without slowing more than a million drivers down.</dd></div>
<div><dt>My role</dt><dd>Responsible and accountable design lead, co-leading with the senior software engineer. UX Research and a senior product manager were consulted.</dd></div>
<div><dt>What I did</dt><dd>Leadership asked for a home screen that also served carriers. The real work was an architecture the team could align on, ship incrementally and keep building on.</dd></div>
<div><dt>What I owned</dt><dd><ul>
<li>Reframed “dynamic home screen” around the information drivers need before work, during work and all the time.</li>
<li>Argued for a consistent structure over a home screen that reshuffles itself.</li>
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
<li><p class="case-decisions__title"><a href="#42-keep-one-stable-structure-instead-of-a-home-screen-that-reshuffles-itself">Keep one stable structure instead of a home screen that reshuffles itself</a></p><p>“Dynamic” became a card framework ordered by priority and disruption: a home screen drivers can rely on, with a place for each team’s content. <a class="case-decisions__more" href="#42-keep-one-stable-structure-instead-of-a-home-screen-that-reshuffles-itself">4.2 ↓</a></p></li>
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

In a team brainstorm, we plotted ideas by user value against feasibility and extensibility, and chose one to explore.

<figure class="visual rating-table">
<div class="rating-table__head"><p class="rating-table__title">Evaluating four approaches</p><p class="rating-table__kind">Qualitative ratings</p></div>
<table>
<thead><tr><th scope="col">Concept</th><th scope="col">User value</th><th scope="col">Feasibility</th><th scope="col">Extensibility</th></tr></thead>
<tbody>
<tr><th scope="row">Generic cards</th><td><span class="rating" data-level="3"><span class="visually-hidden">High</span><i></i><i></i><i></i></span></td><td><span class="rating" data-level="1"><span class="visually-hidden">Low</span><i></i><i></i><i></i></span></td><td><span class="rating" data-level="2"><span class="visually-hidden">Medium</span><i></i><i></i><i></i></span></td></tr>
<tr class="is-selected"><th scope="row"><strong>Persona-specific cards</strong><span class="rating-table__pick">Selected</span></th><td><span class="rating" data-level="3"><span class="visually-hidden">High</span><i></i><i></i><i></i></span></td><td><span class="rating" data-level="2"><span class="visually-hidden">Medium</span><i></i><i></i><i></i></span></td><td><span class="rating" data-level="3"><span class="visually-hidden">High</span><i></i><i></i><i></i></span></td></tr>
<tr><th scope="row">Dynamic cards</th><td><span class="rating" data-level="2"><span class="visually-hidden">Medium</span><i></i><i></i><i></i></span></td><td><span class="rating" data-level="1"><span class="visually-hidden">Low</span><i></i><i></i><i></i></span></td><td><span class="rating" data-level="1"><span class="visually-hidden">Low</span><i></i><i></i><i></i></span></td></tr>
<tr><th scope="row">Schedule-based</th><td><span class="rating" data-level="1"><span class="visually-hidden">Low</span><i></i><i></i><i></i></span></td><td><span class="rating" data-level="2"><span class="visually-hidden">Medium</span><i></i><i></i><i></i></span></td><td><span class="rating" data-level="2"><span class="visually-hidden">Medium</span><i></i><i></i><i></i></span></td></tr>
</tbody>
</table>
<figcaption>Low to high. Ratings show where each concept sat on the team's brainstorm charts, not measured scores.</figcaption>
</figure>

##### 4.1 Organize the app around information, not steps

Planning and executing work are not linear. They happen at the same time.

<p class="label case-status">Shipped in the first release</p>

The object map became the structure. Drivers used to see one trip at a time. Now one schedule shows the current trip, upcoming work and any stop’s details.

Stop details holds the “all the time” information: what, where and when, pick-up and drop-off, load IDs, contacts and requirements such as safety equipment. The first release matched the existing trips experience, with room for carrier details and programs like Global Mile and Amazon Freight.

<figure class="visual visual--inline">
<img class="is-mockup" src="/images/work/amazon-relay/stop-details-vision.webp" alt="Stop details wireframes for a driver and a carrier, organized by what, where and when, with a sticky task and carrier-specific sections." loading="lazy" />
<figcaption>Stop details for a driver and a carrier: the same structure, with persona-specific content.</figcaption>
</figure>

After launch, a contextual inquiry showed drivers using pick-up and drop-off IDs from stop details at check-in. Load IDs and check-in information had been among the reasons drivers called support.

##### 4.2 Keep one stable structure instead of a home screen that reshuffles itself

The home screen should orient drivers, not do the heavy lifting.

<p class="label case-status">Shipped in the first release</p>

The project began as a “dynamic home screen”, and part of my job was helping the team define what dynamic should mean for drivers. We talked through a home screen that adapts its content to each driver, and I shared what I’d seen in the field: drivers want to get in and out, and many owner-operators also work with other companies, so a predictable layout would serve them better than one that changes.

I started a weekly show and tell to keep everyone close to the work. Seeing the existing design beside a more standard home screen layout helped the team and managers weigh options together, and it built the shared confidence behind the new structure.

The home screen became a curated set of cards: the current task first, then past and future loads and other useful content. Cards lead into each capability, and the work happens elsewhere. It is **focused** on the most important task, **organized** so status shows consistently, and **curated**: it summarizes, it doesn’t execute.

Account and menu, a row of widgets, then cards, some shared and some per persona. Each persona’s team decides its cards, so one framework shows a driver their current trip and a carrier their load board.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/amazon-relay/persona-cards.webp" alt="Card sets grouped by persona: standard cards such as learning center, Relay tips and support; driver cards such as current trip, safety score, calendar and eLog; carrier cards such as trips, load board and performance score; and hostler cards such as assignments, calendar and safety score." loading="lazy" />
<figcaption>Persona-based cards: standard cards for everyone, plus driver, carrier and hostler cards.</figcaption>
</figure>

Instead of reshuffling, content is ordered by priority and disruption, with alerts at the top.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/amazon-relay/priority-disruption.webp" alt="Chart plotting home screen content by priority against disruption: cancellations and account alerts at the top, then weather alert, vehicle status, current trip, hours of service, calendar, safety score, learning center and Relay tips toward the bottom." loading="lazy" />
<figcaption>Content order by priority and disruption, from alerts at the top to tips at the bottom.</figcaption>
</figure>

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

In testing with 8 drivers, all valued the extra content, statuses and weather, and 7 reached stop information. But 3 struggled to start work, 3 to find trips, and 3 to reach a future stop.

<blockquote>“I end up having to wait for my loads a lot of times and I like that I can check on my drive score and training in the app while I wait.”</blockquote>

So I brought back familiar patterns, a “start” button and the word “Trips”, then moved the screens into Meridian’s visual language.

<figure class="visual visual--inline">
<img class="is-mockup" src="/images/work/amazon-relay/home-states.webp" alt="Two home screen states for a driver named Taylor: in the yard waiting for a load, and in transit, each with the current stop, arrival times, a Resume work button and the driver’s schedule." loading="lazy" />
<figcaption>Home screen states: the current stop card shows whether the driver is in the yard or in transit.</figcaption>
</figure>

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
