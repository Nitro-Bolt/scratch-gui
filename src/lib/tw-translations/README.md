`generated-translations.json` is retained as a TurboWarp translation snapshot.
The sibling NitroBolt `scratch-l10n` repository copies it into its own vendored
translation layer with `pnpm sync:upstream`. GUI no longer imports it directly.
