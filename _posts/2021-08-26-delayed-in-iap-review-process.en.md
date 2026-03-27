---
layout: post
title: "Delayed in IAP Review Process"
description: Troubleshooting when In-App Purchase stuck at Waiting for Review in iTunes Connect
image: /assets/applereview.webp
date: 2021-08-26 22:53:34 +0900
tags: [iap, appstore]
categories: [unity]
lang: en
permalink: /delayed-in-iap-review-process/
---

<br>

# In-App Purchase Review Delay Issue

During new development, you'll face unexpected **system bugs** or **review delay** issues.
Recently, I experienced an issue where In-App Purchase in iTunes Connect got stuck at *"Waiting for Review"* status and review wouldn't proceed.

---

## IAP Review Issue Resolution Checklist
- [x] Verify In-App Purchase is properly attached to app binary  
- [x] Resubmit with Clean Build  
- [x] Contact Apple Support (Contact Us)
- [x] Submit Radar bug report
- [x] Resubmit In-App Purchase with new binary  

---

## Lessons Learned
- **The cause is often an internal system bug**.  
- **Clean Build** is the most basic but powerful solution.  
- **Dependency verification** is essential.  
- **Contacting official support channels** leads to faster resolution.  

---

## Conclusion
Ultimately, the key to resolution is a **systematic checklist** and **persistent verification process**.
Such experiences during development are annoying, but also become a foundation for growth.
Apple is probably not at fault, maybe.

---

## References
- [Apple Developer Support](https://developer.apple.com/forums/thread/90551)
