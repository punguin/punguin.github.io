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
hero: /images/work/zenni-account/hero.webp
coverAlt: The redesigned Zenni My Account dashboard in a laptop frame on lime green
coverColor: "#dcf774"
order: 2
---

I modernized a fragmented account experience while establishing reusable product patterns and a healthier working relationship between product design and the design system. This was Phase 1. <a href="/work/zenni-order-tracking/">Phase 2, Enhanced Order Tracking</a>, was built on it.

<dl class="case-overview">
<div><dt>The problem</dt><dd>Zenni’s Account pages had grown one page at a time, organized around how the business built them, just as a new brand and a barely started design system arrived.</dd></div>
<div><dt>My role</dt><dd>I was the lead, and only, UX designer on the redesign, partnered with a product manager, my UX manager, engineering and the design system team. The work wasn’t on a company roadmap when I started, so part of my job was showing leadership a new account experience that was worth investing in.</dd></div>
<div><dt>What I did</dt><dd>I gave Account one structure and a set of reusable patterns, built them together with the design system while it was still forming, and led the project in the open, in shared Slack canvases where the decisions were made and recorded.</dd></div>
</dl>

#### 01 / Impact

The redesign gave the team a foundation to build on rather than another one-off redesign.

<ul class="case-impact" role="list">
<li><p class="case-impact__figure case-impact__figure--text">One structure</p><p class="case-impact__label">for every Account page</p><p class="case-impact__note">One navigation, one structure and one set of patterns, in place of pages built at different times for different needs.</p><p class="case-impact__kind">Shipped</p></li>
<li><p class="case-impact__figure case-impact__figure--text">Phase 2</p><p class="case-impact__label">Enhanced Order Tracking built on it</p><p class="case-impact__note">The next phase used the foundation to tackle a deeper post-purchase problem.</p><p class="case-impact__kind">Capability enabled</p></li>
<li><p class="case-impact__figure case-impact__figure--text">Shared patterns</p><p class="case-impact__label">contributed back to the design system</p><p class="case-impact__note">Account pressure tested the system on a real product and gave it major components and patterns.</p><p class="case-impact__kind">Organizational outcome</p></li>
</ul>

Foundational work is often best measured by what becomes easier to build afterward.

#### 02 / Key decisions

Consistency was not the same thing as sameness.

<ol class="case-decisions">
<li><p class="case-decisions__title"><a href="#41-organize-account-around-what-customers-manage">Organize Account around what customers manage</a></p><p>Navigation grouped the way customers think, not the way the business had built the pages, and options that didn’t save customers time came out. <a class="case-decisions__more" href="#41-organize-account-around-what-customers-manage">4.1 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#42-build-a-pattern-once-with-the-design-system">Build each pattern once, with the design system</a></p><p>Account and the barebones design system were built together. When Account needed to extend a pattern, the change went back to the system instead of staying a one-off. <a class="case-decisions__more" href="#42-build-a-pattern-once-with-the-design-system">4.2 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#43-leave-room-for-capabilities-we-hadnt-designed-yet">Leave room for capabilities we hadn’t designed yet</a></p><p>Orders became a list and a detail with an item panel, a structure later work could grow into, from frame measurements to Enhanced Order Tracking. <a class="case-decisions__more" href="#43-leave-room-for-capabilities-we-hadnt-designed-yet">4.3 ↓</a></p></li>
</ol>

#### 03 / Understanding the problem

Barebones account pages, a new brand, and a new priority.

Zenni’s Account management pages were barebones. The organization had historically prioritized metrics like average order value, and Account didn’t move them directly, so it had never been a priority.

Two things changed that. First, branding unveiled new guidelines: a major visual overhaul, and a single voice, tone and vibe for how Zenni wanted to be perceived. The website wasn’t up to that standard, so a new design system was created while major sections of the site were redesigned at the same time.

Second, Zenni’s leadership changed. A new leader made a “best-in-class foundation” a major organizational goal for 2025. My UX manager saw the opportunity and assigned me to Account before it was on the roadmap. I started in November 2024.

<figure class="visual visual--wide">
<img src="/images/work/zenni-account/legacy-dashboard.webp" alt="The legacy My Account dashboard: a plain text navigation of Zenni links, then stacked sections for account settings, Zenni Rewards points, a text list of orders, payment methods and the address book, each with a Manage button." loading="lazy" />
<figcaption>The legacy dashboard, November 2024. Personal details are hidden.</figcaption>
</figure>

##### 3.1 People

<p class="case-insight">Customers thought of Account as one place. The product did not.</p>

Customers didn’t care that orders, prescriptions, payment methods and profile information came from different parts of the business. To them, Account was one thing.

<p class="callout">My account is where I manage my relationship with Zenni.</p>

What they came to do was concrete:

- An order placed a week ago is in transit, and the customer needs an estimate of when it will arrive.
- One pair in an order is on Rush service and the others are on Standard, and the customer needs to confirm the arrival date for each.
- The customer needs to know when their prescription was last updated, to decide whether to see an eye care provider before their next order.
- The customer needs to know what Rewards credit they have for their next purchase, and how long they have to use it.
- The customer lost their return label and needs to print it again.

Customer service added one more. A top customer request was to show frame size prominently in order history, so customers could use it as a reference when buying their next pair.

##### 3.2 System

<p class="case-insight">Account was a collection of pages, and the design system barely existed.</p>

Account had evolved one page at a time, built at different times for different needs. Each page had its own structure, data, states, actions and technical history. The navigation showed it: pages were grouped under labels like Order Management and Personalization, alongside features such as TryOn, Shared Images and Vision Test. It described how the business had built Account, not what customers came to do.

At the same time, the new design system was barebones. I was designing a system at the same time as the design system. Whatever patterns Account needed, such as navigation, hierarchy, cards, responsive layouts, status and actions, either didn’t exist yet or hadn’t been tested on a real product.

##### 3.3 Gaps

<p class="case-insight">Modernizing the UI wasn’t enough.</p>

Individual pages worked, but the experience wasn’t operating as a coherent system. Simply reskinning the existing pages would have reproduced today’s constraints in tomorrow’s interface, on top of a design system that was still changing underneath them.

<p class="callout">How do we modernize today’s experience without designing ourselves into another corner tomorrow?</p>

Not every gap belonged in the first release. The MVP focused on the structure and the patterns every Account page shared. Store credit, international support, enhanced order tracking and favorites were set aside as later work that the foundation needed to make room for.

#### 04 / Making it work

Reusable foundations, with room for what each page needed.

The organization needed reusable foundations without forcing every product problem into the same template. I established common structure and reusable interaction patterns while preserving room for domain-specific needs. The consequential decisions were not always visually dramatic: what became reusable, what stayed specific, and how the system could support capabilities we had not designed yet.

##### 4.1 Organize Account around what customers manage

One navigation, grouped the way customers think.

<p class="label case-status">Shipped in the first release</p>

The new navigation panel groups Account into Account, Rewards, Settings, and Help and Support. On desktop it is visible on every Account page, so customers always know where they are and can move between orders, prescriptions and settings without starting over. Shared Images was hidden from the interface.

<figure class="visual visual--wide">
<img src="/images/work/zenni-account/navigation-ia.svg" alt="Two lists side by side. Before: My Account, Zenni Rewards, Order Management and Personalization groups, with TryOn, Shared Images and Vision Test, then loose links. After: Account, Rewards, Settings, and Help and Support groups." loading="lazy" />
<figcaption>Account navigation before and after the redesign.</figcaption>
</figure>

<figure class="visual visual--wide">
<img src="/images/work/zenni-account/after-dashboard.webp" alt="The redesigned My Account dashboard: a navigation panel grouped into Account, Rewards, Settings and Help and Support, a Zenni Rewards card with tier progress and points, and recent orders as cards with Order Details and Print FSA Receipt buttons." loading="lazy" />
<figcaption>The redesigned My Account dashboard. Personal details are hidden.</figcaption>
</figure>

**Remove what doesn’t save customers time.** Some decisions were removals: fewer options, when the options didn’t help. Customers can’t set PayPal, Google Pay or Apple Pay as a default payment method, because that doesn’t actually save them time at checkout. A “claim 50 points” button that wasn’t compliant came out of communication preferences. Confusing referral copy was rewritten, and when a customer deletes their default address, they are asked to choose a new one.

##### 4.2 Build a pattern once, with the design system

The address form was the clearest case.

<p class="label case-status">Shipped in the first release</p>

The Add and Edit Address modal was designed to be used throughout the entire site, not only in Account. I grounded it in Baymard’s checkout research: an address validator that customers can override and that highlights its suggested changes, a single full-name field, Address Line 2 behind a link, and city and state detected from the ZIP code.

The same thinking produced shared patterns for empty states, such as no orders yet or a brand new account, and for error and success feedback, so each Account page didn’t invent its own.

##### 4.3 Leave room for capabilities we hadn’t designed yet

A useful foundation does not predict every future feature. It gives future teams better choices.

<p class="label case-status">Shipped in the first release</p>

Orders answer the most questions, so they got the most structure. I started with a low-fidelity order history in which each order is a card and each item opens an item details panel, so customers can check status, track a shipment, buy again or start a return without losing their place.

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

<p class="label case-status">Direction for later phases</p>

We knew Orders had room to become much more useful. I structured the foundation so later iterations could support richer status, progressive information, contextual actions and more sophisticated post-purchase communication. Work after the MVP included store credit, frame measurements, international support and enhanced order tracking.

##### Working in the open

I made and recorded the project’s decisions in Slack canvases, open to partners for comment before anything was final. That practice became a team template, and later how the whole UX team tracked its work. That story is its own case study: <a href="/work/zenni-working-docs/">UX Working Docs</a>.

##### 4.4 Design system collaboration

I was one of the first designers to adopt the new design system.

**Account was the design system’s pressure test.** We built Account and the design system together. Real pages, real data and real edge cases showed where the system’s early decisions held and where they didn’t, and they surfaced many gaps. I designed the missing components and contributed them back to the system:

- Modals
- Dropdowns
- Navigation patterns
- CRUD patterns, for creating, editing and deleting
- Alert toasts

I also advocated for the product designer inside the design system. Where did the system speed up product work, and where did it create friction? When should a product team extend a pattern, and how should that learning return to the system? Where the system helped, I leaned on it. Where it got in the way, I raised it, and when Account needed to extend a pattern, the change went back to the system instead of staying a one-off.

##### 4.5 Validation and launch

Tested with customers, reviewed across the business.

In January 2025 I ran a usability test built on the customer scenarios above, then iterated through team reviews, a mobile team review and a customer service review before detail design. Developer handoff was organized by ticket, with one design page for each piece of work, and visual QA followed the build. The UX runway was three months, and implementation took four.

#### 05 / What it enabled

We could build on the foundation instead of starting over.

The redesigned Account experience established a shared structure and reusable patterns for future improvements. When we moved into Enhanced Order Tracking, we could focus on the harder problem of helping customers understand their orders rather than rebuilding the experience around them.

<a href="/work/zenni-order-tracking/">See Phase 2, Enhanced Order Tracking</a>.
