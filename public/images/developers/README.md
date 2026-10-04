# Developer profile photos

Place your four square, compressed WebP photos here (around 320 x 320 pixels).
For example: developer-1.webp through developer-4.webp.

Edit `src/components/developer-credits/developers.ts` to set each developer's
`name`, `image`, `github`, `linkedin`, and `email` fields. Keep `role` as `Web Developer`.
Use `/images/developers/developer-1.webp` for a photo stored here.
Use full HTTPS URLs for GitHub and LinkedIn profiles.
Use a plain email address for `email`; its icon opens a `mailto:` link.

Until real details are supplied, the four entries use placeholder names and
neutral avatar icons. Empty social URLs render disabled controls; no fake
profiles are linked. Empty or failed images render the avatar fallback.

Add or remove objects in the same array to change the team size. Keep IDs unique.
