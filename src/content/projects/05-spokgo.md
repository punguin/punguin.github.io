---
id: spokgo
number: "01.5"
title: SpokGo
navLabel: SpokGo
company: Spok
context: Spok
project: SpokGo clinical communications
domain: Healthcare SaaS
summary: Creating shared direction through discovery.
role: UX Strategy lead
timeline: 1 month
platform: [iOS, Android]
partners: [Stakeholders across the organization]
accent: spokgo
tags: [UX Discovery, User Research, Healthcare SaaS]
cover: /images/work/spokgo/cover.webp
coverAlt: Three SpokGo screens in phone frames on yellow, a care team chat, a nurse call and a respiratory consult
coverColor: "#fbe97c"
order: 5
---

In 2018 I joined Spok to help design SpokGo, a new cloud based clinical communication app. The ask was a messaging app. Discovery in the hospital showed that the real problem was how much time and effort it took to reach the right person about a patient, and it gave teams across the organization one direction to build toward.

<dl class="case-overview">
<div><dt>The problem</dt><dd>Spok helps hospitals close communication gaps through messaging, directory, scheduling, contact center and paging. It’s used in more than 2,200 US hospitals and carries over 70 million messages a month. The ask was to design a messaging app to streamline hospital communications.</dd></div>
<div><dt>My role</dt><dd>I led the UX strategy for the initiative: field research, user interviews, and the high-level designs that helped align teams across the organization.</dd></div>
<div><dt>What I did</dt><dd>I shadowed clinicians in two hospitals, ran brainstorming with stakeholders, and mapped the high-level experience that set the direction and the roadmap for the year.</dd></div>
</dl>

#### 01 / Impact

Discovery turned an open-ended ask into a plan the organization could build.

<ul class="case-impact" role="list">
<li><p class="case-impact__figure case-impact__figure--text">Aligned</p><p class="case-impact__label">teams across the organization</p><p class="case-impact__note">The work drove alignment across teams and clarified the product roadmap for the year.</p><p class="case-impact__kind">Organizational outcome</p></li>
<li><p class="case-impact__figure case-impact__figure--text">GA launch</p><p class="case-impact__label">of SpokGo</p><p class="case-impact__note">It served as a runway for a series of sprints that ended in a successful general availability launch.</p><p class="case-impact__kind">Shipped</p></li>
<li><p class="case-impact__figure case-impact__figure--text">One app</p><p class="case-impact__label">instead of one per persona</p><p class="case-impact__note">Prioritization aligned stakeholders on a single app, for speed to market and extensibility.</p><p class="case-impact__kind">Product direction</p></li>
</ul>

#### 02 / Key decisions

Start where the work happens, then agree on one thing to build.

<ol class="case-decisions">
<li><p class="case-decisions__title"><a href="#41-start-in-the-hospital">Start in the hospital</a></p><p>Before designing anything, I audited the existing products and shadowed the clinicians who would use the app. <a class="case-decisions__more" href="#41-start-in-the-hospital">4.1 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#42-one-app-not-one-per-persona">One app, not one per persona</a></p><p>Workflows varied so much that separate apps were on the table. We chose one app built to extend. <a class="case-decisions__more" href="#42-one-app-not-one-per-persona">4.2 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#43-map-the-whole-experience-first">Map the whole experience first</a></p><p>A high-level map of objects and relationships gave every team the same starting point. <a class="case-decisions__more" href="#43-map-the-whole-experience-first">4.3 ↓</a></p></li>
<li><p class="case-decisions__title"><a href="#44-organize-communication-around-the-patient">Organize communication around the patient</a></p><p>Messages, people and tasks connect to the patient they’re about, so the care team can work from one place. <a class="case-decisions__more" href="#44-organize-communication-around-the-patient">4.4 ↓</a></p></li>
</ol>

#### 03 / Understanding the problem

A messaging app was the ask. Communication in a hospital is more than messages.

Hospitals already had ways to communicate: directories, paging portals, phones and pagers. The goals for discovery were to understand end-to-end communication workflows for hospital clinicians, define a high-level vision, and bring clarity to the product roadmap for the following year.

##### 3.1 People

<p class="case-insight">Communicating with the care team was slow and cumbersome.</p>

I shadowed a hospitalist, a bedside nurse and a respiratory therapist across two hospitals to understand their workflows, motivations, pain points and opportunities. Then I mapped the bedside nurse’s day.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/spokgo/journey-map.webp" alt="Journey map of a bedside nurse providing patient care throughout the day, with stages from commute and start of shift through patient assessments, contacting a provider, waiting by the phone and receiving a call back, and rows for tasks, tools and touchpoints, and how the nurse felt at each stage." loading="lazy" />
<figcaption>Journey map of the bedside nurse’s day.</figcaption>
</figure>

Communicating with the care team was time consuming and cumbersome. To start a conversation, nurses relied on directories, paging and phone calls, then waited for a response. On top of that, they lived with alarm fatigue from the sheer number of alarms and notifications they received throughout the day.

- Communication workflows varied greatly from department to department, even within the same hospital.
- Providers preferred pagers, which they saw as more reliable than cell phones inside thick hospital walls.
- Providers could carry several devices, and each had their own preference for how to be contacted.

<figure class="visual visual--wide">
<div class="doc-pair">
<img src="/images/work/spokgo/nursing-whiteboard.webp" alt="A whiteboard at a nursing station listing the day's nurses and nursing assistants by room range, each with a phone extension. Names and extensions are hidden." loading="lazy" />
<img src="/images/work/spokgo/patient-room.webp" alt="A typical workstation in a patient room: a wall-mounted monitor and keyboard arm, a scanner, a phone cord, a stool and a red bin." loading="lazy" />
</div>
<figcaption>Nursing assignments on a whiteboard, with phone extensions, and a typical workstation in a patient room. Names and extensions are hidden.</figcaption>
</figure>

##### 3.2 System

<p class="case-insight">Reaching a provider meant crossing several disconnected systems.</p>

Connecting with providers was frustrating and time consuming. A nurse looked the provider up in one system, sent a page from another, and waited by a phone for the call back.

##### 3.3 Gaps

<p class="case-insight">Messages went out with no confirmation, into a flood of notifications.</p>

- Nurses had no visibility into whether a provider had received their message.
- Clinicians were frustrated by the volume of notifications and messages they received.

We narrowed the opportunities to two questions:

<p class="callout">How might we reduce the time and effort required to communicate about a patient?</p>

<p class="callout">How might we use patient information to enhance communication workflows?</p>

#### 04 / Making it work

Ideas from everyone, then one shared map.

##### 4.1 Start in the hospital

Understand the work before designing for it.

The initiative started with a deep dive into Spok’s existing suite of products, where I audited the experience across every touchpoint. Then I went on site, into two hospitals, to see the work for myself.

##### 4.2 One app, not one per persona

Prioritize speed to market and extensibility.

I held a series of brainstorming sessions with stakeholders to co-create and sketch as many ideas as possible. From them, we narrowed down the core set of features needed for seamless communication workflows.

<figure class="visual visual--wide">
<div class="img-grid">
<img src="/images/work/spokgo/brainstorm-1.webp" alt="Brainstorming session 1 of 4: whiteboard with flows, sticky notes and screen sketches." loading="lazy" />
<img src="/images/work/spokgo/brainstorm-2.webp" alt="Brainstorming session 2 of 4: whiteboard with flows, sticky notes and screen sketches." loading="lazy" />
<img src="/images/work/spokgo/brainstorm-3.webp" alt="Brainstorming session 3 of 4: whiteboard with flows, sticky notes and screen sketches." loading="lazy" />
<img src="/images/work/spokgo/brainstorm-4.webp" alt="Brainstorming session 4 of 4: whiteboard with flows, sticky notes and screen sketches." loading="lazy" />
</div>
<figcaption>Brainstorming with stakeholders.</figcaption>
</figure>

Because workflows varied so much, we debated whether we needed a separate app for each persona. Through prioritization exercises, we aligned on one app that prioritized speed to market and extensibility, given our timeline and resources.

##### 4.3 Map the whole experience first

Give every team the same starting point.

I mapped the high-level experience to document the decisions we made while brainstorming, and to help teams understand the objects in the app and how they relate. It served as a starting point and jump-started work in each individual area.

<figure class="visual visual--wide">
<img src="/images/work/spokgo/experience-map.webp" alt="A printed map of the high-level experience laid out on a table: rows of wireframe screens for patients, directory, messages and more, connected into flows." loading="lazy" />
<figcaption>The high-level experience map, printed for review.</figcaption>
</figure>

##### 4.4 Organize communication around the patient

Bring the care team, the conversation and the work together.

Patient centric communication lets care team members see all the relevant information about a patient. They can coordinate care and move the patient along their care journey more quickly, without switching between several tools.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/spokgo/patient-centric.webp" alt="Wireframe flow for patient centric communication: my patients, a patient's details, patient activity, patient tasks, the care team and patient information." loading="lazy" />
<figcaption>Patient centric communication.</figcaption>
</figure>

The map also covered the enterprise directory and on-call schedules, core messaging, and tasks.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/spokgo/directory-on-call.webp" alt="Wireframe flow for the enterprise directory and on-call: the directory, search, a person's profile, on-call schedules and services, linked back to starting a message." loading="lazy" />
<figcaption>Enterprise directory and on-call.</figcaption>
</figure>

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/spokgo/core-messaging.webp" alt="Wireframe flows for core messaging: the inbox, one-to-one threads, voice and group threads, with screens for composing, attachments and call options." loading="lazy" />
<figcaption>Core messaging.</figcaption>
</figure>

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/spokgo/tasks.webp" alt="Wireframe flow for tasks: a task list, an accepted task and a closed task." loading="lazy" />
<figcaption>Tasks.</figcaption>
</figure>

#### 05 / What it enabled

A clear direction, a roadmap, and a launch.

The initiative helped drive organizational alignment across teams and clarified the roadmap for the year. It served as a runway for a series of sprints that ultimately resulted in a successful GA launch of SpokGo.

<figure class="visual visual--wide">
<img class="is-mockup" src="/images/work/spokgo/final-mockups.webp" alt="Three final SpokGo screens: a critical care team chat about a patient's vitals, a nurse call from a patient's bathroom with patient details and call actions, and a respiratory consult with the department, specialties and who is currently in the role." loading="lazy" />
<figcaption>Final mockups, by a visual designer on the team.</figcaption>
</figure>
