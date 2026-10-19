---
id: zenni-order-tracking
number: "01.3"
title: Zenni Order Tracking
navLabel: Zenni Order Tracking
company: Zenni Optical
context: Zenni Optical
project: Enhanced Order Tracking
domain: Ecommerce, post-purchase
summary: Make order status feel like an answer, not a clue.
role: Senior Product Designer, design lead
timeline: 3 months
platform: [Responsive web]
partners: [Product, Engineering, Content Design, Analytics, Customer Service]
accent: tracking
cover: /images/work/zenni-order-tracking/cover.webp
hero: /images/work/zenni-order-tracking/hero.webp
coverAlt: The shipped Zenni Order Details page in a laptop frame on mint, with the Where is My Order card floating beside it
coverColor: "#8cf0d3"
order: 3
---

With the Account foundation in place, I led the next phase: reframing order tracking around customer confidence, and reducing the need for support without sacrificing core commerce performance. This was Phase 2, and it was possible because <a href="/work/zenni-account/">Phase 1, the Account foundation</a>, had established the structures and design-system patterns it could build on.

<dl class="case-overview">
<div><dt>The problem</dt><dd>Order status and delivery questions were 12.3% of support contacts, about 17,000 a month. The status customers saw was technically accurate, but it didn’t tell them whether things were normal, what came next, or when their glasses would arrive.</dd></div>
<div><dt>My role</dt><dd>I was the UX designer for the Customer Satisfaction squad, working with product managers, a technical program manager, a content designer, engineering, analytics and customer service. I set up the UX working doc and tenets, ran a design jam with the team, owned the messaging framework, and took the design through review and developer handoff.</dd></div>
<div><dt>What I did</dt><dd>I turned the operational record behind every order into a few milestones customers could read at a glance, an explanation of the step they were in, and a messaging framework that works across fulfillment routes, then designed the paths for holds, delays and errors.</dd></div>
</dl>

#### 01 / Impact

Customers needed us less. The business held steady.

<ul class="case-impact" role="list">
<li><p class="case-impact__figure">−0.25<span class="case-impact__unit">pp</span></p><p class="case-impact__label">Chat initiation from Order Details</p><p class="case-impact__note">A drop of 0.25 percentage points against the legacy experience.</p><p class="case-impact__kind">50/50 A/B test</p></li>
<li><p class="case-impact__figure">−0.10<span class="case-impact__unit">pp</span></p><p class="case-impact__label">Chat initiation from the Order List</p><p class="case-impact__note">A drop of 0.10 percentage points, in the same test.</p><p class="case-impact__kind">50/50 A/B test</p></li>
<li><p class="case-impact__figure case-impact__figure--text">Stable</p><p class="case-impact__label">Conversion, average order value and add-to-cart</p><p class="case-impact__note">Exits to help pages decreased modestly.</p><p class="case-impact__kind">50/50 A/B test</p></li>
<li><p class="case-impact__figure case-impact__figure--text">Every route</p><p class="case-impact__label">One messaging framework for all fulfillment paths</p><p class="case-impact__note">New origins and destinations don’t need a redesign. A new lab reuses the logic that’s already there.</p><p class="case-impact__kind">In the developer handoff</p></li>
</ul>

The new experience launched across the US and Canada, and was evaluated in a 50/50 A/B test against the legacy experience. The chat results are changes in percentage points, not relative percentages.

#### 02 / Key decisions

Make complexity useful, not visible.

<ol class="case-decisions">
<li><p class="case-decisions__title"><a href="#42-what-is-happening-a-tracker-for-every-shipment">Show the milestones customers care about, not the operational record</a></p><p>Every shipment gets five milestones, with the active step as the focal point and estimated delivery dates up front, in place of one internal status line and a shipping speed. <a class="case-decisions__more" href="#42-what-is-happening-a-tracker-for-every-shipment">4.2 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#43-what-it-means-and-what-happens-next">Explain the step customers call about, where they see it</a></p><p>A “Where is my Order?” card changes with the milestone. At the en-route step, which gets the most customer service calls, it says what is happening and what comes next. <a class="case-decisions__more" href="#43-what-it-means-and-what-happens-next">4.3 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#44-one-framework-for-every-route">One messaging framework for every route</a></p><p>The tracker keeps the same five steps, and two of them change with the item and the route, so new origins and destinations don’t need new design. <a class="case-decisions__more" href="#44-one-framework-for-every-route">4.4 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#45-plan-for-delays-and-issues">Design for holds, delays and errors, not only the happy path</a></p><p>Templates for orders on hold, data errors, older orders and routes with no delivered step tell customers what is needed and by when. <a class="case-decisions__more" href="#45-plan-for-delays-and-issues">4.5 ↓</a></p></li>
</ol>

<figure class="visual visual--wide">
<img src="/images/work/zenni-order-tracking/shipped-order-details.webp" alt="The shipped Order Details page: a Delivered Thursday, May 14 header for Shipment 1 of 1, a five-step tracker from Order Placed through Manufacturing, En-route to Facility and Shipped to Delivered with a date under each, and a Where is My Order card saying your new specs are on their way, with a Track Order button." loading="lazy" />
<figcaption>Order Details in production, May 2026: the milestone tracker, a layout built around each shipment, and the Where is my Order card. Personal details are hidden.</figcaption>
</figure>

#### 03 / Understanding the problem

The foundation was built. Now we could solve the harder problem.

The squad’s vision was “a frictionless customer experience where self-service is intuitive, support is effortless, and every interaction is a moment of delight.” Its north star was the rate of orders with zero customer support interaction. This initiative focused on one slice of that: reducing “Where is my order?” inquiries, known internally as WISMO.

Customer service had already made the case. In early 2025, order status and delivery questions were 12.3% of support contacts, about 17,000 a month, and 8 to 10% of all customer feedback was dissatisfaction about order status.

##### 3.1 People

<p class="case-insight">Customers weren’t simply asking “Where is my order?”</p>

They had just spent their money on a new pair, and they were excited but also anxious. Underneath the question, they were trying to understand whether what they were seeing was normal, what would happen next, and whether they needed to do something.

<p class="callout">“WISMO??? My order has been sitting in this status for over 5 days!”</p>

The data showed the same anxiety: customers checked their order status multiple times. What they wanted first was when they would get their glasses, in plain human language, with no math and no further investigation needed.

##### 3.2 System

<p class="case-insight">Zenni had the data. The experience didn’t translate it.</p>

Behind every order was a detailed operational record: lens processing, frame assembly and final quality checks in the lab, a bulk shipment to a US facility, then a carrier’s own scan events. The customer saw almost none of it. Order Details showed a single line such as “Manufactured/en Route To Distribution Center”, with “Not Yet Shipped” beside the item and only a shipping speed, not a date.

<figure class="visual visual--wide">
<img src="/images/work/zenni-order-tracking/before-order-details.webp" alt="The legacy Order Details page: the heading Manufactured/en Route To Distribution Center, Shipping method Standard, estimated delivery in 7-14 business days, and a Not Yet Shipped panel saying tracking will appear once shipped." loading="lazy" />
<figcaption>Before: one status line, a shipping speed and “Not Yet Shipped”. Personal details are hidden.</figcaption>
</figure>

Once an order shipped, customers were sent away to a carrier tracking page. It could show “Estimated Delivery Date: Unknown”, even after the package was delivered.

<figure class="visual visual--wide">
<img src="/images/work/zenni-order-tracking/before-carrier-page.webp" alt="The legacy carrier tracking page: a Pre-Transit, In Transit, Out for Delivery, Delivered tracker with Delivered active, and Estimated Delivery Date: Unknown." loading="lazy" />
<figcaption>Before: the carrier page a customer landed on. Tracking number hidden.</figcaption>
</figure>

The emails, the account status and what was actually happening didn’t line up. Working directly with the customer service team, we mapped a common scenario: on day 6, the glasses are in a bulk shipment from the lab to the US, the account says “Manufactured/en Route to Distribution Center”, and no email goes out at all. The customer is thinking “Why haven’t they shipped yet?”, and that is the common point for contacting support.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/zenni-order-tracking/expectation-gap.webp" alt="A timeline from day 0 to day 13: order placed, being made, no email on day 6, shipped on day 7, delivered on day 13. Day 6 is highlighted as when Where is my order? calls come in." loading="lazy" />
<figcaption>Mapping a typical order with customer service showed the expectation gap: on day 6 no email goes out, and that is when “Where is my order?” calls come in.</figcaption>
</figure>

##### 3.3 Gaps

<p class="case-insight">A technically accurate status can still fail the customer.</p>

When the product couldn’t provide enough confidence, customers had an obvious fallback: ask support. Modernizing Account in Phase 1 hadn’t solved that, because the problem wasn’t the interface. It was what the interface chose to say.

<p class="callout">How might we give customers enough clarity and confidence to understand what is happening with their order, without requiring support to explain it?</p>

Every status needed to answer four questions, in order: what is happening, what it means, what happens next, and what I should do. To decide between ideas, we agreed on three UX tenets:

- **Deliver confidence instantly.** Don’t make customers decode information and dig around to find out when they might receive their order.
- **Protect the excitement, eliminate the anxiety.** Be radically transparent about delays, and explain the customization process, because production times vary.
- **No dead ends, always provide value.** Every touchpoint anticipates what the customer needs next.

#### 04 / Making it work

Every status had to answer the customer’s next question.

The challenge wasn’t how much information we could expose. It was deciding which information changed what a customer understood or did next. The work happened in the open, in a UX working doc built from the template I made for the team, with the tenets, an iteration tracker, the messaging framework and recorded walkthroughs. More on that practice in <a href="/work/zenni-working-docs/">UX Working Docs</a>.

##### 4.1 Start with everyone’s mental model

A 20-minute design jam with the whole team.

Before designing, I ran “The 20-Minute Order Tracking Design Jam”. The prompt: a week has gone by since you placed your order and it’s en route to the distribution center. Sketch a tracker. The goal was not a perfect design, but to explore as many ideas as possible and understand each other’s mental models, sketching as the customer.

Ten teammates took part. The follow-up lived in a Slack canvas too: the goal, everyone’s sketches side by side, and an affinity map that grouped the ideas into four themes: information hierarchy and clarity, brand voice and delight, transparency and proactive communication, and friction in the interface. It also kept the open questions in view, like whether people care that something is en route to a distribution center.

<figure class="visual visual--wide">
<div class="doc-pair">
<div class="doc">
<div class="doc__bar" aria-hidden="true"><span class="doc__dots"><i></i><i></i><i></i></span><span class="doc__title"><span>Order Tracking UX Jam</span></span><span class="doc__app">Slack canvas</span></div>
<div class="doc__page"><img src="/images/work/zenni-order-tracking/design-jam-canvas.webp" alt="The Order Tracking UX Jam canvas in Slack: the goal of crowdsourcing the team's mental models of an ideal order tracking experience, the date October 14, 2025, and a Figma board with each participant's tracker sketches in a grid." loading="lazy" /></div>
</div>
<div class="doc">
<div class="doc__bar" aria-hidden="true"><span class="doc__dots"><i></i><i></i><i></i></span><span class="doc__title"><span>Order Tracking UX Jam · Affinity map</span></span><span class="doc__app">Slack canvas</span></div>
<div class="doc__page"><img src="/images/work/zenni-order-tracking/design-jam-affinity.webp" alt="The affinity map further down the same canvas: Order Tracking Brainstorm, the key themes and opportunities from the session. Theme 1, information hierarchy and clarity: users care most about the current status and a few key milestones, with opportunities to prioritize the current status, condense the timeline into four or five steps, clarify language and improve multi-item orders. Theme 2, brand voice, delight and cohesion, with opportunities to inject personality, add visual delights and keep emails consistent." loading="lazy" /></div>
</div>
</div>
<figcaption>The design jam’s follow-up canvas, October 2025: the jam itself, and further down, the affinity map that turned everyone’s sketches into themes. Participant names are hidden.</figcaption>
</figure>

One insight shaped what came next: customers care most about the current status and a few key milestones, so the active step should be the focal point and the timeline should be four or five clear steps. I carried three directions forward: lead with the most important information and keep details a tap away, bring in the brand’s personality, and build trust during delays.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/zenni-order-tracking/first-iteration-mockup.webp" alt="The Order Details page we brainstormed from, in a browser window: order summary, shipping, payment, then a shipment called Crafting Your Glasses to Perfection with two pairs of glasses beside a vertical tracker. The tracker is shown enlarged: Order Received, Crafting Your Glasses to Perfection with a last update that lenses are being cut and fitted and a Learn More button, Making The Journey, Shipped to You, and Delivered, estimated TBD." loading="lazy" />
<figcaption>The tracker we brainstormed from: a vertical timeline with friendlier step names, enlarged on the right.</figcaption>
</figure>

##### 4.2 What is happening: a tracker for every shipment

Five milestones, at a glance, at the top of the order.

<p class="label case-status">Shipped</p>

Every shipment in an order gets its own tracker, similar to the one customer service already used in their workstation. It shows five milestones, so customers can see at a glance where their order is. Each step has three states: not yet started is grey with no date, in progress is half filled with the date it started and a bold label, and complete is a solid bar with the date it finished.

<figure class="visual visual--wide">
<img src="/images/work/zenni-order-tracking/milestone-tracker.webp" alt="A five-step tracker: Order Received and Manufacturing complete, En-route to US Facility in progress and bold, Shipped and Delivered not yet started, with dates under the completed steps." loading="lazy" />
<figcaption>The milestone tracker, with En-route to US Facility in progress.</figcaption>
</figure>

Each shipment leads with its estimated delivery dates. Before, Order Details showed only a shipping speed, so customers jumped between pages and did the math themselves. Orders with more than one shipment now say so plainly, “Shipment 1 of 2”, with a box icon for each.

<figure class="visual visual--wide">
<img src="/images/work/zenni-order-tracking/shipment-header.webp" alt="A shipment header with a box icon: Estimated January 10-12, Rush Delivery 1-4 Business days, Learn more, and Shipment 1 of 2." loading="lazy" />
<figcaption>Each shipment leads with its estimated delivery dates, and says which shipment it is.</figcaption>
</figure>

##### 4.3 What it means, and what happens next

The step customers call about, explained in context.

<p class="label case-status">Shipped</p>

A “Where is my Order?” card sits beside the items and changes with the current milestone. En route to the US facility receives the most customer service calls, so that step says it outright: “Your glasses are in a bulk shipment from our lab to our US facility. We’ll post an update the moment it arrives stateside!” The aim was to make the tracking gap feel expected, not alarming, while keeping the excitement of a new pair.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/zenni-order-tracking/where-is-my-order-widget.webp" alt="Two Where is My Order cards. En-route to US Facility: Your package is on the move, explaining the bulk shipment, with a More Details button. Shipped: Your new specs are on their way, with a Track Shipment button and a USPS tracking number." loading="lazy" />
<figcaption>The Where is my Order card for the en-route and shipped steps.</figcaption>
</figure>

The card opens a details drawer for the current step. During manufacturing, it shows production events such as lens processing, frame assembly and final quality assurance, with where and when they happened. Once shipped, every carrier event appears inside the account page instead of on another site, and the estimated delivery becomes a specific day. The tracking number still links to the carrier for anyone who wants more.

<figure class="visual visual--wide">
<div class="img-grid">
<img src="/images/work/zenni-order-tracking/drawer-manufacturing.webp" alt="Manufacturing details drawer: a photo of a lab technician fitting lenses, then latest updates for final quality assurance, frame assembly and lens processing." loading="lazy" />
<img src="/images/work/zenni-order-tracking/drawer-shipped.webp" alt="Shipped details drawer: estimated delivery Tuesday, January 13, a carrier tracker at Out for Delivery, and the latest carrier updates." loading="lazy" />
</div>
<figcaption>The details drawer during manufacturing and after shipping. Tracking number hidden.</figcaption>
</figure>

##### 4.4 One framework for every route

The copy had to scale with the supply chain.

<p class="label case-status">In the developer handoff</p>

After one of my recorded demos, I received critical feedback from leadership: orders ship from overseas labs and from the US, to customers around the world, and new labs were planned. The copy had to work for every combination. I share early and often, gather feedback, and address it, so this came up two weeks before handoff instead of after launch.

<p class="callout">How might we design a scalable messaging framework that adapts to complex, multi-origin logistics, so every customer feels confident and informed even when their items follow complex global routes?</p>

My answer was a messaging framework built on three principles: new routes shouldn’t need a redesign, labels must match the item’s real status, and the gap between the lab and the last mile can’t be a black box. The tracker always has five steps, and only two of them change:

| Step | What it shows |
|---|---|
| 1 | Order Received |
| 2, fulfillment | Manufacturing for custom and prescription items, Order Processing for stock items |
| 3, middle mile | En-route to US Facility for imports to the US, En-route to Regional Facility for other routes, hidden when the order ships within the US |
| 4 | Shipped |
| 5 | Delivered |

A new lab doesn’t need new design. It follows the same logic as the labs before it.

##### 4.5 Plan for delays and issues

Known problems, designed for before launch.

<p class="label case-status">In the developer handoff</p>

I worked with my PM to identify the known issues and delays, and we captured how the framework would handle each one. The developer handoff included templates for prescription and non-prescription items, e-gift cards, older orders, orders on hold, data errors and routes with no delivered step, across desktop, tablet and mobile, where the tracker turns vertical. On hold mattered most. California law requires a photo of the prescription, so an order on hold says exactly what is needed and by when: “Please upload Rx by April 5th.”

##### 4.6 What we left for later

Some ideas were right, but not yet.

<p class="label case-status">Direction for later phases</p>

Proactive delay messaging, a predictive delivery date once last-mile data could support it, and a state for orders with no estimated date were carried forward as later work.

#### 05 / What it enabled

An answer customers could act on.

<p class="callout">When customers could understand what was happening with their order, they were less likely to need someone at Zenni to explain it.</p>

The interface was Phase 2. The architecture started earlier, in the <a href="/work/zenni-account/">Account foundation</a> that made it possible.
