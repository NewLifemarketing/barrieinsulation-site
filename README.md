# barrieinsulation-site

Generated site output for **Barrie Insulation Systems**. Served by GitHub Pages.

**Do not edit these files by hand — they are overwritten on every deploy.**

The source lives outside this repo: a Python static generator where `data.py`
holds every word of copy and `build.py` renders it here. To change anything on
the site, edit the source and run `./deploy.sh "message"`, which rebuilds,
runs the checks and pushes this repo.

## Status

This is a **staging deployment**. Until the live domain is confirmed
(`DOMAIN_CONFIRMED` in the source `data.py`):

- every page carries `<meta name="robots" content="noindex, nofollow">`
- `robots.txt` disallows all crawling

That is deliberate. The previous site is still live on the real domain, and an
indexed copy here would compete with it as duplicate content. Flipping
`DOMAIN_CONFIRMED = True` switches indexing on, writes the `CNAME`, and points
canonicals, the sitemap and the schema at the real host.

Outstanding pre-launch items are tracked in `LAUNCH.md` in the source repo.
