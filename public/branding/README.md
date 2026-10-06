# Share preview

`homepage-preview.jpg` is an unedited 1192 x 626 screenshot of the opening screen
of https://www.sathsaradahana.live/, captured after loading and dismissing the
results announcement. It is used by Open Graph and Twitter card metadata.

To refresh it after a homepage redesign, capture the opening viewport at the
same dimensions, with the page at the top and any announcement closed. Replace
this file and deploy. The screenshot is static; it does not update automatically.

`node scripts/generate-brand-assets.mjs` rebuilds only the logo icons and leaves
the screenshot unchanged.
