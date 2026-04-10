# Changelog

## v0.4.1 (2026-04-10)

### Bug Fixes
- Fix: ensure icon size controls are initialized after DOM content is loaded (#57)
- Fix: restore icon size on page reload (#57)

### Refactoring
- Refactor: reorganize JS files into src/ directory by feature (#56)
- Refactor(i18n): rename extension name/description keys (#56)
- Refactor(todo): unify date format and update due-date styling (#56)

### Features
- Feat(i18n): add i18n for extension title and description (#56)

### UI Improvements
- Style(ui): center modal placeholder and reposition settings modal
- Style(ui): remove hover transform on todo items
- Style(settings): improve background video handling

### Documentation
- Docs(screenshots): add new screenshots for the new tab interface
- Docs(skills): update gh-pr-review skill documentation
- Docs(skills): update gh-issue and gh-pr skill documentation

### Maintenance
- Chore(icons): update app icons to new resolution
- Feat(ai): add 2-second delay before showing delete-button tooltip
- Feat(app): cache app icons and escape HTML
- Feat(skills): add gh-issue and gh-pr skill modules