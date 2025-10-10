# Visual Identity Guidelines

These guidelines codify the updated Osprey Exterior visual identity so design, content, and development teams can consistently communicate trust, professionalism, and environmental stewardship across gutter cleaning and RainWise program touchpoints.

## Color System

| Role | Color | Hex | Usage Notes |
| --- | --- | --- | --- |
| Core Background | Cloud White | `#F4F7FB` | Default page background, large section fills, and form surfaces. Keeps layouts bright and emphasizes cleanliness. |
| Primary Brand | Osprey Navy | `#0C1F6D` | Headings, primary text accents, icons, and subtle borders. Reinforces trust and technical expertise. |
| Water Accent | Deep Sound Blue | `#1D4ED8` | Links, highlight elements, and secondary buttons. Evokes water management and RainWise alignment. |
| Environmental Accent | RainWise Green | `#2F855A` | Eco-program callouts, badges, icon fills, and backgrounds for sustainability stories. |
| Action Accent | Harvest Amber | `#F97316` | Primary CTAs and phone prompts. High-contrast tone increases conversions while feeling warm and service-oriented. |
| Neutral Surface | Pure White | `#FFFFFF` | Cards, overlays, and modal surfaces layered on the Cloud White background. |

### Application Principles

- **Balance cool and warm:** Pair Sound Blue and RainWise Green elements with Harvest Amber CTAs so the environmental story and service urgency reinforce each other.
- **Keep CTAs dominant:** Limit Harvest Amber usage to high-value actions (quotes, eligibility checks, phone numbers) so buttons remain immediately scannable.
- **Support photography:** Use Navy and Cloud White as framing colors around imagery to maintain a crisp, coastal aesthetic.
- **Accessibility:** Ensure text placed on Sound Blue or RainWise Green backgrounds is white (`#FFFFFF`) or very light tints. Harvest Amber CTAs should use white text for WCAG AA contrast.

## Typography

Osprey Exterior standardizes on **Roboto** for both headings and body copy to deliver a cohesive, professional voice with exceptional readability across devices.

| Use Case | Weight | Notes |
| --- | --- | --- |
| H1–H2 Headlines | 700 (Bold) | Tight line height (`1.1–1.2`) for impactful hero and section titles. |
| H3–H4 Subheads | 600 (Semi-bold) | Provides hierarchy in service descriptions and testimonial blocks. |
| Body Copy | 400 (Regular) | Comfortable reading experience for long-form RainWise education content. |
| Buttons & CTAs | 600 (Semi-bold) | Matches headline styling for prominence and aligns with bold CTA color usage. |
| Captions & Microcopy | 500 (Medium) | Enhances clarity on forms, labels, and supporting notes without overpowering main text. |

### Typographic Guidance

- **Limit font families:** Use Roboto exclusively; vary weight and size to create hierarchy instead of mixing fonts.
- **Responsive scaling:** Utilize clamp-based sizing for primary headings (see `assets/style.css`) to maintain legibility from mobile to desktop.
- **Whitespace:** Pair Roboto with generous line height (`1.55–1.7`) in paragraphs to preserve the clean service aesthetic.
- **Uppercase usage:** Reserve uppercase treatments for short navigational elements and supporting labels to avoid shouting.

## Implementation References

- CSS custom properties for the palette and typography live in [`assets/style.css`](../assets/style.css).
- Content teams should reference these guidelines alongside the [Content Guidelines](./content_guidelines.md) when briefing new pages.
- When creating new assets or illustrations, sample directly from the hex values above to maintain consistency across digital and print collateral.

