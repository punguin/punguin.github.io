---
id: zenni-account
number: "01.2"
title: Zenni Account
navLabel: Zenni Account
company: Zenni Optical
context: Zenni Optical
project: My Account Redesign
domain: Ecommerce
summary: Build the foundation before the feature.
role: Lead UX Designer (solo)
timeline: 3 months UX, 4 months implementation
platform: [Responsive web, Design system]
partners: [Product Manager, UX Manager, Engineering, Design System]
accent: account
cover: /images/work/zenni-account/cover.webp
coverAlt: The redesigned Zenni My Account dashboard, with a left navigation panel, Zenni Rewards status and recent orders
order: 2
---

<figure class="visual visual--wide">
<img src="/images/work/zenni-account/after-dashboard.webp" alt="The redesigned My Account dashboard: a navigation panel grouped into Account, Rewards, Settings and Help and Support, a Zenni Rewards card with tier progress and points, and recent orders as cards with Order Details and Print FSA Receipt buttons." loading="lazy" />
<figcaption>The redesigned My Account dashboard. Personal details are hidden.</figcaption>
</figure>

I modernized a fragmented account experience while establishing reusable product patterns and a healthier working relationship between product design and the design system.

<aside class="case-aside">
<p class="label">Phase 1 of 2</p>
<p>This foundation made the next phase possible: <a href="/work/zenni-order-tracking/">Enhanced Order Tracking</a>.</p>
</aside>

<aside class="case-aside">
<p class="label">My role</p>
<p>I was the lead, and only, UX designer on the redesign, partnered with a product manager, my UX manager, engineering and the design system team. The work wasn’t on a company roadmap when I started, so part of my job was showing leadership a new account experience that was worth investing in. I led it in the open, through shared Slack canvases where the decisions were made and recorded.</p>
</aside>

#### 00 / Context

Barebones account pages, a new brand, and a new priority.

Zenni’s Account management pages were barebones. That reflected the organization’s historical prioritization of metrics outside direct revenue, such as average order value.

Two things made this the moment to change that. First, branding had unveiled new brand and marketing guidelines: a major visual overhaul, and a single voice, tone and vibe for how Zenni wanted to be perceived. The website wasn’t up to that standard, which led to a new design system being created while major sections of the site were redesigned at the same time.

Second, Zenni’s leadership changed. A new leader made a “best-in-class foundation” a major organizational goal for 2025. My UX manager saw the opportunity and assigned me to Account before it was on the roadmap. I started in November 2024.

<figure class="visual visual--wide">
<img src="/images/work/zenni-account/legacy-dashboard.webp" alt="The legacy My Account dashboard: a plain text navigation of Zenni links, then stacked sections for account settings, Zenni Rewards points, a text list of orders, payment methods and the address book, each with a Manage button." loading="lazy" />
<figcaption>The legacy dashboard, November 2024. Personal details are hidden.</figcaption>
</figure>

#### 01 / People

Customers thought of Account as one place. The product did not.

Zenni’s Account experience had evolved as a collection of pages, built at different times for different needs.

The customer mental model was simple: “My account is where I manage my relationship with Zenni.” Customers did not care that orders, prescriptions, payment methods, profile information, and other capabilities came from different domains.

What they came to Account to do was concrete. I tested the design against scenarios like these:

- An order placed a week ago is in transit, and the customer needs an estimate of when it will arrive.
- One pair in an order is on Rush service and the others are on Standard, and the customer needs to confirm the arrival date for each.
- The customer needs to know when their prescription was last updated, to decide whether to see an eye care provider before their next order.
- The customer needs to know what Rewards credit they have for their next purchase, and how long they have to use it.
- The customer lost their return label and needs to print it again.

Customer service added one more. A top customer request was to show frame size prominently in order history, so customers could use it as a reference when buying their next pair.

<p class="callout">My account is where I manage my relationship with Zenni.</p>

#### 02 / System

The design system was part infrastructure, and part working relationship.

Different pages had different structures, data, states, actions, and technical histories. I identified patterns that should become shared foundations: navigation, hierarchy, cards, responsive layouts, status, and actions.

I also advocated for the product-designer workflow. Where did the system accelerate the work? Where did it create friction? When should a product team extend a pattern, and how should that learning return to the system?

- **Shared structure.** Navigation, hierarchy, cards, responsive layouts.
- **Reusable behavior.** Status and action patterns.
- **How we work.** Contribution, feedback, ownership, and flexibility.

The navigation showed how the pages had grown. The legacy navigation grouped pages under labels like Order Management and Personalization, alongside features such as TryOn, Shared Images and Vision Test. It described how the business had built Account more than what customers came to do.

#### 03 / Gaps

Modernizing the UI wasn’t enough.

Individual pages worked, but the experience wasn’t operating as a coherent system. At the same time, the new design system was taking shape and Account needed room to evolve. Simply reskinning the existing pages would have reproduced today’s constraints in tomorrow’s interface.

<p class="callout">How do we modernize today’s experience without designing ourselves into another corner tomorrow?</p>

Not every gap belonged in the first release. The MVP focused on the structure and the patterns every Account page shared. Store credit, international support, enhanced order tracking and favorites were set aside as later work that the foundation needed to make room for.

#### 04 / Design

Consistency was not the same thing as sameness.

The organization needed reusable foundations without forcing every product problem into the same template.

I established common structure and reusable interaction patterns while preserving room for domain-specific needs. The consequential decisions were not always visually dramatic: what became reusable, what stayed specific, and how the system could support capabilities we had not designed yet.

##### 4.1 Organize Account around what customers manage

One navigation, grouped the way customers think.

<p class="label case-status">Shipped in the first release</p>

The new navigation panel groups Account into Account, Rewards, Settings, and Help and Support. On desktop it is visible on every Account page, so customers always know where they are and can move between orders, prescriptions and settings without starting over. Shared Images was hidden from the interface.

<figure class="visual visual--wide">
<img src="/images/work/zenni-account/navigation-ia.svg" alt="Two lists side by side. Before: My Account, Zenni Rewards, Order Management and Personalization groups, with TryOn, Shared Images and Vision Test, then loose links. After: Account, Rewards, Settings, and Help and Support groups." loading="lazy" />
<figcaption>Account navigation before and after the redesign.</figcaption>
</figure>

##### 4.2 Turn order history into a list and a detail

Orders answer the most questions, so they got the most structure.

<p class="label case-status">Shipped in the first release</p>

I started with a low-fidelity order history in which each order is a card and each item opens an item details panel, so customers can check status, track a shipment, buy again or start a return without losing their place.

<figure class="visual visual--wide">
<img src="/images/work/zenni-account/wireframe-order-history.webp" alt="Low-fidelity wireframe: an order history with order cards grouped by estimated delivery date, each item with its status, and an item details drawer with Buy it again, Get help with this item, Start a return and Print return label." loading="lazy" />
<figcaption>An early wireframe of order history and the item details panel, November 2024.</figcaption>
</figure>

The shipped Orders page and Order Details follow the same structure. The item details panel later made room for the customer service request: frame measurements, with a “Shop this size” action.

<figure class="visual visual--wide">
<img src="/images/work/zenni-account/after-orders.webp" alt="The Orders page: tabs for Last 6 Months, 2026, 2025, 2024 and earlier, and an order card with order date, items, total, Print Receipt and Order Details, the delivered item and its USPS shipment." loading="lazy" />
<figcaption>Orders, filtered by time period. Order and tracking numbers are hidden.</figcaption>
</figure>

<figure class="visual visual--wide">
<img src="/images/work/zenni-account/after-order-details.webp" alt="Order Details with the item details panel open: the frame image, Retired and Write a Review buttons, delivery status, and a Frame Measurements diagram with lens width, bridge, temple length and a Shop this size button." loading="lazy" />
<figcaption>Order Details with the item details panel and frame measurements. Personal details are hidden.</figcaption>
</figure>

##### 4.3 Build a pattern once, then use it everywhere

The address form was the clearest case.

<p class="label case-status">Shipped in the first release</p>

The Add and Edit Address modal was designed to be used throughout the entire site, not only in Account. I grounded it in Baymard’s checkout research: an address validator that customers can override and that highlights its suggested changes, a single full-name field, Address Line 2 behind a link, and city and state detected from the ZIP code.

The same thinking produced shared patterns for empty states, such as no orders yet or a brand new account, and for error and success feedback, so each Account page didn’t invent its own.

##### 4.4 Remove what doesn’t save customers time

Fewer options, when the options didn’t help.

<p class="label case-status">Shipped in the first release</p>

Some decisions were removals. Customers can’t set PayPal, Google Pay or Apple Pay as a default payment method, because that doesn’t actually save them time at checkout. A “claim 50 points” button that wasn’t compliant came out of communication preferences. Confusing referral copy was rewritten, and when a customer deletes their default address, they are asked to choose a new one.

##### 4.5 Leave room for capabilities we hadn’t designed yet

A useful foundation does not predict every future feature. It gives future teams better choices.

<p class="label case-status">Direction for later phases</p>

We knew Orders had room to become much more useful. I structured the foundation so later iterations could support richer status, progressive information, contextual actions and more sophisticated post-purchase communication. Work after the MVP included store credit, frame measurements, international support and enhanced order tracking.

#### Building with the design system

I was designing a system at the same time as the design system.

The new design system was barebones when Account started, and we built it together. Account became its pressure test: real pages, real data and real edge cases showed where the system’s early decisions held and where they didn’t. We worked through those kinks on my project, developed patterns together, and I contributed major components and patterns back to the system along the way.

I also advocated for the designer inside the design system. Where the system accelerated product work, I leaned on it. Where it created friction, I raised it, and when Account needed to extend a pattern, that learning went back to the system instead of staying a one-off.

#### Making decisions in the open

There was no shared place to make and track decisions, so I made one.

I led the project through collaborative documentation in Slack canvases. That is where the decisions happened. Partners, and really anyone, could see what was decided and why, and offer feedback before it was final. There was no existing mechanism to track decisions or collaborate this way, and it became how my team saw me lead my projects.

I then turned those canvases into templates for the team to adopt and structure however they needed. The working doc, the messaging framework and the prototype walkthrough on <a href="/work/zenni-order-tracking/">Order Tracking</a> all started from them.

#### Validation

The design was tested with customers and reviewed across the business.

I ran a usability test in January 2025 built on the customer scenarios above, then iterated through team reviews, a mobile team review and a customer service review before detail design and developer handoff. Visual QA followed the build.

#### Launch

The UX runway was three months, and implementation took four.

Developer handoff was organized by ticket, with one design page for each piece of work.

#### 05 / Impact

The outcome was optionality.

The redesigned ecosystem gave the team a foundation to build on rather than another one-off redesign.

- The design system was pressure tested on a real product, and gained major components and patterns from it.
- Decisions were tracked in the open, and the canvases became templates the team adopted.
- Patterns became reusable across Account.
- The foundation enabled richer post-purchase experiences, including the order-tracking work that followed.

Foundational work is often best measured by what becomes easier to build afterward. This foundation didn’t remain theoretical: the next phase used it to tackle a deeper post-purchase problem. <a href="/work/zenni-order-tracking/">See Phase 2, Enhanced Order Tracking</a>.
