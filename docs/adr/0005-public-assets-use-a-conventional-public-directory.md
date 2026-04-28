# Public Assets use a conventional public directory

Rocket publishes Public Assets from the project-root `public/` directory at stable public URLs in development and static builds. This convention is separate from `resolve(...)` assets, file-output JavaScript Pages, Site Discoverability outputs, and deployment Adapter routes because Site Authors need a low-ceremony way to publish files such as favicon assets, verification files, downloads, and host-specific files without turning them into Pages or generated outputs.

Public Assets are copied or served verbatim, are not transformed or included in the Sitemap, and fail when their public URL collides with a Page or Rocket-generated output. This favors a predictable convention over config-driven mappings for the first slice while preserving room to add explicit configuration later if real projects need nonstandard directories.
