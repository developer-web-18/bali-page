# FollowFoots Vacation — Bali Landing Page (PRD)

## Original Problem Statement
Premium, high-converting destination travel landing page for **FollowFoots Vacation Pvt Ltd**, destination **Bali, Indonesia**. Primary goal: **lead generation** from Google Ads and Meta Ads (not a blog, not e-commerce). Premium Indian travel agency feel, conversion-focused without looking spammy, multiple strategic CTAs, clean/spacious/premium layout, minimal text, mobile-first. Max content width 1200–1280px. Do not invent reviews/ratings/phones/prices/stats — use clearly marked placeholders.

## Design System (locked)
- White base `#FFFFFF`, deep navy text `#0B1D3A` / `#07142A`, tropical teal `#008B8B` / `#047857`, warm gold CTA `#D97706` / `#F59E0B`, soft blue sections `#EDF5FA` / `#F4F8FA`
- Fonts: Lora Variable (serif headings, italic accents) + Plus Jakarta Sans Variable (body)
- `ff-container` = max-w-7xl centered; rounded-2xl/3xl cards; `card-lift` shadows; `gold-glow` CTA glow
- Motion: Lenis momentum scrolling, motion/react masked line-by-line hero reveal (ease [0.16,1,0.3,1]), hero parallax + slow image scale, floating polaroid frames, editorial trust marquee (48s), staggered entrances; reduced-motion respected
- Brand: user-supplied footprint logo (`/public/logo.png`), matching SVG footprint favicon

## User Personas
- High-intent Indian traveller from Google/Meta ads (honeymooners, families, groups) wanting a custom Bali quote fast
- FollowFoots sales team reading captured enquiries

## Architecture
- FastAPI `/api/leads` (POST create, GET list) → MongoDB `leads` collection (uuid id, source, created_at; indexes on id + created_at)
- React 19 + TS: `pages/Home.tsx` composes `Header`, `HeroSection` (with `LeadForm`), `TrustStrip`, `PackagesSection`, `ExperiencesSection`, `ItinerarySection`, `WhySection`, `ReviewsSection` (Trustindex), `FaqSection`, `FinalCtaSection`, `Footer`, `EnquiryDialog` (package-aware title), mobile sticky bar (desktop floating pill removed 2026-10-01); `hooks/useLenis.ts`; TanStack Query mutation + Sonner toasts
- Lead fields (both forms): name, mobile, city, travelers (select), travel_month (select), `package` (package title from card GET QUOTE, else "Custom Bali Trip" for hero form / header CTA / custom-quote link); email optional in API, not collected
- `lib/constants.ts` holds `WHATSAPP_NUMBER`, `WHATSAPP_LINK`, `CONTACT`, `TRUSTINDEX_SRC`, `TRUSTINDEX_FEED_SRC`, `CUSTOM_PACKAGE`, `CUSTOM_ITINERARY`, `IMAGES`

## Implemented (2026-09-30)
- Global design system (colors, typography, utilities, marquee keyframes)
- Sticky glass Header with logo, nav (Bali Packages / Experiences / Itinerary / Why Us / FAQs), gold "Talk to a Bali Expert" (opens modal). Mobile/tablet (<lg): click-to-call pill `tel:+919910808505` showing +91 9910808505 (header-call-btn); on <sm the gold CTA collapses to a headset icon button and the logo tagline hides (2026-10-02)
- Bright hero (v3, refined 2026-10-03): Uluwatu cliffs on the left/open ocean on the right, localized left scrim; approved headline + concise supporting text, compact ₹27,500/person without-flight price anchor, gold "GET MY BALI QUOTE" CTA opens the existing enquiry dialog, followed by 3 trust points
- Lead card "Get Your Free Bali Quote" — 5 fields in 2-col grid (Full Name | Mobile, City | Month, Travellers) → MongoDB, reassurance line, secondary WhatsApp CTA; fits 1440x800 viewport
- Compact Trust Strip (4 benefit items, 4-across desktop / 2x2 mobile) replaced the old marquee (2026-10-01)
- Popular Bali Holiday Packages (id=packages) v2 (2026-10-02): two groups — "Packages Without Flight" (Bali Escape ₹44,300→₹27,500; Bali Relax & Explore ₹62,700→₹54,820; Bali Leisure Holiday ₹56,800→₹45,720) and "Packages With Flight" (Bali Complete Holiday ₹1,12,500→₹83,740; Bali Premium Escape ₹98,650→₹81,999; Bali Beach & Ubud Holiday ₹84,700→₹76,740). Each card: 5-image `ImageCarousel` (arrows, dots, swipe, no autoplay, fixed 16/10), badge, flight label, duration + stay, inclusion chips, struck price + SAVE badge + discounted price per person, GET QUOTE → dialog "Get a Quote for {title}". 3/2/1 cols. "Can't find your trip? Get a Custom Quote →" retained. Real prices supplied by user (no placeholders remain)
- Fixed mobile bottom bar "GET FREE QUOTE | WHATSAPP" (desktop floating pill removed per user)
- Minimal navy footer with placeholder contact/registration lines
- Verified by testing agent (iteration_1: backend 6/6, all frontend flows pass, desktop 1440x800 + mobile 390x844)
- Polish (2026-10-01): lighter left scrim, brighter/saturated hero image, headline Lora semibold with tighter tracking, selects pass `null` when empty so no month/travellers is ever preselected

## Backlog (sections from brief, in order)
- P2: Full footer (links, socials), WhatsApp click-to-chat, email notification on new lead (Resend), admin leads view, SEO/meta OG image, package detail pages

- Unforgettable Bali Experiences (id=experiences): 6 image cards (3x2 desktop, 2-col mobile) + teal CTA strip "Build My Bali Itinerary" → modal (package "Custom Bali Itinerary", title "Build Your Custom Bali Itinerary") (2026-10-01)
- Sample Bali Itinerary (id=itinerary): 6-day timeline (6-across xl, 3-col md, vertical mobile), "Customise This Itinerary" + "Create My Custom Itinerary" CTAs → same modal/package (2026-10-01)
- Why FollowFoots (id=why-us): image + "Your Holiday. Your Way." trust card, 6 benefits, trust message, "Plan My Bali Trip" → modal (package "Custom Bali Trip") (2026-10-01)
- Shared `SectionPrimitives.tsx` (SectionHeading, GoldButton, TextLinkCta)
- FAQ (id=faqs): 10-question single-open accordion (2-col desktop, 1-col mobile, +/− icon, teal active) + "Still have questions?" card → modal (Custom Bali Trip) (2026-10-01)
- Final CTA (id=final-cta): bright Diamond Beach backdrop, "Ready to Plan Your Bali Escape?", gold quote CTA → modal, outlined WhatsApp CTA, 3 trust points, services line (2026-10-01)
- Footer: white, brand + description, Explore nav, Contact (phone/WhatsApp/email) + Instagram/Facebook icons, copyright (2026-10-01)
- Trusted by Travellers (id=reviews, between Why Us and FAQ): centered heading → full-width "Google Reviews" Trustindex slider (loader.js?0608e26821527132938686fe9ea; native 4/2/1 cards at desktop/tablet/mobile) → below it a centered max-w-4xl "Follow Us on Instagram" block (loader-feed.js?ee7c45c82f1c72687986196d74f, native 3/2/1 cols, capped ~620px with inner scroll + data-lenis-prevent + fade, "FOLLOW @FOLLOWFOOTS" link) → "Planning your Bali trip?" CTA → modal (Custom Bali Trip). Each script injected once; widgets render lazily on user activity (Trustindex behaviour) (2026-10-01)
- Official contact details LIVE in `constants.ts`: WhatsApp/phone +91 9910808505 (wa.me/919910808505), followfoots@gmail.com, instagram.com/followfoots, facebook.com/FollowFootsPVTLTD (2026-10-01)

## WhatsApp OTP verification (2026-10-02)
- Shared service `backend/routes/leads.py` used by BOTH forms: POST /api/leads (saves lead FIRST with otp_status=unverified, then sends OTP) → POST /api/leads/{id}/verify-otp → /resend-otp (30s cooldown, max 3) → /change-number (max 3, same lead, old OTP invalidated). Rate limits per IP (8/10min) and per mobile (6/h); 5 verify attempts; OTP stored as HMAC hash, 5-min TTL; never logged
- Provider: Promotion Kart `lib/whatsapp.py` — flat payload {country_code "91", mobile, wid 5002, type text, bodyValues {"1": otp}} with `Authorization: Basic <PROMOTIONKART_AUTHKEY>` (the "version 2.0 + data[]" shape from the brief returns "Mandatory Values Missing" on this account). Env: PROMOTIONKART_URL, PROMOTIONKART_AUTHKEY, PROMOTIONKART_WID, OTP_DEBUG_EXPOSE (preview-only; now false)
- Lead fields: name, mobile (10-digit normalised), country_code, city, travel_month, travelers, package, form_source (Hero Form / Package Popup / Header CTA / Experiences CTA / Itinerary CTA / Why Us CTA / Reviews CTA / FAQ CTA / Final CTA), otp_status, otp_send_status, otp_attempts, otp_resend_count, number_change_count, otp_created_at/expires_at/verified_at, last_otp_sent_at, created_at, updated_at
- Frontend: `OtpStep.tsx` (6-box OTP input, verify, resend countdown, change number, thank-you) rendered inside `LeadForm.tsx` for hero + modal; form_source passed via `openDialog(pkg, source)`
- Tests: `backend/tests/test_otp_flow.py` (7; 4 need OTP_DEBUG_EXPOSE=true), iteration_8 frontend E2E all pass. Test WhatsApp number 9289505505

## Testing
- iteration_1 (hero), iteration_2 (trust strip + packages), iteration_3 (5-field forms, package-aware modal, custom quote), iteration_4 (experiences, itinerary, why sections), iteration_5 (FAQ, final CTA, footer), iteration_6 (Trustindex reviews + contact details), iteration_7 (6-package carousel cards), iteration_8 (WhatsApp OTP flows) — all pass; backend pytest /app/backend/tests/test_leads.py 10/10

## Page is feature-complete per brief (all sections built, real prices + contacts live)
## Next Tasks (optional)
1. Email alert on new enquiry (Resend), admin leads view (verified/unverified filter), SEO/OG meta

## Final hero + enquiry form visual refinements (2026-10-03)
### Approved scope
- Preserve approved design and every other page section. Only hero content/background/readability and existing hero/package popup form spacing/alignment change. No OTP/API/provider/database implementation changes.
- Exact hero headline: "Bali Holiday Packages from India"; supporting text: "Customised Bali holidays with handpicked hotels, transfers, sightseeing & experiences." Removed the honeymoon/family paragraph entirely.
- Compact translucent price anchor: "PACKAGES STARTING FROM", "₹27,500 / PERSON", "4N / 5D • WITHOUT FLIGHT". Three existing trust points now follow the hero CTA. No new claims.

### Implemented
- `HeroSection.tsx`: existing typography, colours, rounded styling retained. Original centered Tanah Lot image cannot shift horizontally when width-filling wide screens without large zoom; replaced hero ONLY with a real bright Uluwatu coastline photograph (Unsplash photo-1671034456366-77aff6bd3316), cliffs left, open ocean right. Other image constants and sections untouched.
- Responsive picture sources and dedicated mobile/tablet object positions. Photo height is independent of the stacked mobile form, avoiding the old excessively enlarged crop. Left-only navy gradient leaves the right ocean bright. Parallax reduced to 4%, no extra image zoom.
- `Home.tsx` only change: pass existing `openDialog` callback into hero CTA; opens existing custom-package enquiry popup with form_source="Hero Form". No duplicate form/system introduced.
- New small `EnquiryField.tsx` shares labels/wrappers; `.enquiry-control` scoped CSS standardizes all five controls to 44px height, 12px radius, 1px border, 10px/14px padding, matching typography and placeholders. Fixes inherited shorter dropdown defaults without changing global UI primitives.
- Both forms: equal desktop columns, aligned pairs even when labels wrap, third-row traveller control centered at one column's width, full-width single column on phones. CTA exact grid width. Unique option test IDs and accessible select labels.
- Existing popup: reduced padding/header gaps, viewport-contained scrolling with Lenis prevention, all original copy, package titles, close button, trust points, WhatsApp links retained. Bali Escape popup measured 585px tall at desktop with no internal scrolling.
- `LeadForm` submission/mutation/state logic, `OtpStep.tsx`, backend routes/provider/database, environment variables and WhatsApp destination remain unchanged. Application contains NO mocked integration.

### Verification
- `yarn typecheck`, `yarn lint` (0 errors; 3 pre-existing shared-component export warnings), `yarn build` pass.
- Desktop 1920x800 + mobile 390x844 screenshots and measured geometry passed for hero and package popup. All controls 44px; desktop hero columns/traveller 208.328px, popup 286px; mobile full-width 316px/318px respectively. CTA bounds match grid; actual document and scoped hero/dialog overflow empty. Existing clipped carousel slides are not actual overflow and were not modified.
- Testing report `iteration_9.json`: 11 backend tests pass, 4 legacy live-OTP tests correctly skipped with OTP_DEBUG_EXPOSE=false; initial broad browser script incomplete due harness assertions.
- Follow-up `iteration_10.json` completes remaining 320/640/768/1024/1440 responsive checks and segmented frontend OTP submit/payload/error/verify/thank-you/resend/change-number regressions, all pass.
- New `backend/tests/test_otp_lifecycle_mocked_provider.py`: 5/5 pass using real app/MongoDB with provider transport MOCKED IN TESTS ONLY. Verifies saved-before-send, wrong/right OTP, send failure retention, number change invalidation/same lead, resend cooldown and success. Scoped QA records cleaned; no real WhatsApp messages sent; live delivery not re-tested. Frontend OTP network interception also TEST-ONLY MOCKED.
- No application defects or failed flows found in final scope. No authentication credentials created; test_credentials.md documents public access and safe test constraints.

### Priorities / next actions
- P0: User visual review of the refined hero and both existing enquiry forms.
- P1: None requested or outstanding in this scope.
- P2 (optional; not implemented): previously noted lead alerts/admin view/SEO; consider measuring verified-enquiry conversions for ad performance after approval. Do not expand scope without a new request.

## Final forms + itinerary + final CTA/footer polish (2026-10-03)
### User scope and requirements
- Only (1) both enquiry forms + new optional Travel Style, (2) existing Sample Bali Itinerary polish, and (3) existing Final CTA/Footer polish. Approved hero design/header/packages/experiences/Why/reviews/FAQ untouched.
- Third desktop row now Travellers LEFT and Travel Style RIGHT, equal-width columns. Native Budget/Luxury radio group, mutually exclusive, no default selection, optional. Persist `travel_style` as "Budget", "Luxury", or null before OTP; never a boolean. Travellers defaults to "2 Adults" per this request and retains all existing options.
- Retain all six itinerary days, exact activities, images and existing popup calls. Equal desktop card/image heights, six large-desktop columns, three tablet columns, vertical mobile timeline.
- Keep final CTA image/copy/buttons/trust points; improve spacing/readability and remove decorative services line. Compact existing three-column footer and working contact/social/explore links.

### Implemented
- `TravelStyleField.tsx`: small shared accessible native radio group (separate names per hero/modal, teal selection, horizontal options, 44px row). `LeadForm.tsx`: adds null-initialized typed travel_style to existing payload and positions Travellers/Travel Style in row 3; no new form or submission system. `EnquiryField.tsx` removes obsolete centred-single-field styling. All five input/select controls retain shared 44px/12px/1px/10x14 styling; mobile stack remains clean.
- Backend `routes/leads.py` ONLY adds optional Literal["Budget", "Luxury"] to LeadCreate/LeadPublic and PUBLIC_FIELDS. Existing payload.model_dump persists it before issue_otp; legacy missing fields serialize null. OTP generation/security/verification/resend/change-number, API routes, provider credentials, WhatsApp transport and database save flow unchanged.
- `ItinerarySection.tsx` + scoped `ItinerarySection.css`: flex-stretched equal cards, consistent image ratios/title/location/bullet spacing, aligned circles, connecting lines with 8px clearance. No trailing horizontal line at tablet row ends; true vertical mobile connector. Tighter balanced section/custom-CTA spacing. Existing `Custom Bali Itinerary` package / `Itinerary CTA` source preserved.
- `FinalCtaSection.tsx`: increased safe top/bottom padding, unclipped heading line height, localized radial scrim instead of full-section gradient, original image and text retained, services line removed, full-width mobile buttons stacked until md, aligned reassurance points.
- `Footer.tsx`: reduced section padding/gaps, same three-column identity/content, 44px social/mobile contact touch targets, full linked icon+text contact rows, exact Facebook www URL, original Instagram/tel/mailto/WhatsApp/nav targets, compact centred copyright.

### Verification
- Typecheck, production build, Python compile all pass; oxlint 0 errors (same 3 existing UI export warnings).
- Main-agent smoke: desktop1920x800 all six itinerary cards exactly378.5px tall; scoped/document horizontal overflow empty. Mobile390x844 form and final CTA screenshots pass.
- `iteration_11.json`: backend18/18 pass, responsive/radio/keyboard/payload/OTP/itinerary/source/CTA/footer-link checks across320/390/640/768/1024/1440/1920 pass except reported12.5px desktop traveller/style offset.
- `iteration_11_followup.json`: reported offset NOT reproduced after settled fonts/animations with atomic geometry reads. Hero controls both y462.484375, width208.328125, height44 (3 consecutive passes); popup both y448.625,width286,height44. No fix required; prior apparent offset likely separate animation-frame measurements. No remaining defects.
- Added `backend/tests/test_travel_style_mocked_provider.py`: accepts all valid values/omitted null, rejects booleans/invalid values422, asserts value saved before provider callback, retained through verify/resend/number change, exactly one lead id, legacy null compatibility and no _id/otp_hash leakage. Existing OTP lifecycle suite rerun. QA records cleaned.
- **TEST-ONLY MOCKED** provider transport/browser OTP responses; no live WhatsApp sends, no debug exposure enabled. Actual application integrations remain real.

### Current next actions / backlog
- P0: User visual review of the three requested areas; no known outstanding implementation defects.
- P1: None requested.
- P2 (optional only): previously noted admin lead view/alerts/SEO; a future Travel Style filter could help sales personalise follow-up. No extra features implemented.

## Experiences card replacements (2026-10-03)
- User request: in Unforgettable Bali Experiences replace Seminyak with Gili Island(s), and Water Sports with Beach Club using a real FINNS Beach Club photograph. Only these two cards updated; layout, other four cards, other sections and all form/OTP/lead functionality unchanged.
- `ExperiencesSection.tsx`: card3 (zero-based) now "Beach Club", description "FINNS Beach Club · Poolside & sunsets"; card5 now "Gili Islands", description "Turquoise waters & island escapes". Added unique image/title/description test IDs.
- Added separate `IMAGES.finnsBeachClub` and `IMAGES.giliIslands` constants; old shared Seminyak/water-sports assets kept so other sections/packages are unaffected.
- FINNS image is the real daytime aerial venue photo sourced from its official homepage: https://finnsbeachclub.com/wp-content/uploads/2023/11/Copy-of-2026.04.18_Absolut_Brand_Activation_Drone_Shoot_FJR_-2-1-Large.jpeg . Gili image: Unsplash photo-1619681216575-d6b3964fc278 (Gili Trawangan aerial). No generated/substitute venue imagery.
- Self-tested desktop1920x800 and mobile390x844: all6 images load, exact updated labels, official FINNS photo URL, readable responsive crop, no experience/document horizontal overflow; Build My Bali Itinerary still opens existing "Build Your Custom Bali Itinerary" popup. Screenshot log: /root/.emergent/automation_output/20261003_090058/console_20261003_090058.log . No APIs mocked or exercised for this content-only change.
- P0: User visual review. P1: none. P2 optional: experience preference capture in the existing enquiry workflow, only if requested; existing backlog otherwise unchanged.
