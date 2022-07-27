---
layout: post
title:  Static-sites with GH-Pages, Jekyll, Sphinx and ReadTheDocs
excerpt: 
categories: [statis-sites, gh-pages, jekyll, sphinx, readthedocs, github.io]
---

# Github pages

## Jekyll small themes

As easy as adding `remote_theme` inside `_config.yml`, e.g. from [Cayman theme](https://github.com/pages-themes/cayman#usage):
```yaml
remote_theme: pages-themes/cayman@v0.2.0
plugins:
- jekyll-remote-theme
```


* [Github topic jekyll-theme](https://github.com/topics/jekyll-theme)
* [Collection of GitHub Pages themes](https://jekyllthemes.io/github-pages-themes)

## Jekyll full themes

* Fork or use repo template for clean commit history
* E.g. [Reverie theme](https://github.com/login?return_to=%2Famitmerchant1990%2Freverie): fork [repo](https://github.com/amitmerchant1990/reverie/fork) or use [repo template](https://github.com/amitmerchant1990/reverie/generate)

## Gatsby

* [Gatsby's blog starter](https://github.com/gatsbyjs/gatsby-starter-blog)

## Sphinx

* [Sphinx docu](https://www.sphinx-doc.org/en/master/)
* [gh-action sphinx-build](https://github.com/marketplace/actions/sphinx-build)

## ReadTheDocs

* [ReadTheDocs](https://docs.readthedocs.io/en/stable/config-file/v2.html)
* [Builder](https://github.com/readthedocs/readthedocs-build) and [`.readthedocs.yaml`](https://docs.readthedocs.io/en/stable/config-file/v2.html)