.PHONY: build sitemaps

build: sitemaps

sitemaps:
	node scripts/build-sitemaps.js
