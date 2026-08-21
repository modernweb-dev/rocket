---
'@rocket/js': patch
---

Resolve generated Markdown Page rendering, browser assets, and default Icon Library dependencies
through Rocket so Site Authors do not need to install Rocket's transitive dependencies directly and
linked Rocket installations load their modules and styles correctly. Prefer compatible Lit and Web
Awesome packages from the Site Author project to avoid duplicate browser module registrations, and
honor browser ESM package conditions when sharing project dependencies.
